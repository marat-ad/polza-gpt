/**
 * Google Gemini API service for PolzaGPT
 *
 * This service handles natural language processing using Google's Gemini AI models.
 * Primary: gemini-2.0-flash-exp, with fallbacks to gemini-2.0-flash-001 and gemini-1.5-flash-001.
 * Enables the bot to understand user queries in natural language and find matching experts.
 * Implements comprehensive expert matching with intelligent prompt engineering and data parsing.
 */

import { GoogleGenAI } from '@google/genai';
import type { Env } from '../config/env';

/**
 * Google Sheets API response interface
 */
interface SheetsData {
  values?: string[][];
}

/**
 * Finds experts using AI-powered natural language processing
 *
 * This function uses Google's Gemini AI model to process user queries and return relevant expert matches.
 * It sends the raw spreadsheet data to Gemini, which understands the structure and finds matching experts.
 *
 * @param query - The user's natural language query for finding experts
 * @param experts - Expert data from Google Sheets in format { values: [[headers], [row1], [row2], ...] }
 * @param env - Environment configuration containing Google Gemini API key
 * @returns Promise that resolves to the AI-generated response or error message
 */
export async function findExpertsWithAI(query: string, experts: SheetsData, env: Env): Promise<string> {
  try {
    console.log('Initializing Gemini AI service with query:', query);

    // Validate expert data
    if (!experts?.values || experts.values.length < 2) {
      return 'Совпадений не найдено. База данных экспертов недоступна.';
    }

    // Initialize Google Gen AI client with API key
    const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GEMINI_API_KEY });

    // Log available models for debugging
    try {
      const models = await ai.models.list();
      console.log('Available Gemini models:', JSON.stringify(models, null, 2));
    } catch (error) {
      console.log('Could not list models:', error);
    }

    // Create comprehensive expert matching prompt with raw data
    const prompt = createExpertMatchingPrompt(query, experts.values);

    // Try with gemini-2.0-flash-exp first
    try {
      console.log('Sending request to Gemini API (gemini-2.0-flash-exp) for expert matching');
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });
      console.log('Successfully received expert matching response from Gemini API (gemini-2.0-flash-exp)');
      return response.text || 'Не удалось получить ответ от AI.';
    } catch (primaryError: any) {
      // Check if the error is due to overload
      const errorMessage = primaryError?.message || String(primaryError);
      if (errorMessage.includes('overloaded') || errorMessage.includes('503') || errorMessage.includes('not found')) {
        console.log('gemini-2.0-flash-exp failed, falling back to gemini-2.0-flash-001');

        // First fallback: gemini-2.0-flash-001
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: prompt,
          });
          console.log('Successfully received expert matching response from Gemini API (gemini-2.0-flash-001 fallback)');
          return response.text || 'Не удалось получить ответ от AI.';
        } catch (secondaryError: any) {
          const secondaryErrorMessage = secondaryError?.message || String(secondaryError);
          if (secondaryErrorMessage.includes('overloaded') || secondaryErrorMessage.includes('503') || secondaryErrorMessage.includes('not found')) {
            console.log('gemini-2.0-flash-001 also failed, falling back to gemini-1.5-flash-001');

            // Second fallback: gemini-1.5-flash-001
            const response = await ai.models.generateContent({
              model: 'gemini-1.5-flash-001',
              contents: prompt,
            });
            console.log('Successfully received expert matching response from Gemini API (gemini-1.5-flash-001 fallback)');
            return response.text || 'Не удалось получить ответ от AI.';
          }

          // If it's not an overload error, throw it
          throw secondaryError;
        }
      }

      // If it's not an overload error, throw it to be caught by the outer catch
      throw primaryError;
    }
  } catch (error) {
    // Log technical error details for debugging
    console.error('Gemini API error:', error);

    // Return user-friendly error message for any API failures
    return 'Сервис временно недоступен. Пожалуйста, попробуйте позже.';
  }
}

/**
 * Creates a comprehensive prompt for expert matching using Gemini AI
 *
 * @param query - User's natural language query
 * @param spreadsheetData - Raw spreadsheet data with headers in first row
 * @returns Complete prompt string for Gemini AI
 */
function createExpertMatchingPrompt(query: string, spreadsheetData: string[][]): string {
  // Check if user wants to see all results
  const showAllPattern = /\b(show all|give me everyone|list all|покажи все|покажи всех|дай всех|список всех)\b/i;
  const requestShowAll = showAllPattern.test(query);

  // Determine result limit
  const maxResults = requestShowAll ? 20 : 5;

  // Convert spreadsheet data to readable format
  const [headers] = spreadsheetData;
  const dataPreview = `Заголовки: ${headers?.join(' | ') || 'Не найдены'}

Данные (первая строка - заголовки, далее - строки с данными):
${JSON.stringify(spreadsheetData, null, 2)}`;

  return `Ты — ассистент по поиску экспертов в разнообразном сообществе людей с самыми разными интересами и навыками.

Твоя задача: проанализировать запрос пользователя и найти подходящих экспертов из предоставленной базы данных (Google Sheets).

База данных - это таблица, где первая строка содержит заголовки колонок, а остальные строки - данные об экспертах.

Важные правила:
1. ВНИМАТЕЛЬНО изучи заголовки колонок в первой строке, чтобы понять структуру данных
2. Найди колонки с именем (ФИО), годом выпуска, городом, родом деятельности/экспертизой и контактами (телефон)
3. КРИТИЧЕСКИ ВАЖНО: Если в запросе указан конкретный город, верни ТОЛЬКО экспертов из этого города. ИГНОРИРУЙ всех остальных.
4. ВСЕГДА отвечай на том же языке, на котором задан вопрос (русский, английский, смешанный)
5. Верни ПОЛНОЕ отформатированное сообщение для Telegram используя HTML форматирование
6. Максимум результатов: ${maxResults}${requestShowAll ? ' (пользователь запросил показать всех)' : ''}
7. ВСЕГДА начинай сразу со списка экспертов, БЕЗ ВВОДНЫХ ФРАЗ (например, "Найдено много совпадений" и т.п.)
8. Если совпадений нет: "Совпадений не найдено. Попробуйте переформулировать запрос." + ближайшие варианты если возможно
9. ОБЯЗАТЕЛЬНО используй HTML синтаксис: <b>Жирный текст</b> для полей

Формат ответа для каждого эксперта:
<b>Имя:</b> [имя из соответствующей колонки]
<b>Выпуск:</b> [год из соответствующей колонки]
<b>Город:</b> [город из соответствующей колонки]
<b>Контакты:</b> [телефон/контакты из соответствующей колонки]
<b>Экспертиза:</b> [естественное предложение на основе рода деятельности из таблицы]

Добавляй краткое объяснение соответствия ТОЛЬКО когда оно не очевидно.

Запрос пользователя: "${query}"

${dataPreview}

Сгенерируй ГОТОВОЕ сообщение для отправки в Telegram с правильным HTML форматированием:`;
}

/**
 * Google Gemini API service for PolzaGPT
 * 
 * This service handles natural language processing using Google's Gemini AI model (gemini-2.0-flash).
 * Enables the bot to understand user queries in natural language and find matching experts.
 * Implements comprehensive expert matching with intelligent prompt engineering and data parsing.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
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
    
    // Initialize Google Generative AI client with API key
    const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);
    
    // Get the Gemini model (gemini-2.0-flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Create comprehensive expert matching prompt with raw data
    const prompt = createExpertMatchingPrompt(query, experts.values);
    
    console.log('Sending request to Gemini API for expert matching');
    
    // Generate content using the Gemini model
    const result = await model.generateContent(prompt);
    
    // Extract the generated text from the response
    const response = await result.response;
    const generatedText = response.text();
    
    console.log('Successfully received expert matching response from Gemini API');
    
    return generatedText;
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
3. ВСЕГДА отвечай на том же языке, на котором задан вопрос (русский, английский, смешанный)
4. Верни ПОЛНОЕ отформатированное сообщение для Telegram используя Markdown форматирование
5. Максимум результатов: ${maxResults}${requestShowAll ? ' (пользователь запросил показать всех)' : ''}
6. Если найдено больше 5 экспертов (в обычном режиме): начни с "Найдено много совпадений, вот топ-5"
7. Если совпадений нет: "Совпадений не найдено. Попробуйте переформулировать запрос." + ближайшие варианты если возможно
8. ОБЯЗАТЕЛЬНО используй Markdown синтаксис: **Жирный текст** для полей

Формат ответа для каждого эксперта:
**Имя:** [имя из соответствующей колонки]
**Выпуск:** [год из соответствующей колонки]
**Город:** [город из соответствующей колонки]
**Контакты:** [телефон/контакты из соответствующей колонки]
**Экспертиза:** [естественное предложение на основе рода деятельности из таблицы]

Добавляй краткое объяснение соответствия ТОЛЬКО когда оно не очевидно.

Запрос пользователя: "${query}"

${dataPreview}

Сгенерируй ГОТОВОЕ сообщение для отправки в Telegram с правильным Markdown форматированием:`;
}
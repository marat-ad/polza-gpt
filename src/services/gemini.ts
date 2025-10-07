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
 * Expert data interface parsed from Google Sheets
 */
interface Expert {
  name: string;
  graduationYear: string;
  city: string;
  expertise: string;
  contacts: string;
}

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
 * It parses expert data from Google Sheets format and creates a comprehensive prompt for intelligent matching.
 * 
 * @param query - The user's natural language query for finding experts
 * @param experts - Expert data from Google Sheets in format { values: [[headers], [row1], [row2], ...] }
 * @param env - Environment configuration containing Google Gemini API key
 * @returns Promise that resolves to the AI-generated response or error message
 */
export async function findExpertsWithAI(query: string, experts: SheetsData, env: Env): Promise<string> {
  try {
    console.log('Initializing Gemini AI service with query:', query);
    
    // Parse expert data from Google Sheets format to JSON
    const parsedExperts = parseExpertData(experts);
    
    // Initialize Google Generative AI client with API key
    const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);
    
    // Get the Gemini model (gemini-2.0-flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Create comprehensive expert matching prompt
    const prompt = createExpertMatchingPrompt(query, parsedExperts);
    
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
 * Parses expert data from Google Sheets format to structured JSON
 * 
 * @param sheetsData - Raw Google Sheets API response
 * @returns Array of parsed expert objects
 */
function parseExpertData(sheetsData: SheetsData): Expert[] {
  if (!sheetsData?.values || sheetsData.values.length < 2) {
    console.warn('No expert data available or invalid format');
    return [];
  }

  const [headers, ...rows] = sheetsData.values;
  
  // TypeScript safety check for headers
  if (!headers) {
    console.warn('Headers row is missing from expert data');
    return [];
  }
  
  // Find column indices (case-insensitive matching)
  const getColumnIndex = (columnName: string): number => {
    return headers.findIndex(header => 
      header?.toLowerCase().includes(columnName.toLowerCase())
    );
  };

  const nameIndex = getColumnIndex('name') >= 0 ? getColumnIndex('name') : getColumnIndex('имя');
  const graduationIndex = getColumnIndex('graduation') >= 0 ? getColumnIndex('graduation') : getColumnIndex('выпуск');
  const cityIndex = getColumnIndex('city') >= 0 ? getColumnIndex('city') : getColumnIndex('город');
  const expertiseIndex = getColumnIndex('expertise') >= 0 ? getColumnIndex('expertise') : getColumnIndex('экспертиза');
  const contactsIndex = getColumnIndex('contacts') >= 0 ? getColumnIndex('contacts') : getColumnIndex('контакты');

  // Parse each row into Expert object
  return rows
    .filter(row => row && row.length > 0 && row[nameIndex]?.trim()) // Filter out empty rows
    .map(row => ({
      name: row[nameIndex]?.trim() || 'Не указано',
      graduationYear: row[graduationIndex]?.trim() || 'Не указан',
      city: row[cityIndex]?.trim() || 'Не указан',
      expertise: row[expertiseIndex]?.trim() || 'Не указана',
      contacts: row[contactsIndex]?.trim() || 'Не указаны'
    }));
}

/**
 * Creates a comprehensive prompt for expert matching using Gemini AI
 * 
 * @param query - User's natural language query
 * @param experts - Array of parsed expert data
 * @returns Complete prompt string for Gemini AI
 */
function createExpertMatchingPrompt(query: string, experts: Expert[]): string {
  // Check if user wants to see all results
  const showAllPattern = /\b(show all|give me everyone|list all|покажи все|покажи всех|дай всех|список всех)\b/i;
  const requestShowAll = showAllPattern.test(query);
  
  // Determine result limit
  const maxResults = requestShowAll ? 20 : 5;
  
  return `Ты — ассистент по поиску экспертов в разнообразном сообществе людей с самыми разными интересами и навыками.

Твоя задача: проанализировать запрос пользователя и найти подходящих экспертов из предоставленной базы данных.

Важные правила:
1. ВСЕГДА отвечай на том же языке, на котором задан вопрос (русский, английский, смешанный)
2. Верни ПОЛНОЕ отформатированное сообщение для Telegram (Markdown)
3. Максимум результатов: ${maxResults}${requestShowAll ? ' (пользователь запросил показать всех)' : ''}
4. Если найдено больше 5 экспертов (в обычном режиме): начни с "Найдено много совпадений, вот топ-5"
5. Если совпадений нет: "Совпадений не найдено. Попробуйте переформулировать запрос." + ближайшие варианты если возможно

Формат ответа для каждого эксперта:
**Имя:** [имя]
**Выпуск:** [год выпуска]
**Город:** [город]
**Контакты:** [контакты]
**Экспертиза:** [естественное предложение описывающее область знаний]

Добавляй краткое объяснение соответствия ТОЛЬКО когда оно не очевидно.

Запрос пользователя: "${query}"

База данных экспертов (JSON):
${JSON.stringify(experts, null, 2)}

Сгенерируй ГОТОВОЕ сообщение для отправки в Telegram:`;
}
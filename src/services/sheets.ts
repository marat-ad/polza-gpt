/**
 * Google Sheets API service for PolzaGPT
 * 
 * This service handles fetching data from Google Sheets using the Google Sheets API v4.
 * Currently implements basic data fetching without caching or comprehensive error handling.
 */

import { google } from 'googleapis';
import type { Env } from '../config/env';

/**
 * Custom error class for Google Sheets API failures
 * Used to provide user-friendly error messages while preserving technical details for logging
 */
export class SheetsUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SheetsUnavailableError';
  }
}

/**
 * Gets expert data with KV caching (1-hour TTL)
 * 
 * @param env - Environment configuration containing Google Sheets credentials and KV namespace
 * @returns Expert data (either from cache or fresh from API)
 */
export async function getExpertData(env: Env) {
  // Check cache first
  const cached = await env.EXPERTS_KV.get("experts_data");
  if (cached) {
    const parsedCache = JSON.parse(cached);
    const age = Date.now() - parsedCache.timestamp;
    if (age < 3600000) { // 1 hour in milliseconds
      console.log("Cache hit - returning cached data");
      return parsedCache.data;
    }
    console.log("Cache expired - fetching fresh data");
  } else {
    console.log("Cache miss - fetching fresh data");
  }

  // Fetch fresh data from Google Sheets API
  const freshData = await fetchFromGoogleSheets(env);
  
  // Store in cache with timestamp
  // Handle KV write failures gracefully - log error but continue with fresh data
  try {
    await env.EXPERTS_KV.put("experts_data", JSON.stringify({
      timestamp: Date.now(),
      data: freshData
    }));
  } catch (error) {
    // Log KV write failure but don't crash - we still have the data
    console.error('Failed to write to KV cache:', error);
  }
  
  return freshData;
}

/**
 * Fetches data from Google Sheets using the configured service account credentials
 * 
 * @param env - Environment configuration containing Google Sheets credentials
 * @returns Raw Google Sheets API response data
 * 
 * Note: This function is now used internally by getExpertData for cache misses.
 * Comprehensive error handling will be added in Slice 4.
 */
async function fetchFromGoogleSheets(env: Env) {
  try {
    // Parse the service account credentials from environment variable
    const credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // Configure JWT authentication with service account credentials
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    // Initialize Google Sheets API client
    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from the first sheet
    // By not specifying a range, it will automatically use the first sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: 'A:Z', // Fetch columns A through Z from the first sheet
    });

    // Return raw API response data
    // This contains the actual values from the spreadsheet in the format:
    // { values: [["Header1", "Header2", ...], ["Row1Col1", "Row1Col2", ...], ...] }
    return response.data;
  } catch (error) {
    // Log technical details for debugging
    console.error('Google Sheets API error:', error);
    // Throw user-friendly error
    throw new SheetsUnavailableError('Unable to access Google Sheets');
  }
}
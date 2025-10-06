/**
 * Environment configuration interface for PolzaGPT
 * 
 * This interface defines the environment variables required for the application,
 * particularly for Google Sheets API integration.
 */

export interface Env {
  /**
   * Google Sheets document ID
   * This is the unique identifier for the spreadsheet containing expert data
   * Example: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
   */
  GOOGLE_SHEET_ID: string;

  /**
   * Google Service Account credentials in JSON format
   * This should be a stringified JSON object containing the service account key
   * downloaded from Google Cloud Console
   */
  GOOGLE_SERVICE_ACCOUNT_KEY: string;

  /**
   * KV namespace for caching expert data
   * Used to store cached Google Sheets data with 1-hour TTL
   */
  EXPERTS_KV: KVNamespace;
}
/**
 * PolzaGPT - Telegram bot for finding experts from Google Sheets database
 *
 * This is the main entry point for the Cloudflare Worker.
 * Currently implements basic Google Sheets data fetching functionality.
 * Future slices will add caching, error handling, and Telegram bot integration.
 */

import type { Env } from './config/env';
import { getExpertData, SheetsUnavailableError } from './services/sheets';
import { getTelegramWebhookHandler } from './services/telegram';

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    
    // Basic health check endpoint
    if (url.pathname === '/health') {
      return new Response('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Telegram webhook endpoint
    if (url.pathname === '/webhook' && request.method === 'POST') {
      try {
        const webhookHandler = getTelegramWebhookHandler(env);
        return await webhookHandler(request);
      } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Webhook error', { status: 500 });
      }
    }

    // Google Sheets data endpoint
    if (url.pathname === '/data' || url.pathname === '/experts') {
      try {
        const data = await getExpertData(env);
        return new Response(JSON.stringify(data, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (error) {
        if (error instanceof SheetsUnavailableError) {
          return new Response(JSON.stringify({
            error: "⚠️ Unable to access the expert database. Please try again later."
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        // Handle unexpected errors
        console.error('Unexpected error:', error);
        return new Response(JSON.stringify({
          error: "⚠️ Unable to access the expert database. Please try again later."
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // Default response for all other requests
    return new Response('Hello from PolzaGPT!', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  },
};


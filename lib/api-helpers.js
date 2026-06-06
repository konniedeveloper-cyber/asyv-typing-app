import { NextResponse } from 'next/server';

/**
 * Create a consistent JSON API response
 * Ensures proper headers and serialization
 */
export function jsonResponse(data, status = 200) {
  const response = new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
  return response;
}

/**
 * Wrapper for API handlers to ensure proper error handling and JSON responses
 */
export function withErrorHandling(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('[API ERROR]', error);
      return jsonResponse(
        { 
          error: 'Internal server error',
          details: error.message || 'Unknown error',
          timestamp: new Date().toISOString()
        },
        500
      );
    }
  };
}

/**
 * Serialize Prisma objects for JSON response
 * Converts Date objects to ISO strings
 */
export function serializeForJSON(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeForJSON(item));
  }
  
  if (typeof obj === 'object') {
    const serialized = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeForJSON(value);
    }
    return serialized;
  }
  
  return obj;
}

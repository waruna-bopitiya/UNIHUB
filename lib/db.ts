import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Retry logic for transient failures
export async function sqlWithRetry<T>(
  query: (...args: any[]) => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await query()
    } catch (error: any) {
      lastError = error
      console.warn(
        `Database query attempt ${attempt}/${maxRetries} failed:`,
        error.message
      )
      
      // Don't retry on validation errors
      if (error.message?.includes('validation') || error.message?.includes('constraint')) {
        throw error
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

// Database configuration
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Only load .env file for local development (not on Railway)
if (!process.env.RAILWAY_ENVIRONMENT) {
  dotenv.config({ path: join(__dirname, '../../../.env') })
}

// Railway provides these directly - no .env file needed on production
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('DEBUG - supabaseUrl:', supabaseUrl ? 'EXISTS' : 'MISSING')
console.log('DEBUG - supabaseServiceKey:', supabaseServiceKey ? 'EXISTS' : 'MISSING')

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(`Missing Supabase credentials - URL: ${supabaseUrl ? 'EXISTS' : 'MISSING'}, KEY: ${supabaseServiceKey ? 'EXISTS' : 'MISSING'}`)
}

// Create Supabase client with service role key for server operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Test database connection
export async function testConnection() {
  try {
    // Try the simplest possible query first
    const { data, error } = await supabase
      .from('campaigns')
      .select('id')
      .limit(1)

    if (error) {
      console.error('SUPABASE ERROR DETAILS:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

    console.log('✅ Supabase connection successful, got data:', data)
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed FULL ERROR:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    })
    return false
  }
}
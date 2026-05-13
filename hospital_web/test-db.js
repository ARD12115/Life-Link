import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
console.log('DATABASE_URL:', connectionString ? 'Loaded' : 'Not found')
console.log('Testing database connection...')

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable not found')
  process.exit(1)
}

const sql = postgres(connectionString)

try {
  const result = await sql`SELECT 1 as test`
  console.log('✅ Database connection successful:', result)
} catch (error) {
  console.error('❌ Database connection failed:', error.message)
  console.error('Full error:', error)
} finally {
  await sql.end()
}
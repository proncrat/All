import dotenv from 'dotenv'
dotenv.config()

import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'
import { username } from 'better-auth/plugins'
import { generateProfile } from '../database'
import { Pool } from 'pg'

const isProd = process.env.NODE_ENV === 'production'

console.log(isProd)

const getAdapter = () => {
  if (isProd) {
    try {
      return new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
      })
    } catch (err) {
      console.error('Caught error:', err)
    }
  } else {
    return new Database('./server/lib/sqlite.db')
  }
}

export const auth = betterAuth({
  database: getAdapter(),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
  trustedOrigins: ['http://localhost:5173'],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await generateProfile(user.name, user.id)
          } catch (err) {
            // Log but don't throw — avoids breaking the signup flow
            console.error('Secondary DB insert failed:', err)
          }
        },
      },
    },
  },
})

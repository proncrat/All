import dotenv from 'dotenv'
dotenv.config()

import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'
import { username } from 'better-auth/plugins'
import { generateProfile } from '../database'

export const auth = betterAuth({
  database: new Database('./server/lib/sqlite.db'),
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

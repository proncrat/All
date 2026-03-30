import dotenv from 'dotenv'
dotenv.config()

import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'

export const auth = betterAuth({
  database: new Database('./server/lib/sqlite.db'),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
})

import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: 'http://localhost:3000',
})

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

//process.env.BETTER_AUTH_URL

export const { signIn, signUp, signOut, useSession, updateUser, deleteUser } =
  authClient

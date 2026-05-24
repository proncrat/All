import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../lib/auth'

export const authMiddleware = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers), // Convert headers to the format Better Auth expects
  })

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  // Attach session data to res.locals for use in later routes
  res.locals.session = session
  next()
}

//router.use(authMiddleware) use this to protect routes

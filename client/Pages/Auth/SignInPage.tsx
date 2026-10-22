import { signIn } from '@/lib/auth'
import { useId, useState } from 'react'
import { Link } from 'react-router'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

type FieldErrors = { email?: string; password?: string }

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const emailId = useId()
  const passwordId = useId()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return

    const data = new FormData(e.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const rememberMe = data.get('rememberMe') === 'on'

    // client-side checks so obvious mistakes don't need a round trip
    const errors: FieldErrors = {}
    if (!email) errors.email = 'Enter your email address.'
    else if (!/^\S+@\S+\.\S+$/.test(email))
      errors.email = 'Enter a valid email address.'
    if (!password) errors.password = 'Enter your password.'

    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length) return

    setIsLoading(true)
    await signIn.email(
      { email, password, rememberMe, callbackURL: '/' },
      {
        onError: (ctx) => {
          setIsLoading(false)
          // 401/403 etc: don't reveal whether the email exists
          setFormError(
            ctx.error.status === 401 || ctx.error.status === 403
              ? 'Incorrect email or password.'
              : ctx.error.message || 'Something went wrong. Try again.',
          )
        },
      },
    )
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-md bg-zinc-950 px-3 py-2.5 text-sm outline-none transition-colors
     border placeholder:text-zinc-600
     ${
       hasError
         ? 'border-red-500/70 focus:border-red-400'
         : 'border-zinc-800 hover:border-zinc-600 focus:border-zinc-300'
     }`

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-black p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Welcome back. Enter your details to continue.
        </p>

        {/* announced to screen readers when it appears */}
        <div role="alert" aria-live="assertive">
          {formError && (
            <p className="mt-5 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {formError}
            </p>
          )}
        </div>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor={emailId} className="text-sm text-zinc-300">
              Email
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClass(!!fieldErrors.email)}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={
                fieldErrors.email ? `${emailId}-err` : undefined
              }
              onChange={() =>
                fieldErrors.email &&
                setFieldErrors((f) => ({ ...f, email: undefined }))
              }
            />
            {fieldErrors.email && (
              <p id={`${emailId}-err`} className="text-xs text-red-400">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={passwordId} className="text-sm text-zinc-300">
              Password
            </label>
            <div className="relative">
              <input
                id={passwordId}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                className={`${inputClass(!!fieldErrors.password)} pr-11`}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? `${passwordId}-err` : undefined
                }
                onChange={() =>
                  fieldErrors.password &&
                  setFieldErrors((f) => ({ ...f, password: undefined }))
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p id={`${passwordId}-err`} className="text-xs text-red-400">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-zinc-300 select-none">
            <input
              type="checkbox"
              name="rememberMe"
              defaultChecked
              className="size-4 cursor-pointer accent-white"
            />
            Remember me
          </label>

          {/* same button the whole time, so the layout never jumps */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-white py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && (
              <span
                aria-hidden
                className="size-4 animate-spin rounded-full border-2 border-black/30 border-t-black motion-reduce:animate-none"
              />
            )}
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don’t have an account?{' '}
          <Link
            to="/signup"
            className="text-white underline-offset-4 hover:underline focus-visible:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

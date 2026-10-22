import { signUp } from '@/lib/auth'
import { useId, useState } from 'react'
import { Link } from 'react-router'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'

type Errors = Partial<
  Record<'name' | 'username' | 'email' | 'password', string>
>

const MIN_PASSWORD = 8

function Field({
  label,
  hint,
  error,
  onEdit,
  children,
}: {
  label: string
  hint?: string
  error?: string
  onEdit?: () => void
  // render-prop so the input gets the generated id and aria props
  children: (p: {
    id: string
    className: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
    onChange: () => void
  }) => React.ReactNode
}) {
  const id = useId()
  const descId = `${id}-desc`
  const className = `w-full rounded-md bg-zinc-950 px-3 py-2.5 text-sm outline-none transition-colors border placeholder:text-zinc-600 ${
    error
      ? 'border-red-500/70 focus:border-red-400'
      : 'border-zinc-800 hover:border-zinc-600 focus:border-zinc-300'
  }`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-zinc-300">
        {label}
      </label>
      {children({
        id,
        className,
        'aria-invalid': !!error,
        'aria-describedby': error || hint ? descId : undefined,
        onChange: () => error && onEdit?.(),
      })}
      {(error || hint) && (
        <p
          id={descId}
          className={`text-xs ${error ? 'text-red-400' : 'text-zinc-500'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  const clear = (key: keyof Errors) => () =>
    setErrors((e) => ({ ...e, [key]: undefined }))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return

    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const username = String(data.get('username') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')

    const next: Errors = {}
    if (!name) next.name = 'Enter your name.'
    if (!username) next.username = 'Choose a username.'
    else if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username))
      next.username = 'Use 3–30 letters, numbers, underscores or periods.'
    if (!email) next.email = 'Enter your email address.'
    else if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Choose a password.'
    else if (password.length < MIN_PASSWORD)
      next.password = `Use at least ${MIN_PASSWORD} characters.`

    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setIsLoading(true)
    await signUp.email(
      { email, password, name, username, callbackURL: '/' },
      {
        onError: (ctx) => {
          setIsLoading(false)
          const msg: string = ctx.error.message || ''
          const lower = msg.toLowerCase()

          // put server errors next to the field they're about when we can tell
          if (lower.includes('username')) {
            setErrors({ username: 'That username is already taken.' })
          } else if (lower.includes('email') || ctx.error.status === 422) {
            setErrors({ email: 'An account with this email already exists.' })
          } else {
            setFormError(msg || 'Something went wrong. Try again.')
          }
        },
      },
    )
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-black p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-500">It only takes a minute.</p>

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
          <Field label="Name" error={errors.name} onEdit={clear('name')}>
            {(p) => (
              <input
                {...p}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
              />
            )}
          </Field>

          <Field
            label="Username"
            hint="Letters, numbers, underscores and periods."
            error={errors.username}
            onEdit={clear('username')}
          >
            {(p) => (
              <input
                {...p}
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="username"
              />
            )}
          </Field>

          <Field label="Email" error={errors.email} onEdit={clear('email')}>
            {(p) => (
              <input
                {...p}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            )}
          </Field>

          <Field
            label="Password"
            hint={`At least ${MIN_PASSWORD} characters.`}
            error={errors.password}
            onEdit={clear('password')}
          >
            {(p) => (
              <div className="relative">
                <input
                  {...p}
                  className={`${p.className} pr-11`}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Choose a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-zinc-500 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
              </div>
            )}
          </Field>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md bg-white py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && (
              <span
                aria-hidden
                className="size-4 animate-spin rounded-full border-2 border-black/30 border-t-black motion-reduce:animate-none"
              />
            )}
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="text-white underline-offset-4 hover:underline focus-visible:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

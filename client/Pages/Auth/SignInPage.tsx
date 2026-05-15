import { signIn } from '@/lib/auth'
import { Link } from 'react-router'

export function SignInForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    await signIn.email({
      email: form.username.value,
      password: form.password.value,
      rememberMe: true,
      callbackURL: '/',
    })
  }

  return (
    <div className="flex h-[95vh] items-center justify-center">
      <div className="border rounded-lg p-4 flex flex-col gap-2 ">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            className="p-2 border-b"
            name="username"
            type="email"
            placeholder="Email"
          />
          <input
            className="p-2 border-b"
            name="password"
            type="password"
            placeholder="Password"
          />
          <button
            className="transition-all cursor-pointer hover:[box-shadow:0px_0px_4px_1px_rgba(255,255,255,0.74)_inset] rounded-sm p-1"
            type="submit"
          >
            Sign In
          </button>
        </form>
        <Link to={'/signup'}>Signup page</Link>
      </div>
    </div>
  )
}

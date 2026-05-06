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
    <div>
      <form onSubmit={handleSubmit}>
        <input name="username" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Sign In</button>
      </form>
      <Link to={'/signup'}>Signup page?</Link>
    </div>
  )
}

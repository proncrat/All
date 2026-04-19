import { signUp } from '@/lib/auth'

export function SignUpForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    await signUp.email({
      email: form.email.value,
      password: form.password.value,
      name: form.name.value,
      username: form.username.value,
      callbackURL: '/dashboard',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" placeholder="Name" />
      <input name="username" type="text" placeholder="username" />
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Sign Up</button>
    </form>
  )
}

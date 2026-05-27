import { signUp } from '@/lib/auth'
import { useState } from 'react'

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const form = e.currentTarget
    await signUp.email(
      {
        email: form.email.value,
        password: form.password.value,
        name: form.name.value,
        username: form.username.value,
        callbackURL: '/',
      },
      {
        onError: (error) => {
          console.log(error)
          setIsLoading(false) // Reset on error
        },
      },
    )
  }

  return (
    <div className="flex h-[95vh] items-center justify-center">
      <div className="border rounded-lg p-4 flex flex-col gap-2 ">
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            className="p-2 border-b"
            name="name"
            type="text"
            placeholder="Name"
          />
          <input
            className="p-2 border-b"
            name="username"
            type="text"
            placeholder="username"
          />
          <input
            className="p-2 border-b"
            name="email"
            type="email"
            placeholder="Email"
          />
          <input
            className="p-2 border-b"
            name="password"
            type="password"
            placeholder="Password"
          />

          {!isLoading ? (
            <button
              className="transition-all cursor-pointer hover:[box-shadow:0px_0px_4px_1px_rgba(255,255,255,0.74)_inset] rounded-sm p-1"
              type="submit"
            >
              Sign Up
            </button>
          ) : (
            <p>Thinking...</p>
          )}
        </form>
      </div>
    </div>
  )
}

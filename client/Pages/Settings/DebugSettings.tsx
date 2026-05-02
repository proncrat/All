import { useSession } from '@/lib/auth'

export function SettingsDebug() {
  const { data: session, isPending } = useSession()
  if (isPending) {
    return <p>Loads</p>
  }

  if (session) {
    console.log(session.user)
    const userdata = session.user
    return (
      <div className="m-7">
        <h1 className="text-3xl">Account Info DEBUG</h1>
        <p>id: {userdata.id}</p>
        <p>Creation date: {userdata.createdAt.getFullYear()}</p>
        <p>Updated at: {userdata.updatedAt.getDay()}</p>
        <p>email: {userdata.email}</p>
        <p>emailVerified: {userdata.emailVerified}</p>
        <p>name: {userdata.name}</p>
        <p>username: {userdata.username}</p>
        <p>image: {userdata.image}</p>
      </div>
    )
  } else {
    return <p>Chat is he signed in?</p>
  }
}

import { Link, useRouteError } from 'react-router'

export default function NotFound() {
  const error = useRouteError()

  return (
    <div className="m-10">
      <h1 className="text-3xl">404</h1>
      <p className="mb-5">You are retarded</p>
      {error?.statusText && (
        <p>
          <i>{error.statusText}</i>
        </p>
      )}
      <Link to="/">Go back home</Link>
    </div>
  )
}

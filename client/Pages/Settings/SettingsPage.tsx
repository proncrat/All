import { Outlet } from 'react-router'
import { NavLink } from 'react-router'

export function SettingsPage() {
  return (
    <div className="center_small">
      <div className="m-7 ">
        <div className="flex gap-30">
          <div className="flex flex-col">
            <h2 className="text-3xl mb-5">Settings</h2>
            <NavLink
              end
              to="/settings"
              className="text-gray-500 hover:text-blue-500 [&.active]:text-blue-600 [&.active]:font-bold"
            >
              Debug
            </NavLink>
            <NavLink
              end
              to="customize"
              className="text-gray-500 hover:text-blue-500 [&.active]:text-blue-600 [&.active]:font-bold"
            >
              Customize
            </NavLink>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

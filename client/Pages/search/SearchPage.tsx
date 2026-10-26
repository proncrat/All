import { Link } from 'react-router'
import { useProfileAll } from '../../hooks'
import { profile } from '@/client/models/profile'
import { useMemo, useState } from 'react'
import Headerbutton from '../Util/Headerbutton'

type SortOption = 'newest' | 'oldest' | 'followers' | 'name'

interface Settings {
  sort: SortOption
  minFollowers: number
  onlyWithDescription: boolean
}

const defaultSettings: Settings = {
  sort: 'newest',
  minFollowers: 0,
  onlyWithDescription: false,
}

function AdvancedSettings({
  settings,
  setSettings,
}: {
  settings: Settings
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
}) {
  return (
    <aside
      className="hidden lg:block w-64 shrink-0 self-start sticky top-20
    max-h-[calc(100vh-6rem)] overflow-y-auto
    border border-zinc-800 rounded-xl p-4 shadow-[0px_0px_8px_0px_#ffffff17]"
    >
      <h2 className="text-base font-semibold text-white mb-4">
        Advanced settings
      </h2>

      <div className="flex flex-col gap-4 text-sm">
        <label className="flex flex-col gap-1 text-neutral-300">
          Sort by
          <select
            value={settings.sort}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                sort: e.target.value as SortOption,
              }))
            }
            className="bg-black border border-zinc-700 rounded-md px-2 py-1
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <option value="newest">Newest to oldest</option>
            <option value="oldest">Oldest to newest</option>
            <option value="followers">Most followers</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-neutral-300">
          Minimum followers
          <input
            type="number"
            min={0}
            value={settings.minFollowers}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                minFollowers: Math.max(0, Number(e.target.value) || 0),
              }))
            }
            className="bg-black border border-zinc-700 rounded-md px-2 py-1
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          />
        </label>

        <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.onlyWithDescription}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                onlyWithDescription: e.target.checked,
              }))
            }
            className="accent-white"
          />
          Only with a description
        </label>

        <button
          onClick={() => setSettings(defaultSettings)}
          className="mt-2 px-2 py-1 rounded-sm border-2 border-transparent
            hover:border-white transition-colors cursor-pointer text-neutral-300"
        >
          Reset
        </button>
      </div>
    </aside>
  )
}

function Search() {
  const [searchoption, setsearchoption] = useState('Everything')
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  const { data, isPending, isError, isSuccess } = useProfileAll()

  function clickhandler(e: React.MouseEvent<HTMLElement>) {
    setsearchoption(e.currentTarget.textContent ?? 'Everything')
  }

  const options = [
    'Everything',
    'Profiles',
    'Videos',
    'Posts',
    'Songs',
    'Photos',
    'Playlists',
  ]

  const visibleProfiles = useMemo(() => {
    if (!data) return []

    const filtered = data.filter((p: profile) => {
      if (p.followers < settings.minFollowers) return false
      if (settings.onlyWithDescription && !p.description?.trim()) return false
      return true
    })

    // copy before sorting so we never mutate the query cache
    return [...filtered].sort((a: profile, b: profile) => {
      switch (settings.sort) {
        case 'oldest':
          return Number(a.id) - Number(b.id)
        case 'newest':
          return Number(b.id) - Number(a.id)
        case 'followers':
          return b.followers - a.followers
        case 'name':
          return a.name.localeCompare(b.name)
      }
    })
  }, [data, settings])

  return (
    <div className="h-full">
      <div
        className="w-full border-b border-zinc-800 flex gap-2 px-4 py-2
    overflow-x-auto overflow-y-hidden whitespace-nowrap
    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
    snap-x snap-proximity overscroll-x-contain"
      >
        {options.map((text) => (
          <div key={text} className="shrink-0 snap-start">
            <Headerbutton
              click={clickhandler}
              activething={searchoption}
              text={text}
            />
          </div>
        ))}
      </div>

      <div className="max-w-7xl m-auto p-4 flex gap-6 items-start">
        <AdvancedSettings settings={settings} setSettings={setSettings} />

        <div className="flex-1 min-w-0">
          {isPending && <div>Loading...</div>}
          {isError && <div>Something went wrong</div>}
          {isSuccess && visibleProfiles.length === 0 && (
            <div className="text-neutral-400">No profiles match.</div>
          )}

          {isSuccess &&
            visibleProfiles.map((profile: profile) => (
              <Link
                key={profile.id}
                className="mb-4 group flex border border-zinc-800 rounded-xl p-2 shadow-[0px_0px_8px_0px_#ffffff17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:bg-position-[100%_30%] hover:bg-position-[100%_50%] bg-linear-to-br [&.active]:bg-position-[100%_70%] from-black from-60% to-slate-600 bg-size-[200%_200%] bg-position-[100%_0%] transition-all"
                to={`/profile/${profile.id}`}
              >
                <div className="flex gap-6">
                  <img
                    className="rounded-xl aspect-square w-30"
                    alt="A THUMBNAIL"
                    src={profile.pfp}
                  />
                  <div className="mt-2">
                    <p className="truncate text-base font-semibold text-white">
                      {profile.name}
                    </p>
                    <div className="flex gap-3">
                      <p className="truncate text-sm text-neutral-400">
                        @{profile.id}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {profile.followers} follower
                      </p>
                      <p className="text-sm text-neutral-500">
                        {profile.following} following
                      </p>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-300">
                      {profile.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Search

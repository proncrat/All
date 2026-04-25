import { InputGroup, InputGroupInput } from '@/components/ui/input-group'

export function SettingsCustomize() {
  return (
    <div className="m-7">
      <h1 className="text-3xl mb-6">Customize Stuff</h1>
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl">Profile</h2>
        <div>
          <p className="mb-1">Name</p>
          <InputGroup>
            <InputGroupInput
              spellCheck="false"
              type="text"
              autoComplete="off"
              name="query"
            />
          </InputGroup>
        </div>
        <div>
          <p className="mb-1">Describe</p>
          <InputGroup>
            <InputGroupInput
              spellCheck="false"
              type="text"
              autoComplete="off"
              name="query"
            />
          </InputGroup>
        </div>
        <div>
          <p className="mb-1">Description</p>
          <InputGroup>
            <InputGroupInput
              spellCheck="false"
              type="text"
              autoComplete="off"
              name="query"
            />
          </InputGroup>
        </div>

        <p>Links</p>
        <p>Pfp</p>
        <p>Bg</p>
        <p>Banner</p>
      </div>
    </div>
  )
}

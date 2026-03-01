interface prof {
  name: string
}

function ProfileTopSection(props: prof) {
  return (
    <div className="flex">
      <img
        alt="pfp"
        src="https://images.pexels.com/photos/14653174/pexels-photo-14653174.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />
      <div>
        <h2>{props.name}</h2>
        <p>15 followers</p>
      </div>
    </div>
  )
}

export default ProfileTopSection

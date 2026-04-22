export function PostCard(props) {
  return (
    <div className="rounded-xl bg-[#0a0a0a] p-4 ">
      <h2 className="text-2xl mb-2">{props.title}</h2>
      <p className="mb-2">{props.the_post}</p>
      <p>{new Date(props.post_date).toLocaleDateString()}</p>
    </div>
  )
}

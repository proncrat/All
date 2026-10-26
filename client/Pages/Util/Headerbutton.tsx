interface sublinks {
  text: string
  activething: string
  click: (e: React.MouseEvent<HTMLElement>) => void
}

export default function Headerbutton({ text, activething, click }: sublinks) {
  const isActive = text === activething

  return (
    <button
      onClick={click}
      className={`px-2 py-1 rounded-sm cursor-pointer border-2 transition-colors
        [-webkit-tap-highlight-color:transparent] focus:outline-none
        ${
          isActive ? 'border-white' : 'border-transparent hover:text-[#8d8d8d]'
        }`}
    >
      {text}
    </button>
  )
}

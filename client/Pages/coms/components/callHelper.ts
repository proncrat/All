import { prominent } from 'color.js'

export const handleImageLoad = async (event) => {
  //console.log('Image loaded successfully!', event.target)
  const color = await prominent(event.target, {
    format: 'hex',
  })
  //console.log(event.target.parent)
  event.target.parentElement.style.backgroundColor = color[0]
}

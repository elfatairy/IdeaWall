export const stickynoteColors = [
  '#c0e2e1',
  '#e3ebc6',
  '#fee8b9',
  '#ffc4c6',
  '#ffd179',
  '#ff7c81',
  '#ebbfe3',
  '#d0cef3',
  '#b3d9ec',
  '#9d9add',
  '#7ac3e6',
  '#97cfc6',
  '#c6d67d',
  '#aacc04',
  '#feea00',
  '#ffab00',
  '#e33036',
  '#d986cc',
  '#a72995',
  '#625bb8',
  '#1195dd',
  '#16b098'
]

export const getTextColor = (color: string) => {
  const [r, g, b] = color.match(/\w\w/g)?.map((c) => parseInt(c, 16)) || [0, 0, 0]
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

export const getRandomColor = () => {
  return stickynoteColors[Math.floor(Math.random() * stickynoteColors.length)]
}

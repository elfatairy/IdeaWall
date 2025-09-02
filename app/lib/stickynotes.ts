export const stickynoteColors = {
  '#c0e2e1': 'Columbia Blue',
  '#e3ebc6': 'Dirty White',
  '#fee8b9': 'Banana Mania',
  '#ffc4c6': 'Pink',
  '#ffd179': 'Topaz',
  '#ff7c81': 'Congo Pink',
  '#ebbfe3': 'Queen Pink',
  '#d0cef3': 'Soap',
  '#b3d9ec': 'Light Blue',
  '#9d9add': 'Blue Bell',
  '#7ac3e6': 'Aero',
  '#97cfc6': 'Middle Blue Green',
  '#c6d67d': 'Medium Spring Bud',
  '#aacc04': 'Vivid Lime Green',
  '#feea00': 'Middle Yellow',
  '#ffab00': 'Chrome Yellow',
  '#e33036': 'Alizarin Crimson',
  '#d986cc': 'Deep Mauve',
  '#a72995': 'Fandango',
  '#625bb8': 'Blue-Violet (Crayola)',
  '#1195dd': 'Rich Electric Blue',
  '#16b098': 'Light Sea Green'
}

export const allowedReactions = {
  Like: '👍',
  Dislike: '👎',
  Love: '❤️',
  Laugh: '😂',
  Sad: '😢',
  Happy: '😊'
}

export const getTextColor = (color: string) => {
  const [r, g, b] = color.match(/\w\w/g)?.map((c) => parseInt(c, 16)) || [0, 0, 0]
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

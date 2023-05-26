const BOX_COLOR = '#00FFFF'
const TEXT_COLOR = '#000000'

export const establishDimensions = ({ video, canvas })=> {
  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight
  video.width = videoWidth
  video.height = videoHeight
  canvas.width = videoWidth
  canvas.height = videoHeight
}

export const detectObjects = async ({ model, video }) => {
  if (!model || !video) return
  const predictions = await model.detect(video)
  return predictions
}

export const drawBoxes = ({ predictions, canvas }) => {
  const ctx = canvas.getContext('2d')
  // Reset the canvas from previous shit
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // Establish the font
  ctx.font = '16px sans-serif'
  ctx.textBaseline = 'top'
  // Draw each prediction
  predictions.forEach(prediction => {
    const [x, y, width, height] = prediction.bbox
    // Draw a rectangle around the prediction area
    ctx.strokeStyle = BOX_COLOR
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)
    // Draw a smaller box on the top-left for the text
    ctx.fillStyle = BOX_COLOR
    const textWidth = ctx.measureText(prediction.class).width
    const textHeight = 16
    ctx.fillRect(x, y, textWidth + 6, textHeight + 4)
    // Draw the text
    ctx.fillStyle = TEXT_COLOR
    ctx.fillText(prediction.class, x+2, y+1)
  })
}
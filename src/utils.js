const BOX_COLOR = '#00FFFF'
const TEXT_COLOR = '#000000'

const STATUS = [ '🔴', '🟠', '🟡', '🟢' ]

export const establishDimensions = ({ video, canvas })=> {
  // Determine the max video size regarding clientWidth and clientHeight
  const horizontalRatio = video.clientWidth / video.videoWidth;
  const verticalRatio = video.clientHeight / video.videoHeight;
  const ratio = Math.max(horizontalRatio, verticalRatio);
  // Apply the ratio to the video size
  const videoWidth = video.videoWidth * ratio;
  const videoHeight = video.videoHeight * ratio;
  // Update the dimensions on the DOM
  video.width = videoWidth
  video.height = videoHeight
  canvas.width = videoWidth
  canvas.height = videoHeight
  return ratio
}

export const detectObjects = async ({ model, video }) => {
  if (!model || !video) return
  const predictions = await model.detect(video)
  return predictions
}

export const drawBoxes = ({ predictions, canvas, aspectRatio }) => {
  const ctx = canvas.getContext('2d')
  // Reset the canvas from previous shit
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // Establish the font
  ctx.font = '16px sans-serif'
  ctx.textBaseline = 'top'
  // Draw each prediction
  predictions.forEach(prediction => {
    const baseCoordinates = prediction.bbox.slice(0, 4)
    const [x, y, width, height] = baseCoordinates.map(c=> c*aspectRatio)
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

export const getLogs = ({ isVideoActive, videoStatus, model, isDetectionActive, detectedObjects })=> {
  const logs = []
  // Video log
  if (isVideoActive) logs.push({ status: STATUS[3], message: videoStatus })
  else if (videoStatus) logs.push({ status: STATUS[0], message: videoStatus })
  else logs.push({ status: STATUS[1], message: 'Requesting video stream access...' })
  // Model log
  if (model) logs.push({ status: STATUS[3], message: 'Model loaded successfully.' })
  else logs.push({ status: STATUS[1], message: 'Loading model...' })
  // Detection log
  if (!isDetectionActive) logs.push({ status: STATUS[1], message: 'Starting detection...' })
  else logs.push({ status: STATUS[3], message: `Detected ${detectedObjects} objects.` })
  // All done
  return logs
}
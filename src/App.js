import { useEffect, useRef, useState } from 'react'
import { detectObjects, drawBoxes, establishDimensions, getLogs } from './utils';
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from "@tensorflow/tfjs";
import css from './App.module.css'

const REFRESH_TIME = 5000;

const App = ()=> {

  // Webcam capturing
  const [isVideoActive, setVideoActive] = useState(false)
  const [videoStatus, setVideoStatus] = useState('')
  const [aspectRatio, setAspectRatio] = useState(0)

  // Tensor flow capturing
  const [model, setModel] = useState(null)

  // Object detection
  const [isDetectionActive, setDetectionActive] = useState(false)
  const [detectedObjects, setDetectedObjects] = useState(0)

  const [expanded, setExpanded] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const logs = getLogs({
    isVideoActive,
    videoStatus,
    model,
    isDetectionActive,
    detectedObjects
  })

  useEffect(()=> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVideoStatus('No video stream available in this device.')
      setVideoActive(false)
      return
    }
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream
        setVideoStatus('Video stream available.')
        setVideoActive(true)
      })
      .catch(() => {
        setVideoStatus('Denied access to the video stream.')
        setVideoActive(false)
      })
  }, [])

  useEffect(()=> {
    const loadModel = async () => {
      await tf.ready()
      const model = await cocoSsd.load()
      setModel(model)
    }
    loadModel()
  }, [])

  useEffect(()=> {
    if (!isVideoActive || !model) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ratio = establishDimensions({ video, canvas })
    if (ratio) setAspectRatio(ratio)
  }, [isVideoActive, model])

  useEffect(()=> {
    if (!isVideoActive || !model || !aspectRatio) return
    const video = videoRef.current
    const canvas = canvasRef.current
    setDetectionActive(true)
    const detect = ()=> {
      detectObjects({ model, video })
        .then(predictions => {
          setDetectedObjects(predictions.length)
          drawBoxes({ predictions, canvas, aspectRatio })
        });
    }
    setInterval(detect, REFRESH_TIME)
    return ()=> {
      clearInterval(detect)
    }
  }, [isVideoActive, model, aspectRatio])


  return (
    <>
      <header className={css.header}>
        <h1 data-font="code" className={css.title}>Tensor Flow Object Detection</h1>
      </header>
      <main className={css.main}>
        <div className={css.content}>
          <video className={css.video} ref={videoRef} autoPlay muted />
          <canvas className={css.canvas} ref={canvasRef} />
        </div>
      </main>
      <footer className={css.footer}>
        <div className={css.footerInfo}>
          <h2 data-font="code" className={css.footerTitle}>
            <span className={css.footerStatus}>
              {logs.map((log, index)=> (
                <span className={css.footerStatusItem} key={index}>{log.status}</span>
              ))}
            </span>
            Logs
          </h2>
          <button className={css.logsButton} type="button" onClick={()=> setExpanded(e=> !e)}>
            {expanded ? '\u25BC' : '\u25B2'}
          </button>
        </div>
        {expanded &&  (
          <div className={css.logs}>
            {logs.map((log, index) => (
              <p key={index} className={css.log}>
                <span className={css.logStatus}>{log.status}</span>
                <span data-font="code" className={css.message}>{log.message}</span>
              </p>
            ))}
          </div>
        )}
      </footer>
    </>
  )
}

export default App

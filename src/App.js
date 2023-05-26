import { useEffect, useRef, useState } from 'react'
import { detectObjects, drawBoxes, establishDimensions } from './utils';
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tf from "@tensorflow/tfjs";
import css from './App.module.css'


const REFRESH_TIME = 5000;

const App = ()=> {

  const [isVideoActive, setVideoActive] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(()=> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('No video source available')
      return
    }
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream
        setVideoActive(true)
      })
      .catch(err => {
        console.error('Error on getting user video flow', err)
      })
  }, [])

  useEffect(()=> {
    if (!isVideoActive) return
    const runObjectDetection = async () => {
      await tf.ready()
      const model = await cocoSsd.load()
      console.log('Model loaded successfully.')

      const video = videoRef.current
      const canvas = canvasRef.current

      establishDimensions({ video, canvas })

      setInterval(()=> {
        detectObjects({ model, video })
          .then(predictions => {
            console.log('Objects found: ', predictions.length)
            drawBoxes({ predictions, canvas })
          });
      }, REFRESH_TIME)
    }
    runObjectDetection();
  }, [isVideoActive])


  return (
    <main className={css.main}>
      <div className={css.content}>
        <video className={css.video} ref={videoRef} autoPlay muted />
        <canvas className={css.canvas} ref={canvasRef} />
      </div>
    </main>
  )
}

export default App

import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { AlertCircle, CameraOff, CheckCircle2, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TrackingStatus = 'INITIALIZING' | 'OK' | 'NO_FACE' | 'LOOKING_AWAY';

export function WebcamFaceTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [status, setStatus] = useState<TrackingStatus>('INITIALIZING');
  
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>();
  const lastVideoTimeRef = useRef<number>(-1);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isActive = true;
    
    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240, facingMode: 'user' } 
        });
        
        if (!isActive) return;
        setHasPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        if (!isActive) return;
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        
        if (!isActive) return;
        landmarkerRef.current = faceLandmarker;
        if (isActive) setStatus('OK');
      } catch (err) {
        console.error("Camera access denied or mediapipe error", err);
        if (isActive) setHasPermission(false);
      }
    }
    init();

    return () => {
      isActive = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'INITIALIZING' || !videoRef.current) return;

    const video = videoRef.current;

    const detectFace = () => {
      if (video.readyState >= 2 && landmarkerRef.current) {
        let startTimeMs = performance.now();
        if (lastVideoTimeRef.current !== video.currentTime) {
          lastVideoTimeRef.current = video.currentTime;
          const results = landmarkerRef.current.detectForVideo(video, startTimeMs);
          
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            let isLookingAway = false;
            
            // 1. Check blendshapes for extreme eye movements
            const blendshapes = results.faceBlendshapes[0]?.categories;
            if (blendshapes) {
              const lookAwayShapes = [
                'eyeLookDownLeft', 'eyeLookDownRight', 
                'eyeLookUpLeft', 'eyeLookUpRight',
                'eyeLookInLeft', 'eyeLookInRight',
                'eyeLookOutLeft', 'eyeLookOutRight'
              ];
              for (const shapeName of lookAwayShapes) {
                const shape = blendshapes.find(s => s.categoryName === shapeName);
                if (shape && shape.score > 0.65) {
                  isLookingAway = true;
                  break;
                }
              }
            }

            // 2. Check head turn (yaw) using landmark ratios
            const landmarks = results.faceLandmarks[0];
            const nose = landmarks[1];
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            
            if (nose && leftEye && rightEye) {
              const distLeft = Math.abs(nose.x - leftEye.x);
              const distRight = Math.abs(nose.x - rightEye.x);
              
              if (distRight > 0 && distLeft > 0) {
                const ratio = distLeft / distRight;
                // If head is turned significantly left or right
                if (ratio > 2.5 || ratio < 0.4) {
                  isLookingAway = true;
                }
              }
            }

            if (isLookingAway) {
              setStatus('LOOKING_AWAY');
            } else {
              setStatus('OK');
            }
          } else {
            setStatus('NO_FACE');
          }
        }
      }
      requestRef.current = requestAnimationFrame(detectFace);
    };

    video.addEventListener('loadeddata', detectFace);
    if (video.readyState >= 2) detectFace();
    
    return () => {
      video.removeEventListener('loadeddata', detectFace);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status]);

  if (hasPermission === false) {
    return (
      <div className="bg-surface border border-[var(--border-subtle)] rounded-xl p-4 flex items-center gap-3">
        <CameraOff className="text-[var(--text-muted)]" size={20} />
        <span className="text-sm text-[var(--text-secondary)]">Camera required for face tracking.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Video Container */}
      <div className={`relative rounded-xl overflow-hidden border bg-black/40 w-full aspect-video shadow-inner transition-colors duration-300
        ${status === 'NO_FACE' ? 'border-red-500/50' : status === 'LOOKING_AWAY' ? 'border-amber-500/50' : 'border-emerald-500/30'}`}
      >
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-all duration-500 
            ${status === 'NO_FACE' ? 'opacity-30 blur-sm grayscale' : 
              status === 'LOOKING_AWAY' ? 'opacity-50 grayscale-[50%]' : 'opacity-90'}`} 
        />
        
        {status === 'INITIALIZING' && hasPermission && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <div className="w-5 h-5 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-xs text-[var(--text-muted)] animate-pulse">Initializing Tracker...</span>
          </div>
        )}
        
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/20"></div>
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/20"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/20"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/20"></div>
      </div>

      {/* Status Indicator Below Camera */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={status}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-[rgba(246,239,227,0.02)] border border-[var(--border-subtle)]"
        >
          {status === 'INITIALIZING' && (
            <span className="text-sm text-[var(--text-muted)]">Starting face detection...</span>
          )}
          {status === 'OK' && (
            <>
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span className="text-sm font-medium text-emerald-500">Looking at camera</span>
            </>
          )}
          {status === 'NO_FACE' && (
            <>
              <AlertCircle size={18} className="text-red-500" />
              <span className="text-sm font-medium text-red-500">Face not detected</span>
            </>
          )}
          {status === 'LOOKING_AWAY' && (
            <>
              <EyeOff size={18} className="text-amber-500" />
              <span className="text-sm font-medium text-amber-500">Please look into the camera</span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


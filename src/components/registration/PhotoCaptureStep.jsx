
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { UploadFile } from "@/api/integrations";

const DottedMapBackground = () => (
  <div
    className="absolute inset-0 z-0 opacity-20"
    style={{
      backgroundImage: 'radial-gradient(circle, hsl(var(--primary-foreground)) 1px, transparent 1px)',
      backgroundSize: '10px 10px',
    }}
  />
);

const Barcode = () => (
    <div className="w-full h-12 flex justify-center items-center overflow-hidden">
        <div className="flex items-end h-full gap-px">
            {[...Array(60)].map((_, i) => {
                const height = Math.random() * 80 + 20; // Random height between 20% and 100%
                return <div key={i} className="bg-gray-800" style={{ width: '2px', height: `${height}%` }}></div>
            })}
        </div>
    </div>
);

export default function PhotoCaptureStep({ onComplete, onBack, isProcessing: parentIsProcessing }) {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setCameraError("Camera access denied. Please enable camera in your browser settings.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageBase64 = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageBase64);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhotoAndProcess = async () => {
    if (!capturedImage) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const file = new File([blob], "user_photo.jpeg", { type: "image/jpeg" });
      const { file_url: user_image_url } = await UploadFile({ file });
      onComplete({ user_image_url });
    } catch (error) {
      setIsSubmitting(false);
    }
  };
  
  const isLoading = isSubmitting || parentIsProcessing;

  return (
    <div className="w-full max-w-4xl mx-auto bg-card shadow-2xl rounded-xl flex my-8">
      {/* Left Part - Primary Color */}
      <div className="w-1/2 bg-primary text-primary-foreground p-6 sm:p-8 flex flex-col justify-center rounded-l-xl relative text-center">
        <DottedMapBackground />
        <div className="relative z-10">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">AI PHOTO ANALYSIS</h2>
          <p className="mt-4 opacity-80 text-base leading-relaxed max-w-sm mx-auto">This is your AI boarding pass photo. Our system will analyze your face to predict your perfect 2025 summer destination. A clear, forward-facing photo works best!</p>
        </div>
      </div>
      
      {/* Right Part */}
      <div className="w-1/2 bg-card p-6 flex flex-col rounded-r-xl">
        <div className="flex justify-between items-center w-full mb-6">
            <div>
                <h3 className="font-bold text-xl tracking-wider text-muted-foreground">TAKE PHOTO</h3>
                <p className="text-sm text-muted-foreground mt-1">Capture your winning selfie</p>
            </div>
            <Button onClick={onBack} variant="ghost" size="icon" className="h-10 w-10" disabled={isLoading}>
                <ArrowLeft className="w-5 h-5" />
            </Button>
        </div>
        
        <div className="w-full aspect-square bg-input rounded-lg overflow-hidden relative border-2 border-input-border mb-6">
            {cameraError ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-destructive/10">
                    <AlertTriangle className="w-12 h-12 text-destructive mb-4"/>
                    <p className="text-sm text-destructive-foreground">{cameraError}</p>
                </div>
            ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover"/>
            ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"/>
            )}
        </div>
        
        <div className="space-y-4">
            {capturedImage ? (
                <div className="flex gap-3">
                    <Button onClick={retakePhoto} variant="outline" className="flex-1 h-12 text-base" disabled={isLoading}>
                        <RotateCcw className="w-4 h-4 mr-2"/>RETAKE
                    </Button>
                    <Button onClick={confirmPhotoAndProcess} className="flex-1 h-12 bg-primary text-primary-foreground hover:opacity-90 text-base" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'CONFIRM'}
                    </Button>
                </div>
            ) : (
                <Button onClick={capturePhoto} className="w-full h-14 text-xl font-bold" disabled={!!cameraError}>
                    <Camera className="w-6 h-6 mr-2"/> CAPTURE
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}

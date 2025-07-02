import React, { useState, useEffect } from "react";
import { Participant } from "@/api/entities";
import { BaseImage } from "@/api/entities";
import { GeneratedImage } from "@/api/entities";
import { generateImageWithSegmind } from "@/api/functions";
import { motion, AnimatePresence } from "framer-motion";
import StartStep from "../components/registration/StartStep";
import TermsStep from "../components/registration/TermsStep";
import UserInfoStep from "../components/registration/UserInfoStep";
import PhotoCaptureStep from "../components/registration/PhotoCaptureStep";
import CompletionStep from "../components/registration/CompletionStep";

const STEPS = {
  START: 'start',
  TERMS: 'terms',
  USER_INFO: 'userInfo',
  PHOTO: 'photo',
  COMPLETION: 'completion'
};

export default function Registration() {
  const [currentStep, setCurrentStep] = useState(STEPS.START);
  const [registrationData, setRegistrationData] = useState({
    full_name: '',
    phone: '',
    user_image_url: '',
    terms_accepted: false
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [participantId, setParticipantId] = useState(null);
  
  const handleStepComplete = (stepData) => {
    const newRegistrationData = { ...registrationData, ...stepData };
    setRegistrationData(newRegistrationData);

    switch (currentStep) {
      case STEPS.START:
        setCurrentStep(STEPS.TERMS);
        break;
      case STEPS.TERMS:
        setCurrentStep(STEPS.USER_INFO);
        break;
      case STEPS.USER_INFO:
        setCurrentStep(STEPS.PHOTO);
        break;
      case STEPS.PHOTO:
        completeRegistrationAndGenerateImages(newRegistrationData);
        break;
      default:
        break;
    }
  };

  const handleGoBack = () => {
    switch (currentStep) {
      case STEPS.TERMS:
        setCurrentStep(STEPS.START);
        break;
      case STEPS.USER_INFO:
        setCurrentStep(STEPS.TERMS);
        break;
      case STEPS.PHOTO:
        setCurrentStep(STEPS.USER_INFO);
        break;
      case STEPS.COMPLETION:
        setCurrentStep(STEPS.PHOTO);
        break;
      default:
        break;
    }
  };

  const completeRegistrationAndGenerateImages = async (finalParticipantData) => {
    setIsProcessing(true);
    try {
      const participantToSave = {
        full_name: finalParticipantData.full_name,
        phone: finalParticipantData.phone,
        user_image_url: finalParticipantData.user_image_url,
        terms_accepted: finalParticipantData.terms_accepted,
        terms_accepted_date: new Date().toISOString(),
        registration_completed_date: new Date().toISOString()
      };

      const createdParticipant = await Participant.create(participantToSave);
      setParticipantId(createdParticipant.id);
      console.log("Participant created:", createdParticipant.id);

      const activeBaseImages = await BaseImage.filter({ is_active: true });
      if (activeBaseImages.length === 0) {
        console.warn("No active base images found. Skipping image generation.");
        setCurrentStep(STEPS.COMPLETION);
        setIsProcessing(false);
        return;
      }
      console.log(`Found ${activeBaseImages.length} active base images for generation.`);

      for (const baseImg of activeBaseImages) {
        const generatedImageRecord = await GeneratedImage.create({
          participant_id: createdParticipant.id,
          base_image_id: baseImg.id,
          user_image_url: finalParticipantData.user_image_url,
          status: "pending"
        });
        console.log(`Created GeneratedImage record ${generatedImageRecord.id} for participant ${createdParticipant.id} and base image ${baseImg.id}`);

        generateImageWithSegmind({
          user_image_url: finalParticipantData.user_image_url,
          base_image_url: baseImg.image_url,
          generated_image_record_id: generatedImageRecord.id,
          participant_id: createdParticipant.id
        }).catch(segmindError => {
          console.error(`Segmind initiation failed for GeneratedImage ${generatedImageRecord.id}:`, segmindError);
          GeneratedImage.update(generatedImageRecord.id, { status: "failed", api_request_id: "SegmindInitFail" });
        });
      }

      setCurrentStep(STEPS.COMPLETION);
    } catch (error) {
      console.error("Registration or Image Generation initiation failed:", error);
      alert(`An error occurred: ${error.message || "Please try again."}`);
    }
    setIsProcessing(false);
  };

  const restartFlow = () => {
    setCurrentStep(STEPS.START);
    setRegistrationData({
      full_name: '',
      phone: '',
      user_image_url: '',
      terms_accepted: false
    });
    setParticipantId(null);
    setIsProcessing(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.START:
        return <StartStep onComplete={handleStepComplete} />;
      case STEPS.TERMS:
        return <TermsStep onComplete={handleStepComplete} onBack={handleGoBack} />;
      case STEPS.USER_INFO:
        return <UserInfoStep onComplete={handleStepComplete} onBack={handleGoBack} data={registrationData} />;
      case STEPS.PHOTO:
        return <PhotoCaptureStep onComplete={handleStepComplete} onBack={handleGoBack} isProcessing={isProcessing} />;
      case STEPS.COMPLETION:
        return <CompletionStep onRestart={restartFlow} onBack={handleGoBack} />;
      default:
        return null;
    }
  };

  // Dynamic script loading for Spline
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@splinetool/viewer@1.10.19/build/spline-viewer.js";
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Spline 3D Background */}
      <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <spline-viewer 
          loading-anim-type="spinner-small-light" 
          url="https://prod.spline.design/GzQxqWRJpqPPo4Av/scene.splinecode"
          style={{ 
            width: '100%', 
            height: '100%',
            pointerEvents: 'auto'
          }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-8 sm:pt-12 pb-[120px] pointer-events-none">
        <div className="mb-6 sm:mb-8 h-10 sm:h-12 md:h-14"></div>

        {/* Main Content Section */}
        <div className="w-full max-w-2xl px-4 pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="pb-8" 
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Sponsored by FACEIT Section */}
          <div className="flex items-center justify-center gap-3 mt-8 mb-8 pointer-events-auto">
            <p className="text-sm text-muted-foreground font-medium">
              Sponsored by
            </p>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b376e5bbf_logo.png"
              alt="FACEIT Logo" 
              className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
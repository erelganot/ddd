import React, { useState, useEffect, useRef } from "react";
import { GeneratedImage } from "@/api/entities";
import { BaseImage } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { pollSegmindImageStatus } from "@/api/functions";

const MAX_POLL_ATTEMPTS = 30; 
const POLL_INTERVAL = 10000; 

// Glitch animation variants
const glitchVariants = {
  initial: {
    opacity: 0,
    scale: 1,
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    filter: "blur(0px) contrast(1) brightness(1) saturate(1) hue-rotate(0deg)",
  },
  enter: {
    opacity: 1,
    scale: [0.95, 1.02, 0.98, 1.01, 1],
    x: [0, -5, 8, -3, 2, 0],
    y: [0, 3, -6, 4, -1, 0],
    rotateX: [0, 2, -1, 1, 0],
    rotateY: [0, -1, 3, -2, 0],
    filter: [
      "blur(0px) contrast(1) brightness(1) saturate(1) hue-rotate(0deg)",
      "blur(2px) contrast(1.2) brightness(1.1) saturate(1.3) hue-rotate(5deg)",
      "blur(0px) contrast(0.9) brightness(0.95) saturate(0.8) hue-rotate(-3deg)",
      "blur(1px) contrast(1.1) brightness(1.05) saturate(1.1) hue-rotate(2deg)",
      "blur(0px) contrast(1) brightness(1) saturate(1) hue-rotate(0deg)",
    ],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      scale: { times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut" },
      x: { times: [0, 0.15, 0.35, 0.6, 0.85, 1], ease: "linear" },
      y: { times: [0, 0.2, 0.4, 0.7, 0.9, 1], ease: "linear" },
      rotateX: { times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" },
      rotateY: { times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" },
      filter: { times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut" },
    },
  },
  exit: {
    opacity: 0,
    scale: [1, 1.03, 0.97, 1.05, 0.8],
    x: [0, 10, -15, 7, -20],
    y: [0, -8, 12, -5, 15],
    rotateX: [0, -3, 5, -2, 8],
    rotateY: [0, 4, -7, 3, -10],
    filter: [
      "blur(0px) contrast(1) brightness(1) saturate(1) hue-rotate(0deg)",
      "blur(3px) contrast(1.4) brightness(1.2) saturate(1.5) hue-rotate(10deg)",
      "blur(5px) contrast(0.7) brightness(0.8) saturate(0.5) hue-rotate(-8deg)",
      "blur(8px) contrast(1.3) brightness(1.3) saturate(1.8) hue-rotate(15deg)",
      "blur(15px) contrast(0.5) brightness(0.5) saturate(0.2) hue-rotate(-20deg)",
    ],
    transition: {
      duration: 0.6,
      ease: "easeIn",
      scale: { times: [0, 0.2, 0.5, 0.8, 1], ease: "easeIn" },
      x: { times: [0, 0.2, 0.4, 0.7, 1], ease: "linear" },
      y: { times: [0, 0.2, 0.4, 0.7, 1], ease: "linear" },
      rotateX: { times: [0, 0.25, 0.5, 0.75, 1], ease: "easeIn" },
      rotateY: { times: [0, 0.25, 0.5, 0.75, 1], ease: "easeIn" },
      filter: { times: [0, 0.2, 0.5, 0.8, 1], ease: "easeIn" },
    },
  },
};

export default function Display3() {
  const [generations, setGenerations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadGenerations();
    
    const pollIntervalId = setInterval(() => {
      pollPendingImages();
    }, POLL_INTERVAL);

    return () => {
      isMounted.current = false;
      clearInterval(pollIntervalId);
    };
  }, []);

  useEffect(() => {
    if (generations.length > 1) {
      const interval = setInterval(() => {
        if(isMounted.current) {
            setCurrentIndex(prev => (prev + 1) % generations.length);
        }
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [generations.length]);

  const loadGenerations = async () => {
    if(!isMounted.current) return;
    try {
      const [allGeneratedImages, baseImages] = await Promise.all([
        GeneratedImage.list('-created_date'),
        BaseImage.list()
      ]);

      if(!isMounted.current) return;

      const display3BaseImages = baseImages.filter(img => img.display_page === 'display3');
      const display3BaseImageIds = display3BaseImages.map(img => img.id);

      const display3Generations = allGeneratedImages.filter(gen => 
        display3BaseImageIds.includes(gen.base_image_id) && 
        gen.status === 'completed' && 
        gen.generated_image_url
      );

      const enrichedGenerations = display3Generations.map(gen => ({
        ...gen,
        baseImage: baseImages.find(img => img.id === gen.base_image_id),
      }));
      
      if(isMounted.current) setGenerations(enrichedGenerations);
      
    } catch (error) {
      console.error("[Display3] Error loading generations:", error);
    }
  };

  const pollPendingImages = async () => {
    if (!isMounted.current) return;

    try {
      const [allGenerations, baseImages] = await Promise.all([
        GeneratedImage.list('-created_date'),
        BaseImage.list()
      ]);
      
      if(!isMounted.current) return;
      
      const display3BaseImages = baseImages.filter(img => img.display_page === 'display3');
      const display3BaseImageIds = display3BaseImages.map(img => img.id);
      
      const imagesToPoll = allGenerations.filter(gen => {
        const isDisplay3Image = display3BaseImageIds.includes(gen.base_image_id);
        const needsPolling = ['pending', 'processing', 'queued'].includes(gen.status) || (gen.status === 'succeeded' && !gen.generated_image_url);
        const hasPollUrl = !!gen.poll_url;
        const attempts = gen.poll_attempts || 0;
        const belowMaxAttempts = attempts < MAX_POLL_ATTEMPTS;
        
        return isDisplay3Image && needsPolling && hasPollUrl && belowMaxAttempts;
      });

      for (const image of imagesToPoll) {
        if(!isMounted.current) break;
        try {          
          const response = await pollSegmindImageStatus({
            generated_image_record_id: image.id,
            poll_url: image.poll_url
          });

          const responseData = response.data;

          if (responseData && responseData.success && responseData.is_final && isMounted.current) {
            await loadGenerations();
          }

        } catch (pollError) {
          console.error(`[Display3] Error polling image ${image.id}:`, pollError);
        }
      }

    } catch (error) {
      console.error("[Display3] Error during polling check:", error);
    }
  };

  const currentGeneration = generations[currentIndex];

  return (
    <div className="h-screen bg-black flex items-center justify-center relative">
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-xl font-bold text-white/70 bg-black/50 px-3 py-1 rounded">
          Display 3
        </h1>
      </div>
      
      <AnimatePresence mode="wait">
        {currentGeneration ? (
          <motion.div
            key={currentGeneration.id}
            variants={glitchVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full h-full flex items-center justify-center p-8"
            style={{ perspective: "1000px" }}
          >
            <img
              src={currentGeneration.generated_image_url}
              alt="Generated artwork"
              className="max-w-full max-h-full object-contain"
              style={{ transformStyle: "preserve-3d" }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-8"></div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Display 3 - Waiting for Magic
            </h1>
            <p className="text-xl text-white/60 max-w-md mx-auto">
              Generated artworks assigned to Display 3 will appear here
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
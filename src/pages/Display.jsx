
import React, { useState, useEffect, useRef } from "react";
import { GeneratedImage } from "@/api/entities";
import { BaseImage } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
// Polling function is no longer needed on this page
// import { pollSegmindImageStatus } from "@/api/functions";

const REFRESH_INTERVAL = 15000; // Refresh the list every 15 seconds
const IMAGE_LIMIT = 100; // Only show the latest 100 images
const DISPLAY_DURATION = 6000; // 6 seconds per image

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
      scale: {
        times: [0, 0.2, 0.5, 0.8, 1],
        ease: "easeInOut",
      },
      x: {
        times: [0, 0.15, 0.35, 0.6, 0.85, 1],
        ease: "linear",
      },
      y: {
        times: [0, 0.2, 0.4, 0.7, 0.9, 1],
        ease: "linear",
      },
      rotateX: {
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: "easeInOut",
      },
      rotateY: {
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: "easeInOut",
      },
      filter: {
        times: [0, 0.2, 0.5, 0.8, 1],
        ease: "easeInOut",
      },
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
      scale: {
        times: [0, 0.2, 0.5, 0.8, 1],
        ease: "easeIn",
      },
      x: {
        times: [0, 0.2, 0.4, 0.7, 1],
        ease: "linear",
      },
      y: {
        times: [0, 0.2, 0.4, 0.7, 1],
        ease: "linear",
      },
      rotateX: {
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: "easeIn",
      },
      rotateY: {
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: "easeIn",
      },
      filter: {
        times: [0, 0.2, 0.5, 0.8, 1],
        ease: "easeIn",
      },
    },
  },
};

export default function Display() {
  const [generations, setGenerations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMounted = useRef(true);


  useEffect(() => {
    isMounted.current = true;
    loadGenerations();
    
    // Set up a simple interval to refresh the list of completed images
    const refreshIntervalId = setInterval(loadGenerations, REFRESH_INTERVAL);

    return () => {
      isMounted.current = false;
      clearInterval(refreshIntervalId);
    };
  }, []);

  useEffect(() => {
    if (generations.length > 1) {
      const interval = setInterval(() => {
        if(isMounted.current) {
            setCurrentIndex(prev => (prev + 1) % generations.length);
        }
      }, DISPLAY_DURATION);
      return () => clearInterval(interval);
    }
  }, [generations.length]);

  const loadGenerations = async () => {
    if(!isMounted.current) return;
    try {
      // Fetch only the most recent completed images, limited by IMAGE_LIMIT
      const completedGenerations = await GeneratedImage.filter(
        { status: 'completed' },
        '-created_date',
        IMAGE_LIMIT
      );

      // We only need to enrich the ones that have a valid generated_image_url
      const validGenerations = completedGenerations.filter(gen => gen.generated_image_url);
      
      if(isMounted.current) {
        // Update the state only if the new list is different from the old one
        setGenerations(oldGenerations => {
            const oldIds = new Set(oldGenerations.map(g => g.id));
            const newIds = new Set(validGenerations.map(g => g.id));
            if (oldIds.size === newIds.size && [...oldIds].every(id => newIds.has(id))) {
                return oldGenerations; // No changes, don't re-render
            }
            return validGenerations;
        });
      }
      
    } catch (error) {
      console.error("[Display] CRITICAL: Failed to load generations:", error);
    }
  };

  // The complex pollPendingImages function is no longer needed

  const currentGeneration = generations[currentIndex];

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <AnimatePresence mode="wait">
        {currentGeneration ? (
          <motion.div
            key={currentGeneration.id}
            variants={glitchVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full h-full flex items-center justify-center p-8"
            style={{
              perspective: "1000px", 
            }}
          >
            <img
              src={currentGeneration.generated_image_url}
              alt="Generated artwork"
              className="max-w-full max-h-full object-contain"
              style={{
                transformStyle: "preserve-3d", 
              }}
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
              Waiting for Magic
            </h1>
            <p className="text-xl text-white/60 max-w-md mx-auto">
              Generated artworks will appear here as participants complete their registration
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { GeneratedImage } from "@/api/entities";
import { BaseImage } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { pollSegmindImageStatus } from "@/api/functions";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home } from "lucide-react";

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL = 10000;
const DISPLAY_DURATION = 6000; // 6 seconds

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

export default function BaseImageView({ baseImageName }) {
  const [baseImage, setBaseImage] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchBaseImageAndGenerations = async () => {
      if (!baseImageName) {
        setError("Base image name not provided.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const allBaseImages = await BaseImage.list();
        // Match by name (case-insensitive) or by ID. The name comes from the URL slug.
        const foundBaseImage = allBaseImages.find(bi => 
          bi.name.toLowerCase() === baseImageName.toLowerCase() || bi.id === baseImageName
        );

        if (!foundBaseImage) {
          setError(`Base image style "${baseImageName}" not found.`);
          setBaseImage(null);
          setGenerations([]);
          setLoading(false);
          return;
        }
        if (isMounted.current) setBaseImage(foundBaseImage);

        // Fetch only generated images related to this specific base_image_id
        const allGeneratedImages = await GeneratedImage.filter({ base_image_id: foundBaseImage.id }, '-created_date');
        const completedGenerations = allGeneratedImages.filter(gen => gen.status === 'completed' && gen.generated_image_url);
        
        if (isMounted.current) {
          setGenerations(completedGenerations);
          setCurrentIndex(0);
        }
      } catch (e) {
        console.error("Error fetching data for BaseImageView:", e);
        if (isMounted.current) setError("Failed to load image data.");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchBaseImageAndGenerations();
  }, [baseImageName]);

  useEffect(() => {
    if (generations.length > 1) {
      const interval = setInterval(() => {
        if (isMounted.current) {
          setCurrentIndex(prev => (prev + 1) % generations.length);
        }
      }, DISPLAY_DURATION);
      return () => clearInterval(interval);
    }
  }, [generations.length]);

  // Optional: Polling for newly completed images for this specific base image
  useEffect(() => {
    if (!baseImage || !isMounted.current) return;

    const pollPendingImagesForBase = async () => {
      try {
        const imagesToPoll = await GeneratedImage.filter({
          base_image_id: baseImage.id, // Only poll for the current base image
          status: ["pending", "processing", "queued", "succeeded"], // Succeeded without URL also
        });

        for (const image of imagesToPoll) {
          if (!isMounted.current) break;
          if (image.poll_url && (image.poll_attempts || 0) < MAX_POLL_ATTEMPTS) {
            if (image.status === "succeeded" && image.generated_image_url) continue; // Already processed

            const response = await pollSegmindImageStatus({
              generated_image_record_id: image.id,
              poll_url: image.poll_url
            });
            const responseData = response.data;
            if (responseData && responseData.success && responseData.is_final && responseData.generated_url) {
              // If a new image is completed, refetch generations for this base image
              const allGeneratedImages = await GeneratedImage.filter({ base_image_id: baseImage.id }, '-created_date');
              const completedGenerations = allGeneratedImages.filter(gen => gen.status === 'completed' && gen.generated_image_url);
              if (isMounted.current) setGenerations(completedGenerations);
            }
          }
        }
      } catch (e) {
        console.error(`Error polling for ${baseImage.name}:`, e);
      }
    };

    const pollIntervalId = setInterval(pollPendingImagesForBase, POLL_INTERVAL);
    return () => clearInterval(pollIntervalId);
  }, [baseImage]);

  const currentGeneration = generations[currentIndex];

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
        Loading images for {baseImageName || "selected style"}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-xl mb-6">{error}</p>
        <Link to={createPageUrl("Landing")} className="text-blue-400 hover:text-blue-300 underline flex items-center gap-2">
          <Home size={20} /> Go to Homepage
        </Link>
      </div>
    );
  }

  if (!baseImage) {
     return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-3xl font-bold text-yellow-500 mb-4">Style Not Found</h1>
        <p className="text-xl mb-6">The image style "{baseImageName}" couldn't be found.</p>
         <Link to={createPageUrl("Landing")} className="text-blue-400 hover:text-blue-300 underline flex items-center gap-2">
          <Home size={20} /> Go to Homepage
        </Link>
      </div>
    );
  }
  
  if (generations.length === 0) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white p-8">
         <h1 className="text-4xl font-bold text-white mb-4">
          Displaying: {baseImage.name}
        </h1>
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-8"></div>
        <p className="text-xl text-white/60 max-w-md mx-auto text-center">
          No generated artworks found for "{baseImage.name}" yet.
          <br />
          New images will appear here once processed.
        </p>
         <Link to={createPageUrl("Landing")} className="mt-8 text-blue-400 hover:text-blue-300 underline flex items-center gap-2">
          <Home size={20} /> Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center relative">
        <div className="absolute top-4 left-4 right-4 text-center z-10">
             <h1 className="text-2xl sm:text-3xl font-bold text-white/90 bg-black/50 px-4 py-2 rounded-lg inline-block">
                Style: {baseImage.name}
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
              alt={`Generated artwork for ${baseImage.name}`}
              className="max-w-full max-h-full object-contain"
              style={{ transformStyle: "preserve-3d" }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
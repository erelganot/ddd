import React from "react";
import { motion } from "framer-motion";

export default function ScrollingTextBar({ text, backgroundColor, textColor, customStyle = {} }) {
  const marqueeVariants = {
    animate: {
      x: ["0%", "-100%"], // Changed to move from right to left
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 15, // Adjusted duration for better visibility
          ease: "linear",
        },
      },
    },
  };

  // Create repeating text for smooth scrolling
  const repeatedText = `${text} • ${text} • ${text} • ${text} • ${text} • `;

  const defaultStyle = {
    bottom: '16px',
    right: '16px'
  };

  const finalStyle = {
    ...defaultStyle,
    ...customStyle,
    backgroundColor,
    color: textColor,
    borderColor: textColor
  };

  return (
    <div 
      className="overflow-hidden shadow-md fixed z-20 w-80 h-12 rounded-full border-2"
      style={finalStyle}
    >
      <motion.div
        className="whitespace-nowrap text-sm font-bold tracking-wider py-3 px-4" 
        variants={marqueeVariants}
        animate="animate"
        style={{ display: 'inline-block' }} 
      >
        <span>{repeatedText}</span>
        <span>{repeatedText}</span> 
      </motion.div>
    </div>
  );
}
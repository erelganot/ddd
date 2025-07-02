import React from "react";
import CircularTextAnimation from "../components/global/CircularTextAnimation";

export default function TestCircular() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center font-['DM_Sans']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        `}
      </style>
      
      <CircularTextAnimation 
        text="FADEIT PLATFORM • AI GENERATION • "
        duration={15}
        fontSize="clamp(16px, 2.5vw, 32px)"
        className="mb-8"
      />

      <CircularTextAnimation 
        text="TRY NOW • ITS FUN • "
        duration={12}
        reversed={true}
        fontSize="clamp(14px, 2vw, 24px)"
        className="opacity-60"
      />

      <footer className="fixed bottom-4 right-4 text-sm opacity-70">
        ❤️ <a href="#" className="underline hover:no-underline">Made with love</a>
      </footer>
    </div>
  );
}
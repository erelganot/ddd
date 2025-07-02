import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

// const PrimaryColor = "#f29fc5"; // Using the new primary color (Light Pink) - REMOVED
const PrimaryColorHexFromCSS = "hsl(var(--primary))"; // Will now get color from CSS variable

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-8 font-sans">
      <header>
        <h1 className="text-3xl font-bold tracking-tighter" style={{ filter: 'brightness(0) invert(1)' }}>FADEIT.</h1> 
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="relative w-full max-w-2xl">
          <div
            className="absolute inset-0 transform -rotate-3 opacity-80"
            style={{
              backgroundColor: 'transparent',
              border: `3px solid ${PrimaryColorHexFromCSS}`,
              borderRadius: '10px',
              zIndex: 0,
              top: '5px', left: '5px', right: '-5px', bottom: '-5px'
            }}
          ></div>
          
          <div 
            className="relative p-10 md:p-12 shadow-2xl z-10"
            style={{ backgroundColor: PrimaryColorHexFromCSS, borderRadius: '8px' }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-[hsl(var(--primary-foreground))] mb-6 tracking-tight"> {/* Text color from CSS var */}
              READY? SMILE!
            </h2>
            <p className="text-xl md:text-2xl text-[hsl(var(--primary-foreground))] mb-4 font-medium"> {/* Text color from CSS var */}
              For you its just one photo. for them a whole new identity.
            </p>
            <Link
              to={createPageUrl('Registration')}
              className="inline-flex items-center text-lg md:text-xl text-[hsl(var(--primary-foreground))] font-semibold group mt-6 hover:underline" /* Text color from CSS var */
            >
              Let us save you.
              <ArrowRight className="ml-2 w-6 h-6 transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>
      <footer></footer>
    </div>
  );
}
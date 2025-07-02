import React from 'react';
import { Button } from '@/components/ui/button';
import { Plane } from 'lucide-react';

const DottedMapBackground = () => (
  <div
    className="absolute inset-0 z-0 opacity-20"
    style={{
      backgroundImage: 'radial-gradient(circle, hsl(var(--primary-foreground)) 1px, transparent 1px)',
      backgroundSize: '10px 10px',
    }}
  />
);

export default function StartStep({ onComplete }) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-card shadow-2xl rounded-xl flex my-8">
      {/* Left Part - Primary Color */}
      <div className="w-3/5 bg-primary text-primary-foreground p-6 sm:p-8 flex flex-col justify-between rounded-l-xl relative">
        <DottedMapBackground />
        <div className="relative z-10 text-left">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">PLAY AND GET A CHANCE TO WIN</h2>
          <Plane className="w-16 h-16 opacity-90" />
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4 text-sm mt-6">
          <div>
            <p className="opacity-80">PASSENGER</p>
            <p className="font-bold">FUTURE WINNER</p>
          </div>
          <div>
            <p className="opacity-80">FLIGHT</p>
            <p className="font-bold">GAME-2025</p>
          </div>
          <div>
            <p className="opacity-80">DATE</p>
            <p className="font-bold">TODAY</p>
          </div>
          <div>
            <p className="opacity-80">GATE</p>
            <p className="font-bold">AI-1</p>
          </div>
        </div>
      </div>

      {/* Right Part - Stub */}
      <div className="w-2/5 bg-card p-6 flex flex-col justify-between rounded-r-xl">
        {/* This spacer pushes the button to the bottom */}
        <div className="flex-grow"></div>
        
        <div className="space-y-4">
            <Button
                onClick={() => onComplete({})}
                className="w-full h-14 bg-primary text-primary-foreground font-bold text-xl rounded-lg shadow-lg hover:opacity-90"
            >
                PLAY TO WIN
            </Button>
        </div>
      </div>
    </div>
  );
}
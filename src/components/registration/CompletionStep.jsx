import React from 'react';
import { Button } from '@/components/ui/button';
import { Plane, CheckCircle } from 'lucide-react';

const DottedMapBackground = () => (
  <div
    className="absolute inset-0 z-0 opacity-20"
    style={{
      backgroundImage: 'radial-gradient(circle, hsl(var(--primary-foreground)) 1px, transparent 1px)',
      backgroundSize: '10px 10px',
    }}
  />
);

export default function CompletionStep({ onRestart }) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-card shadow-2xl rounded-xl flex my-8">
      {/* Left Part - Primary Color */}
      <div className="w-1/2 bg-primary text-primary-foreground p-6 sm:p-8 flex flex-col justify-center rounded-l-xl relative text-center">
        <DottedMapBackground />
        <div className="relative z-10">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">ANALYSIS COMPLETE!</h2>
          <p className="mt-4 opacity-80 text-base leading-relaxed max-w-sm mx-auto">Our AI has processed your photo! Your 2025 summer destination is being revealed now. Head to the main display area in the next room to see your result!</p>
        </div>
      </div>

      {/* Right Part - Stub (Made Wider) */}
      <div className="w-1/2 bg-card p-6 flex flex-col rounded-r-xl">
        {/* This spacer pushes the button to the bottom */}
        <div className="flex-grow"></div>
        
        <div className="space-y-4">
            <Button
                onClick={onRestart}
                className="w-full h-14 bg-primary text-primary-foreground font-bold text-xl rounded-lg shadow-lg hover:opacity-90"
            >
                DONE
            </Button>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect } from 'react';

const SPLINE_VIEWER_SCRIPT_ID = 'spline-viewer-script';
const SPLINE_URL = "https://prod.spline.design/NyCgYYDHzYLFROwf/scene.splinecode";

export default function Sparks3d() {
  useEffect(() => {
    // Check if the script tag already exists to avoid adding it multiple times
    if (document.getElementById(SPLINE_VIEWER_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = SPLINE_VIEWER_SCRIPT_ID;
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.10.6/build/spline-viewer.js';
    
    document.body.appendChild(script);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-80 h-80 pointer-events-none" style={{ zIndex: 50 }}>
      {/* The spline-viewer tag is a web component that will be rendered by the script */}
      <spline-viewer 
        loading-anim-type="fade" 
        url={SPLINE_URL}
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          top: 0, 
          left: 0 
        }}
      ></spline-viewer>
    </div>
  );
}
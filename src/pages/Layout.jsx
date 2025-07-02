

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Settings, Monitor, Image as ImageIcon } from "lucide-react"; // Renamed Image to ImageIcon to avoid conflict

// Import the new page component with .js extension
import BaseImageView from "./pages/BaseImageView.js";

// Define theme assets
const SkyBackgroundImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/0c7e68ca5_.jpg";
const PrimaryColorHex = "#D5FE12"; // Updated to new primary color
const FaceItLogoUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/b376e5bbf_logo.png";
const CustomCursorUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/72c4fe988_mouse.png";

// List of known static page names (case-insensitive for robustness)
const STATIC_PAGES = ["landing", "registration", "terms", "userinfo", "photocapture", "completion", "admin", "display", "display1", "display2", "display3", "display4", "display5", "display6", "testcircular"];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  // Extract the first segment of the path, remove leading slash, and convert to lowercase
  const pathSegment = location.pathname.split('/')[1]?.toLowerCase() || '';

  let effectiveCurrentPageName = currentPageName?.toLowerCase();
  let baseImageNameToPass = null;

  // Determine if the current path segment is a known static page
  const isStaticPage = STATIC_PAGES.includes(pathSegment);
  
  // If it's not a known static page, and the path segment is not empty,
  // then assume it's a baseImageName for BaseImageView.
  if (!isStaticPage && pathSegment && pathSegment !== '') {
    effectiveCurrentPageName = "baseimageview"; // Special identifier for this layout case
    baseImageNameToPass = location.pathname.split('/')[1]; // Pass the original casing
  }

  // Update isDisplayPage to include the new display pages
  const isDisplayPage = ["display", "baseimageview", "display1", "display2", "display3", "display4", "display5", "display6"].includes(effectiveCurrentPageName);
  const isRegistrationFlow = ["registration", "terms", "userinfo", "photocapture", "completion"].includes(effectiveCurrentPageName);
  const isLandingPage = effectiveCurrentPageName === "landing";

  const globalCursorStyles = `
    html, body {
      cursor: url('${CustomCursorUrl}'), auto !important;
    }
    button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"]) {
      cursor: inherit !important;
    }
  `;

  // Full screen layout for display page or base image view
  if (isDisplayPage) {
    return (
      <>
        <style>{globalCursorStyles}</style>
        <div className="min-h-screen bg-black">
          {effectiveCurrentPageName === "baseimageview" && baseImageNameToPass ? (
            <BaseImageView baseImageName={baseImageNameToPass} />
          ) : (
            children /* This will be the original /Display page or one of the new /displayX pages */
          )}
        </div>
      </>
    );
  }

  // Light theme for registration flow with a sky background
  if (isRegistrationFlow) {
    return (
      <>
        <style>{`
          ${globalCursorStyles}
          :root {
            --background: 0 0% 100%; /* White */
            --foreground: 222.2 84% 4.9%; /* Dark Gray */
            
            /* HSL for #D5FE12 (Lime Green) */
            /* H:73 S:98% L:54% */
            --primary: 73 98% 54%; 
            --primary-foreground: 73 98% 10%; /* Very dark lime for text on primary */

            --card: 0 0% 100%; /* White */
            --card-foreground: 222.2 84% 4.9%; /* Dark Gray */

            --popover: 0 0% 100%;
            --popover-foreground: 222.2 84% 4.9%;

            /* Lighter Lime for secondary elements */
            --secondary: 73 98% 85%; 
            --secondary-foreground: 73 98% 15%; /* Dark lime */

            --muted: 210 40% 96.1%; /* Light Gray for muted elements */
            --muted-foreground: 215.4 16.3% 46.9%; /* Medium Gray */

            --accent: 73 98% 54%; /* Lime */
            --accent-foreground: 73 98% 10%; /* Dark lime */

            --destructive: 0 84.2% 60.2%; /* Red */
            --destructive-foreground: 210 40% 98%; /* Light text on destructive */

            /* Softer Lime Border */
            --border: 73 98% 80%; 
            --input: 0 0% 100%; /* White input background */
            /* Lime border for inputs */
            --input-border: 73 98% 75%; 
            /* Slightly darker Lime for focus rings */
            --ring: 73 98% 45%; 
            
            --radius: 0.8rem; /* Increased radius for more rounded elements */
          }
        `}</style>
        <div 
          className="min-h-screen bg-cover bg-center"
          style={{ backgroundImage: `url('${SkyBackgroundImageUrl}')` }}
        >
          {children}
        </div>
      </>
    );
  }
  
  // Clean layout for landing page (dark theme)
  if (isLandingPage) {
    return (
      <>
        <style>{`
          ${globalCursorStyles}
          :root { 
            /* HSL for #D5FE12 (Lime Green) */
            --primary: 73 98% 54%; 
            --primary-foreground: 73 98% 15%; /* Dark lime for text on primary in dark mode */
          }
        `}</style>
        <div className="min-h-screen bg-black">{children}</div>
      </>
    );
  }

  // Admin layout with navigation (default/original theme - now also uses lime)
  return (
    <>
      <style>{`
        ${globalCursorStyles}
        :root { /* Default theme for admin and other pages - now also uses lime */
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          
          /* HSL for #D5FE12 (Lime Green) */
          --primary: 73 98% 54%; 
          --primary-foreground: 73 98% 10%; /* Dark lime for text on primary */
          
          --secondary: 73 98% 85%; /* Lighter Lime */
          --secondary-foreground: 73 98% 15%; /* Dark lime */
          
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 73 98% 54%; /* Lime */
          --accent-foreground: 73 98% 10%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 73 98% 80%; /* Softer Lime Border */
          --input: 73 98% 88%; /* Lighter Lime Input */
          --ring: 73 98% 45%; /* Slightly darker Lime for focus rings */
          --radius: 0.5rem;
        }
      `}</style>
      
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to={createPageUrl("Landing")} className="flex-shrink-0 flex items-center">
                <img 
                    src={FaceItLogoUrl} 
                    alt="FACEIT. Logo" 
                    className="h-8 object-contain" 
                />
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link 
                  to={createPageUrl("Registration")}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    effectiveCurrentPageName === "registration" 
                      ? "bg-primary/10" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-secondary/50"
                  }`}
                   style={effectiveCurrentPageName === "registration" ? { color: "hsl(var(--primary-foreground))"} : {} }
                >
                  <Users className="w-4 h-4 mr-2" />
                  Registration
                </Link>
                <Link 
                  to={createPageUrl("Admin")}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    effectiveCurrentPageName === "admin" 
                      ? "bg-primary/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-secondary/50"
                  }`}
                   style={effectiveCurrentPageName === "admin" ? { color: "hsl(var(--primary-foreground))"} : {} }
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Link>
                <Link 
                  to={createPageUrl("Display")}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    effectiveCurrentPageName === "display" && !baseImageNameToPass /* Only active if it's the main display */
                      ? "bg-primary/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-secondary/50"
                  }`}
                   style={effectiveCurrentPageName === "display" && !baseImageNameToPass ? { color: "hsl(var(--primary-foreground))"} : {} }
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Display Overview
                </Link>
                {[...Array(6)].map((_, i) => (
                  <Link 
                    key={`display${i + 1}`}
                    to={createPageUrl(`Display${i + 1}`)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      effectiveCurrentPageName === `display${i + 1}` 
                        ? "bg-primary/10"
                        : "text-slate-600 hover:text-slate-900 hover:bg-secondary/50"
                    }`}
                    style={effectiveCurrentPageName === `display${i + 1}` ? { color: "hsl(var(--primary-foreground))"} : {} }
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Display {i + 1}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1"> {/* Removed mx-auto and max-w for admin to allow full width */}
        {children}
      </main>
    </>
  );
}



import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Phone } from "lucide-react";

const DottedMapBackground = () => (
  <div
    className="absolute inset-0 z-0 opacity-20"
    style={{
      backgroundImage: 'radial-gradient(circle, hsl(var(--primary-foreground)) 1px, transparent 1px)',
      backgroundSize: '10px 10px',
    }}
  />
);

export default function UserInfoStep({ onComplete, onBack, data }) {
  const [formData, setFormData] = useState({
    full_name: data.full_name || '',
    phone: data.phone || ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Player name required to win!";
    else if (formData.full_name.trim().length < 2) newErrors.full_name = "Name too short for prize claim!";
    if (!formData.phone.trim()) newErrors.phone = "Contact number required for prize notification!";
    else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.trim())) newErrors.phone = "Valid phone needed for winner contact.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-card shadow-2xl rounded-xl flex my-8">
      {/* Left Part - Primary Color */}
      <div className="w-1/2 bg-primary text-primary-foreground p-6 sm:p-8 flex flex-col justify-between rounded-l-xl relative">
        <DottedMapBackground />
        <div className="relative z-10 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="opacity-80">PASSENGER</p>
            <p className="font-bold text-lg truncate">{formData.full_name || 'PLAYER NAME'}</p>
          </div>
          <div>
            <p className="opacity-80">CONTACT</p>
            <p className="font-bold text-lg truncate">{formData.phone || 'PLAYER CONTACT'}</p>
          </div>
           <div>
            <p className="opacity-80">FLIGHT</p>
            <p className="font-bold">GAME-2025</p>
          </div>
          <div>
            <p className="opacity-80">GATE</p>
            <p className="font-bold">AI-1</p>
          </div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">WINNER INFORMATION</h2>
          <p className="mt-4 opacity-80 text-base leading-relaxed">Your details are needed for the lottery entry. After you take your photo, our AI will reveal your dream destination!</p>
        </div>
      </div>
      
      {/* Right Part - Stub (Made Wider) */}
      <form onSubmit={handleSubmit} className="w-1/2 bg-card p-6 flex flex-col rounded-r-xl">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="font-bold text-xl tracking-wider text-muted-foreground">ENTER DETAILS</h3>
                <p className="text-sm text-muted-foreground mt-1">Winner contact information</p>
            </div>
            <Button onClick={onBack} variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
            </Button>
        </div>
        
        <div className="space-y-6 flex-grow">
          <div>
            <Label htmlFor="full_name" className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                <User size={16}/> FULL NAME
            </Label>
            <Input 
                id="full_name" 
                type="text" 
                value={formData.full_name} 
                onChange={(e) => handleInputChange('full_name', e.target.value)} 
                placeholder="John Doe" 
                className="bg-input border-input-border h-12 text-base"
            />
            {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                <Phone size={16}/> PHONE NUMBER
            </Label>
            <Input 
                id="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)} 
                placeholder="+1 555-123-4567" 
                className="bg-input border-input-border h-12 text-base"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="pt-6 space-y-4">
            <Button type="submit" className="w-full h-14 bg-primary text-primary-foreground font-bold text-xl rounded-lg shadow-lg hover:opacity-90">
                NEXT STEP
            </Button>
        </div>
      </form>
    </div>
  );
}

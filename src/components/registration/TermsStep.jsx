
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Shield } from "lucide-react";

// Using a subset for brevity in the component, the full list is maintained
const TERMS_POINTS = [
  "I understand this is a promotional game where I can win a free flight ticket",
  "I agree to provide accurate and truthful information during registration",
  "I consent to the collection and processing of my personal data including my photograph",
  "I understand that my image will be used for digital processing and generation purposes",
  "I grant permission for the use of facial recognition technology on my submitted photo",
  "I acknowledge that generated images may be stored for quality improvement purposes",
  "I consent to the use of my data in accordance with applicable privacy laws",
  "I understand that my personal information will be kept confidential and secure",
  "I agree that the service is provided 'as is' without warranties of any kind",
  "I acknowledge that image generation results may vary and are not guaranteed",
  "I understand that processing times may vary depending on system load",
  "I agree not to submit images that violate copyright or intellectual property rights",
  "I confirm that I am the rightful owner of any submitted photographs",
  "I agree not to use the service for illegal, harmful, or offensive purposes",
  "I understand that inappropriate content will result in account termination",
  "I agree to respect the intellectual property rights of generated content",
  "I acknowledge that the service may be temporarily unavailable for maintenance",
  "I understand that my account may be suspended for violation of terms",
  "I agree to notify the service provider of any security breaches or concerns",
  "I consent to receive service-related communications via email or phone",
  "I understand that I can request deletion of my data in accordance with privacy laws",
  "I agree that generated images are for personal use unless otherwise specified",
  "I acknowledge that the service provider is not liable for technical failures",
  "I understand that refunds are subject to the service provider's refund policy",
  "I agree that disputes will be resolved through appropriate legal channels",
  "I acknowledge that these terms may be updated periodically with notice",
  "I understand that continued use implies acceptance of updated terms",
  "I agree to use the service responsibly and in good faith",
  "I acknowledge that I have read and understood all privacy policies",
  "I consent to the use of cookies and similar technologies for service improvement",
  "I understand that participating in this game gives me a chance to win prizes",
  "I acknowledge that winning is not guaranteed and depends on luck and participation",
  "I agree that the flight ticket prize is subject to availability and terms",
  "I understand that additional terms may apply to prize redemption",
  "I agree that I must be 18 years or older to participate in this promotion",
  "I understand that employees of FACEIT and their families are not eligible",
  "I agree that the promotion is void where prohibited by law",
  "I understand that no purchase is necessary to enter or win",
  "I agree that alternative methods of entry may be available upon request",
  "I understand that the odds of winning depend on the number of participants",
  "I agree that prizes are non-transferable and have no cash value",
  "I understand that taxes on prizes are my responsibility",
  "I agree to comply with all federal, state, and local laws regarding prizes",
  "I understand that I may be required to sign additional documents to claim prizes",
  "I agree that my participation may be used for marketing and promotional purposes",
  "I consent to the use of my name and likeness in promotional materials",
  "I understand that I may appear in advertisements or social media content",
  "I agree that I will not receive compensation for promotional use of my participation",
  "I understand that the promotion period has specific start and end dates",
  "I agree that late entries will not be accepted after the promotion ends",
  "I understand that winners will be selected through a random drawing process",
  "I agree that the drawing will be conducted by an independent third party",
  "I understand that I will be notified if I win within a specified timeframe",
  "I agree that unclaimed prizes may be forfeited after a certain period",
  "I understand that I may need to provide additional verification to claim prizes",
  "I agree to respond to winner notification within the specified timeframe",
  "I understand that failure to respond may result in disqualification",
  "I agree that alternate winners may be selected if I am disqualified",
  "I understand that the flight ticket includes specific terms and restrictions",
  "I agree that the ticket must be used within a specified validity period",
  "I understand that certain destinations may be excluded from the prize",
  "I agree that travel dates are subject to availability and blackout periods",
  "I understand that additional fees may apply to the flight ticket",
  "I agree that I am responsible for any visa, passport, or travel requirements",
  "I understand that travel insurance is not included with the prize",
  "I agree that accommodation and ground transportation are not included",
  "I understand that the flight ticket cannot be combined with other offers",
  "I agree that changes to travel plans may incur additional fees",
  "I understand that the ticket is subject to airline terms and conditions",
  "I agree that weather or operational delays are not the responsibility of FACEIT",
  "I understand that I may need to provide health and safety documentation for travel",
  "I agree to comply with all airline and destination health requirements",
  "I understand that COVID-19 restrictions may affect travel",
  "I agree that entry into certain countries may require vaccination proof",
  "I understand that travel advisories may impact destination availability",
  "I agree that political or natural disasters may affect travel plans",
  "I understand that the game uses artificial intelligence for image processing",
  "I agree that AI-generated content may not always be accurate or realistic",
  "I understand that the destination prediction is for entertainment purposes only",
  "I agree that the AI analysis does not constitute professional advice",
  "I understand that facial recognition technology is used to enhance the experience",
  "I agree that my biometric data will be processed according to privacy laws",
  "I understand that my facial data will be encrypted and securely stored",
  "I agree that my biometric information will not be sold to third parties",
  "I understand that I can request deletion of my biometric data",
  "I agree that data retention periods are governed by applicable laws",
  "I understand that cross-border data transfers may occur for processing",
  "I agree that appropriate safeguards will be in place for international transfers",
  "I understand that I have rights regarding my personal data under privacy laws",
  "I agree that I can access, correct, or delete my personal information",
  "I understand that I can withdraw consent for data processing at any time",
  "I agree that withdrawal of consent may affect my ability to participate",
  "I understand that certain data processing is necessary for legitimate interests",
  "I agree that anonymized data may be used for research and development",
  "I understand that aggregate statistics may be shared without personal identification",
  "I agree that my participation helps improve the AI technology",
  "I understand that machine learning algorithms may be trained on anonymized data",
  "I agree that technological improvements benefit all users of the service",
  "I understand that the platform uses cloud computing services for processing",
  "I agree that third-party service providers may process my data under contract",
  "I understand that all service providers are bound by strict confidentiality agreements",
  "I agree that data security measures are regularly reviewed and updated",
  "I understand that no system is 100% secure despite best efforts",
  "I agree to notify FACEIT immediately of any suspected security breaches",
  "I understand that I should use strong passwords and protect my account access",
  "I agree not to share my account credentials with others",
  "I understand that I am responsible for all activity under my account",
  "I agree to log out of shared or public computers after use",
  "I understand that suspicious activity may result in account suspension",
  "I agree that FACEIT may contact me regarding unusual account activity",
  "I understand that account recovery requires identity verification",
  "I agree that false identity claims may result in permanent account closure",
  "I understand that multiple accounts per person are not permitted",
  "I agree that creating fake accounts may disqualify me from all promotions",
  "I understand that automated or robotic participation is prohibited",
  "I agree that attempts to manipulate the system will result in disqualification",
  "I understand that fair play is essential for all participants",
  "I agree to report any suspected cheating or unfair practices",
  "I understand that FACEIT reserves the right to verify the authenticity of entries",
  "I agree that decisions regarding rule violations are final and binding",
  "I understand that appeals processes may be available for certain decisions",
  "I agree that legal disputes will be resolved through binding arbitration",
  "I understand that class action lawsuits are waived through participation",
  "I agree that the jurisdiction for legal matters is specified in the full terms",
  "I understand that these terms constitute a legal agreement",
  "I agree that ignorance of terms does not excuse non-compliance",
  "I understand that terms may be updated and I will be notified of changes",
  "I agree that continued participation implies acceptance of updated terms",
  "I understand that some provisions may be severable if found unenforceable",
  "I agree that the remaining terms will continue in effect even if some are invalid",
  "I understand that this agreement supersedes any previous agreements",
  "I agree that electronic signatures are legally binding for this agreement",
  "I understand that I have had the opportunity to review these terms carefully",
  "I agree that I am entering into this agreement voluntarily and with full understanding",
  "I understand that customer support is available for questions about these terms",
  "I agree that I can contact support through the designated channels for clarification",
  "I understand that participating in this promotion is entirely optional",
  "I agree that I can withdraw from the promotion at any time before completion",
  "I understand that withdrawal may result in loss of eligibility for prizes",
  "I agree that partial participation does not guarantee any rights or benefits",
  "I understand that the full experience requires completion of all steps",
  "I agree that skipping steps may affect the quality of my generated content",
  "I understand that the AI works best with clear, well-lit photographs",
  "I agree to provide the highest quality image possible for best results",
  "I understand that poor image quality may affect the final outcome",
  "I agree that retaking photos is encouraged to improve results",
  "I understand that the system may reject images that don't meet quality standards",
  "I agree that image rejection is for technical reasons, not personal judgment",
  "I understand that appropriate facial expression and positioning improve results",
  "I agree to follow any provided guidelines for optimal photo capture",
  "I understand that lighting conditions significantly impact AI processing",
  "I agree that natural lighting generally produces the best results",
  "I understand that background elements may affect the AI analysis",
  "I agree that simple backgrounds work better than complex or busy ones",
  "I understand that the AI destination prediction is based on facial feature analysis",
  "I agree that results are generated using advanced machine learning algorithms",
  "I understand that the matching process considers multiple facial characteristics",
  "I agree that the final destination is selected from a curated list of beautiful locations",
  "I understand that all destinations in the system are desirable travel locations",
  "I agree that the AI has been trained on diverse datasets for fair representation",
  "I understand that bias mitigation is an ongoing priority for the development team",
  "I agree that feedback about unfair or inappropriate results is welcomed and valued"
];

const DottedMapBackground = () => (
  <div
    className="absolute inset-0 z-0 opacity-20"
    style={{
      backgroundImage: 'radial-gradient(circle, hsl(var(--primary-foreground)) 1px, transparent 1px)',
      backgroundSize: '10px 10px',
    }}
  />
);

export default function TermsStep({ onComplete, onBack }) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-card shadow-2xl rounded-xl flex my-8">
      {/* Left Part - Primary Color */}
      <div className="w-1/2 bg-primary text-primary-foreground p-6 sm:p-8 flex flex-col justify-center rounded-l-xl relative text-center">
        <DottedMapBackground />
        <div className="relative z-10">
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">GAME RULES</h2>
          <p className="mt-4 opacity-80 text-base leading-relaxed">Please read and accept the terms and conditions to proceed with the game.</p>
        </div>
      </div>

      {/* Right Part - Stub (Made Wider) */}
      <div className="w-1/2 bg-card p-6 flex flex-col rounded-r-xl">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="font-bold text-xl tracking-wider text-muted-foreground">TERMS & CONDITIONS</h3>
                <p className="text-sm text-muted-foreground mt-1">Please read carefully</p>
            </div>
            <Button onClick={onBack} variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
            </Button>
        </div>
        
        <ScrollArea className="flex-grow h-96 w-full rounded-md border p-1 mb-6">
          <div className="p-4 space-y-3">
            {TERMS_POINTS.map((point, index) => (
                <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-bold mr-2 text-primary">{index + 1}.</span>{point}
                </p>
            ))}
          </div>
        </ScrollArea>
        
        <Button
            onClick={() => onComplete({ terms_accepted: true })}
            className="w-full h-14 bg-primary text-primary-foreground font-bold text-xl rounded-lg shadow-lg hover:opacity-90"
        >
            I AGREE & PLAY
        </Button>
      </div>
    </div>
  );
}

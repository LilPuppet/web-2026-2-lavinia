import React from 'react';
import { HeroSection } from './HeroSection';
import { ProblemSection } from './ProblemSection';
import { SolutionSection } from './SolutionSection';
import { HowItWorksSection } from './HowItWorksSection';
import { ProfilesSection } from './ProfilesSection';
import { RulesSection } from './RulesSection';
import { ArchitectureSection } from './ArchitectureSection';
import { FooterSection } from './FooterSection';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <ProfilesSection />
      <RulesSection />
      <ArchitectureSection />
      <FooterSection />
    </div>
  );
};

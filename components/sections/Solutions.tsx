'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  ScanText,
  FileText,
  Calendar,
  PhoneCall,
  PlusCircle,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';

const SolutionCard = ({
  icon: Icon,
  title,
  description,
  color,
  className
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  className?: string;
}) => (
  <div className={cn(
    "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700",
    "transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
    className
  )}>
    <div className={`p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-[#0E0D35] dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const Solutions = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container-custom mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0E0D35] dark:text-white mb-4">
            Solving Accessibility Challenges
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AccessKit tackles the most common issues that make content inaccessible to screen reader users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SolutionCard
            icon={ScanText}
            title="Acronym & Abbreviation Vocalization"
            description="Properly pronounces acronyms and abbreviations instead of spelling them out letter by letter."
            color="bg-[#4B6FED]"
            className="scale-in"
          />
          <SolutionCard
            icon={FileText}
            title="Medical Term Pronunciation"
            description="Correctly vocalizes complex medical terms, measurements, and scientific notation."
            color="bg-[#338585]"
            className="scale-in"
          />
          <SolutionCard
            icon={Calendar}
            title="Date & Time Formatting"
            description="Ensures dates and times are spoken naturally and correctly interpreted in their context."
            color="bg-[#FCAE39]"
            className="scale-in"
          />
          <SolutionCard
            icon={PhoneCall}
            title="Phone Number Dictation"
            description="Reads phone numbers naturally with proper pausing and grouping for better comprehension."
            color="bg-[#22BCDE]"
            className="scale-in"
          />
        </div>

        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#4B6FED]/10 dark:bg-[#4B6FED]/20 rounded-xl p-6 flex flex-col items-center text-center fade-in">
              <div className="p-3 rounded-full bg-[#4B6FED] w-12 h-12 flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0E0D35] dark:text-white mb-2">Easy Integration</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Works with React, Vue, Angular, and vanilla JavaScript with a simple drop-in component.
              </p>
            </div>
            <div className="bg-[#338585]/10 dark:bg-[#338585]/20 rounded-xl p-6 flex flex-col items-center text-center fade-in">
              <div className="p-3 rounded-full bg-[#338585] w-12 h-12 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0E0D35] dark:text-white mb-2">Zero Performance Impact</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Lightweight implementation with no noticeable effect on application performance.
              </p>
            </div>
            <div className="bg-[#FCAE39]/10 dark:bg-[#FCAE39]/20 rounded-xl p-6 flex flex-col items-center text-center fade-in">
              <div className="p-3 rounded-full bg-[#FCAE39] w-12 h-12 flex items-center justify-center mb-4">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#0E0D35] dark:text-white mb-2">WCAG 2.1 Compliant</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Helps meet AA accessibility standards for screen reader compatibility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solutions;

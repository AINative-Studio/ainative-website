'use client';

import React from 'react';
import { ButtonCustom } from '@/components/ui/button-custom';
import { ArrowRight, FileText, Code, LayoutGrid, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';

const DocCard = ({
  icon: Icon,
  title,
  description,
  link,
  color
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  color: string;
}) => (
  <div className={cn(
    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6",
    "transition-all duration-300 hover:shadow-md"
  )}>
    <div className={`p-3 rounded-full w-12 h-12 flex items-center justify-center mb-5 ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{description}</p>
    <a
      href={link}
      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
    >
      Learn more <ArrowRight className="ml-1 h-4 w-4" />
    </a>
  </div>
);

const Documentation = () => {
  return (
    <section id="documentation" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container-custom mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
              Start Building Accessible Experiences Today
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Our comprehensive documentation makes it easy to integrate AccessKit into your projects and start creating more inclusive experiences for all users.
            </p>
            <ButtonCustom variant="primary" size="lg" className="flex items-center">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonCustom>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 slide-in-right">
            <DocCard
              icon={FileText}
              title="Quick Start"
              description="Get up and running with AccessKit in under 5 minutes. Simple installation guide."
              link="#"
              color="bg-primary"
            />
            <DocCard
              icon={Code}
              title="React Integration"
              description="Step-by-step tutorial for implementing AccessKit in React applications."
              link="#"
              color="bg-secondary"
            />
            <DocCard
              icon={LayoutGrid}
              title="Examples"
              description="Real-world examples showing how AccessKit improves content accessibility."
              link="#"
              color="bg-accent"
            />
            <DocCard
              icon={PenTool}
              title="Common Fixes"
              description="Learn how to address the most frequent accessibility issues in your code."
              link="#"
              color="bg-accent-secondary"
            />
          </div>
        </div>

        <div className="mt-20 bg-primary/10 dark:bg-primary/20 rounded-xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Need help with implementation?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our team of accessibility experts is available to help you integrate AccessKit into your application and ensure compliance with accessibility standards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <ButtonCustom variant="primary">
                  Schedule a Consultation
                </ButtonCustom>
                <ButtonCustom variant="outline">
                  Join our Discord
                </ButtonCustom>
              </div>
            </div>
            <div className="md:col-span-4 flex items-center justify-center">
              <div className="rounded-full p-4 bg-white dark:bg-gray-700 shadow-md">
                <img
                  src="https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Team collaboration"
                  className="w-full h-auto rounded-full aspect-square object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Documentation;

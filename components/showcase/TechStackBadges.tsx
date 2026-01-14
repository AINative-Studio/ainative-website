'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SiReact,
  SiVuedotjs,
  SiAngular,
  SiNodedotjs,
  SiPython,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiDocker,
  SiKubernetes,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiGraphql,
  SiAmazonwebservices,
  SiGooglecloud,
  SiGit,
  SiGithub,
  SiGitlab,
  SiJenkins,
  SiTerraform,
  SiNextdotjs,
  SiVite,
  SiWebpack,
  SiExpress,
  SiFastapi,
  SiFlask,
  SiDjango,
  SiNestjs,
  SiRust,
  SiGo,
  SiElasticsearch,
  SiRabbitmq,
  SiApachekafka,
} from 'react-icons/si';

interface TechInfo {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  docsUrl: string;
  version?: string;
}

const techDatabase: Record<string, TechInfo> = {
  'React': {
    name: 'React',
    icon: SiReact,
    color: 'text-cyan-500',
    description: 'A JavaScript library for building user interfaces',
    docsUrl: 'https://react.dev',
  },
  'Vue': {
    name: 'Vue',
    icon: SiVuedotjs,
    color: 'text-green-500',
    description: 'The Progressive JavaScript Framework',
    docsUrl: 'https://vuejs.org',
  },
  'Angular': {
    name: 'Angular',
    icon: SiAngular,
    color: 'text-red-600',
    description: 'Platform for building mobile and desktop web applications',
    docsUrl: 'https://angular.io',
  },
  'Next.js': {
    name: 'Next.js',
    icon: SiNextdotjs,
    color: 'text-gray-900 dark:text-white',
    description: 'The React Framework for Production',
    docsUrl: 'https://nextjs.org',
  },
  'TypeScript': {
    name: 'TypeScript',
    icon: SiTypescript,
    color: 'text-blue-600',
    description: 'Typed JavaScript at Any Scale',
    docsUrl: 'https://www.typescriptlang.org',
  },
  'JavaScript': {
    name: 'JavaScript',
    icon: SiJavascript,
    color: 'text-yellow-500',
    description: 'The programming language of the web',
    docsUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  },
  'Python': {
    name: 'Python',
    icon: SiPython,
    color: 'text-blue-500',
    description: 'Programming language that lets you work quickly',
    docsUrl: 'https://www.python.org',
  },
  'Rust': {
    name: 'Rust',
    icon: SiRust,
    color: 'text-orange-600',
    description: 'A language empowering everyone to build reliable software',
    docsUrl: 'https://www.rust-lang.org',
  },
  'Go': {
    name: 'Go',
    icon: SiGo,
    color: 'text-cyan-600',
    description: 'Build simple, secure, scalable systems',
    docsUrl: 'https://go.dev',
  },
  'Java': {
    name: 'Java',
    color: 'text-red-500',
    description: 'Write once, run anywhere',
    docsUrl: 'https://www.java.com',
  },
  'Node.js': {
    name: 'Node.js',
    icon: SiNodedotjs,
    color: 'text-green-600',
    description: 'JavaScript runtime built on Chrome\'s V8 engine',
    docsUrl: 'https://nodejs.org',
  },
  'Express': {
    name: 'Express',
    icon: SiExpress,
    color: 'text-gray-700 dark:text-gray-300',
    description: 'Fast, unopinionated, minimalist web framework for Node.js',
    docsUrl: 'https://expressjs.com',
  },
  'NestJS': {
    name: 'NestJS',
    icon: SiNestjs,
    color: 'text-red-500',
    description: 'A progressive Node.js framework',
    docsUrl: 'https://nestjs.com',
  },
  'FastAPI': {
    name: 'FastAPI',
    icon: SiFastapi,
    color: 'text-teal-500',
    description: 'Modern, fast web framework for building APIs with Python',
    docsUrl: 'https://fastapi.tiangolo.com',
  },
  'Flask': {
    name: 'Flask',
    icon: SiFlask,
    color: 'text-gray-800 dark:text-white',
    description: 'Micro web framework written in Python',
    docsUrl: 'https://flask.palletsprojects.com',
  },
  'Django': {
    name: 'Django',
    icon: SiDjango,
    color: 'text-green-700',
    description: 'The web framework for perfectionists with deadlines',
    docsUrl: 'https://www.djangoproject.com',
  },
  'Tailwind CSS': {
    name: 'Tailwind CSS',
    icon: SiTailwindcss,
    color: 'text-cyan-500',
    description: 'Rapidly build modern websites without leaving your HTML',
    docsUrl: 'https://tailwindcss.com',
  },
  'PostgreSQL': {
    name: 'PostgreSQL',
    icon: SiPostgresql,
    color: 'text-blue-600',
    description: 'The World\'s Most Advanced Open Source Relational Database',
    docsUrl: 'https://www.postgresql.org',
  },
  'MongoDB': {
    name: 'MongoDB',
    icon: SiMongodb,
    color: 'text-green-500',
    description: 'The most popular NoSQL database',
    docsUrl: 'https://www.mongodb.com',
  },
  'Redis': {
    name: 'Redis',
    icon: SiRedis,
    color: 'text-red-600',
    description: 'Open source, in-memory data structure store',
    docsUrl: 'https://redis.io',
  },
  'Elasticsearch': {
    name: 'Elasticsearch',
    icon: SiElasticsearch,
    color: 'text-yellow-500',
    description: 'Distributed search and analytics engine',
    docsUrl: 'https://www.elastic.co',
  },
  'GraphQL': {
    name: 'GraphQL',
    icon: SiGraphql,
    color: 'text-pink-500',
    description: 'A query language for your API',
    docsUrl: 'https://graphql.org',
  },
  'RabbitMQ': {
    name: 'RabbitMQ',
    icon: SiRabbitmq,
    color: 'text-orange-500',
    description: 'Message broker for distributed systems',
    docsUrl: 'https://www.rabbitmq.com',
  },
  'Apache Kafka': {
    name: 'Apache Kafka',
    icon: SiApachekafka,
    color: 'text-gray-900 dark:text-white',
    description: 'Distributed event streaming platform',
    docsUrl: 'https://kafka.apache.org',
  },
  'Docker': {
    name: 'Docker',
    icon: SiDocker,
    color: 'text-blue-500',
    description: 'Develop, ship, and run applications anywhere',
    docsUrl: 'https://www.docker.com',
  },
  'Kubernetes': {
    name: 'Kubernetes',
    icon: SiKubernetes,
    color: 'text-blue-600',
    description: 'Production-Grade Container Orchestration',
    docsUrl: 'https://kubernetes.io',
  },
  'AWS': {
    name: 'AWS',
    icon: SiAmazonwebservices,
    color: 'text-orange-500',
    description: 'Amazon Web Services Cloud Platform',
    docsUrl: 'https://aws.amazon.com',
  },
  'GCP': {
    name: 'GCP',
    icon: SiGooglecloud,
    color: 'text-blue-500',
    description: 'Google Cloud Platform',
    docsUrl: 'https://cloud.google.com',
  },
  'Azure': {
    name: 'Azure',
    color: 'text-blue-600',
    description: 'Microsoft Azure Cloud Platform',
    docsUrl: 'https://azure.microsoft.com',
  },
  'Terraform': {
    name: 'Terraform',
    icon: SiTerraform,
    color: 'text-purple-600',
    description: 'Infrastructure as Code',
    docsUrl: 'https://www.terraform.io',
  },
  'Vite': {
    name: 'Vite',
    icon: SiVite,
    color: 'text-purple-500',
    description: 'Next Generation Frontend Tooling',
    docsUrl: 'https://vitejs.dev',
  },
  'Webpack': {
    name: 'Webpack',
    icon: SiWebpack,
    color: 'text-blue-400',
    description: 'Static module bundler for JavaScript applications',
    docsUrl: 'https://webpack.js.org',
  },
};

interface TechStackBadgesProps {
  techStack: string[];
  maxVisible?: number;
  showIcons?: boolean;
  showVersions?: boolean;
  className?: string;
}

export function TechStackBadges({
  techStack,
  maxVisible,
  showIcons = false,
  showVersions = false,
  className,
}: TechStackBadgesProps) {
  const visibleTech = maxVisible ? techStack.slice(0, maxVisible) : techStack;
  const hiddenCount = techStack.length - visibleTech.length;

  const getTechInfo = (tech: string): TechInfo => {
    const exactMatch = techDatabase[tech];
    if (exactMatch) return exactMatch;

    const caseInsensitiveMatch = Object.entries(techDatabase).find(
      ([key]) => key.toLowerCase() === tech.toLowerCase()
    );
    if (caseInsensitiveMatch) return caseInsensitiveMatch[1];

    return {
      name: tech,
      color: 'text-gray-500',
      description: `Technology: ${tech}`,
      docsUrl: `https://www.google.com/search?q=${encodeURIComponent(tech)}`,
    };
  };

  return (
    <TooltipProvider>
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {visibleTech.map((tech, index) => {
          const techInfo = getTechInfo(tech);
          const Icon = techInfo.icon;

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <a
                  href={techInfo.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs cursor-pointer transition-all hover:scale-105',
                      'hover:shadow-md',
                      showIcons && 'pl-2'
                    )}
                  >
                    {showIcons && Icon && (
                      <Icon className={cn('h-3 w-3 mr-1', techInfo.color)} />
                    )}
                    {techInfo.name}
                    {showVersions && techInfo.version && (
                      <span className="ml-1 text-muted-foreground">
                        {techInfo.version}
                      </span>
                    )}
                  </Badge>
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className={cn('h-4 w-4', techInfo.color)} />}
                    <span className="font-semibold">{techInfo.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {techInfo.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <ExternalLink className="h-3 w-3" />
                    <span>View Documentation</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {hiddenCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-xs">
                +{hiddenCount} more
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="space-y-1">
                {techStack.slice(maxVisible).map((tech, index) => (
                  <div key={index} className="text-xs">
                    {tech}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

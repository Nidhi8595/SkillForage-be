import { Injectable } from '@nestjs/common';
import * as roadmapContent from './roadmap-content.json';

export interface DayPlan {
  day: number;
  title: string;
  tasks: string[];
  resource: string;
}

export interface SkillRoadmap {
  skill: string;
  description: string;
  priority: 'high' | 'medium';  // high = required, medium = nice to have
  days: DayPlan[];
}

export interface FullRoadmap {
  targetRole: string;
  totalSkillsToLearn: number;
  estimatedDays: number;
  roadmap: SkillRoadmap[];
  quickWins: string[];       // skills learnable in 1-2 days
  interviewQuestions: InterviewQuestion[];
}

export interface InterviewQuestion {
  skill: string;
  question: string;
  hint: string;
}

@Injectable()
export class RoadmapService {

  private readonly content: Record<string, any> = roadmapContent;

  // Interview questions for missing skills
  private readonly interviewQuestions: Record<string, InterviewQuestion> = {
    'redis': {
      skill: 'redis',
      question: 'What is Redis and how does it differ from a traditional database?',
      hint: 'Focus on in-memory storage, persistence options, and use cases like caching and pub/sub',
    },
    'docker': {
      skill: 'docker',
      question: 'Explain the difference between a Docker image and a Docker container.',
      hint: 'Image is a blueprint (read-only), container is a running instance of that image',
    },
    'kubernetes': {
      skill: 'kubernetes',
      question: 'What problem does Kubernetes solve that Docker alone cannot?',
      hint: 'Orchestration, auto-scaling, self-healing, load balancing at scale',
    },
    'graphql': {
      skill: 'graphql',
      question: 'When would you choose GraphQL over REST?',
      hint: 'Over-fetching, under-fetching, multiple clients with different data needs',
    },
    'git': {
      skill: 'git',
      question: 'Explain the difference between git merge and git rebase.',
      hint: 'Merge preserves history, rebase creates linear history — discuss trade-offs',
    },
    'aws': {
      skill: 'aws',
      question: 'What is the difference between EC2 and Lambda?',
      hint: 'EC2 = full VM you manage, Lambda = serverless function, event-driven, auto-scales',
    },
    'typescript': {
      skill: 'typescript',
      question: 'What are the benefits of TypeScript over JavaScript in large projects?',
      hint: 'Type safety, better IDE support, early error detection, self-documenting code',
    },
    'rest api': {
      skill: 'rest api',
      question: 'What are the key principles of RESTful API design?',
      hint: 'Statelessness, uniform interface, resource-based URLs, HTTP methods, status codes',
    },
  };

  generateRoadmap(
    missingRequired: string[],
    missingNiceToHave: string[],
    targetRole: string,
  ): FullRoadmap {

    const allMissing = [
      ...missingRequired.map(s => ({ skill: s, priority: 'high' as const })),
      ...missingNiceToHave.map(s => ({ skill: s, priority: 'medium' as const })),
    ];

    // Only generate roadmap for skills we have content for
    const roadmapItems: SkillRoadmap[] = allMissing
      .filter(({ skill }) => this.content[skill])
      .map(({ skill, priority }) => ({
        skill,
        description: this.content[skill].description,
        priority,
        days: this.content[skill].days,
      }));

    // Skills we don't have content for yet
    const uncoveredSkills = allMissing
      .filter(({ skill }) => !this.content[skill])
      .map(({ skill }) => skill);

    // If no content found, add generic roadmap entries
    const genericItems: SkillRoadmap[] = uncoveredSkills.map(({ skill }: any) => ({
      skill,
      description: `Learn ${skill} fundamentals and apply them in projects`,
      priority: 'medium' as const,
      days: this.generateGenericPlan(skill),
    }));

    const fullRoadmap = [...roadmapItems, ...genericItems];

    // Quick wins = skills with only 3 days (all of them in our case)
    // In a real system this would be based on complexity score
    const quickWins = missingRequired.slice(0, 2);

    // Interview questions for missing required skills
    const questions = missingRequired
      .filter(skill => this.interviewQuestions[skill])
      .map(skill => this.interviewQuestions[skill]);

    return {
      targetRole,
      totalSkillsToLearn: fullRoadmap.length,
      estimatedDays: fullRoadmap.length * 3,  // 3 days per skill
      roadmap: fullRoadmap,
      quickWins,
      interviewQuestions: questions,
    };
  }

  // Fallback for skills without dedicated content
  private generateGenericPlan(skill: string): DayPlan[] {
    return [
      {
        day: 1,
        title: `${skill} — Core Concepts`,
        tasks: [
          `Research what ${skill} is and what problems it solves`,
          `Find the official documentation for ${skill}`,
          `Complete the official getting started tutorial`,
        ],
        resource: `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial for beginners')}`,
      },
      {
        day: 2,
        title: `${skill} — Hands-on Practice`,
        tasks: [
          `Build a small project using ${skill}`,
          `Implement at least 3 core features`,
          `Read best practices and common patterns`,
        ],
        resource: `https://www.google.com/search?q=${encodeURIComponent(skill + ' best practices')}`,
      },
      {
        day: 3,
        title: `${skill} — Integration`,
        tasks: [
          `Integrate ${skill} into an existing project`,
          `Write notes summarizing what you learned`,
          `Find and solve one real problem using ${skill}`,
        ],
        resource: `https://www.google.com/search?q=${encodeURIComponent(skill + ' real world examples')}`,
      },
    ];
  }
}
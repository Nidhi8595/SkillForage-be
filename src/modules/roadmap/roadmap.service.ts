// import { Injectable } from '@nestjs/common';
// import * as roadmapContent from './roadmap-content.json';

// export interface DayPlan {
//   day: number;
//   title: string;
//   tasks: string[];
//   resource: string;
// }

// export interface SkillRoadmap {
//   skill: string;
//   description: string;
//   priority: 'high' | 'medium';  // high = required, medium = nice to have
//   days: DayPlan[];
// }

// export interface FullRoadmap {
//   targetRole: string;
//   totalSkillsToLearn: number;
//   estimatedDays: number;
//   roadmap: SkillRoadmap[];
//   quickWins: string[];       // skills learnable in 1-2 days
//   interviewQuestions: InterviewQuestion[];
// }

// export interface InterviewQuestion {
//   skill: string;
//   question: string;
//   hint: string;
// }

// @Injectable()
// export class RoadmapService {

//   private readonly content: Record<string, any> = roadmapContent;

//   // Interview questions for missing skills
//   private readonly interviewQuestions: Record<string, InterviewQuestion> = {
//     'redis': {
//       skill: 'redis',
//       question: 'What is Redis and how does it differ from a traditional database?',
//       hint: 'Focus on in-memory storage, persistence options, and use cases like caching and pub/sub',
//     },
//     'docker': {
//       skill: 'docker',
//       question: 'Explain the difference between a Docker image and a Docker container.',
//       hint: 'Image is a blueprint (read-only), container is a running instance of that image',
//     },
//     'kubernetes': {
//       skill: 'kubernetes',
//       question: 'What problem does Kubernetes solve that Docker alone cannot?',
//       hint: 'Orchestration, auto-scaling, self-healing, load balancing at scale',
//     },
//     'graphql': {
//       skill: 'graphql',
//       question: 'When would you choose GraphQL over REST?',
//       hint: 'Over-fetching, under-fetching, multiple clients with different data needs',
//     },
//     'git': {
//       skill: 'git',
//       question: 'Explain the difference between git merge and git rebase.',
//       hint: 'Merge preserves history, rebase creates linear history — discuss trade-offs',
//     },
//     'aws': {
//       skill: 'aws',
//       question: 'What is the difference between EC2 and Lambda?',
//       hint: 'EC2 = full VM you manage, Lambda = serverless function, event-driven, auto-scales',
//     },
//     'typescript': {
//       skill: 'typescript',
//       question: 'What are the benefits of TypeScript over JavaScript in large projects?',
//       hint: 'Type safety, better IDE support, early error detection, self-documenting code',
//     },
//     'rest api': {
//       skill: 'rest api',
//       question: 'What are the key principles of RESTful API design?',
//       hint: 'Statelessness, uniform interface, resource-based URLs, HTTP methods, status codes',
//     },
//   };

//   generateRoadmap(
//     missingRequired: string[],
//     missingNiceToHave: string[],
//     targetRole: string,
//   ): FullRoadmap {

//     const allMissing = [
//       ...missingRequired.map(s => ({ skill: s, priority: 'high' as const })),
//       ...missingNiceToHave.map(s => ({ skill: s, priority: 'medium' as const })),
//     ];

//     // Only generate roadmap for skills we have content for
//     const roadmapItems: SkillRoadmap[] = allMissing
//       .filter(({ skill }) => this.content[skill])
//       .map(({ skill, priority }) => ({
//         skill,
//         description: this.content[skill].description,
//         priority,
//         days: this.content[skill].days,
//       }));

//     // Skills we don't have content for yet
//     const uncoveredSkills = allMissing
//       .filter(({ skill }) => !this.content[skill])
//       .map(({ skill }) => skill);

//     // If no content found, add generic roadmap entries
//     const genericItems: SkillRoadmap[] = uncoveredSkills.map(( skill : string) => ({
//       skill,
//       description: `Learn ${skill} fundamentals and apply them in projects`,
//       priority: 'medium' as const,
//       days: this.generateGenericPlan(skill),
//     }));

//     const fullRoadmap = [...roadmapItems, ...genericItems];

//     // Quick wins = skills with only 3 days (all of them in our case)
//     // In a real system this would be based on complexity score
//     const quickWins = missingRequired.slice(0, 2);

//     // Interview questions for missing required skills
//     const questions = missingRequired
//       .filter(skill => this.interviewQuestions[skill])
//       .map(skill => this.interviewQuestions[skill]);

//     return {
//       targetRole,
//       totalSkillsToLearn: fullRoadmap.length,
//       estimatedDays: fullRoadmap.length * 3,  // 3 days per skill
//       roadmap: fullRoadmap,
//       quickWins,
//       interviewQuestions: questions,
//     };
//   }

//   // Fallback for skills without dedicated content
//   private generateGenericPlan(skill: string): DayPlan[] {
//     return [
//       {
//         day: 1,
//         title: `${skill} — Core Concepts`,
//         tasks: [
//           `Research what ${skill} is and what problems it solves`,
//           `Find the official documentation for ${skill}`,
//           `Complete the official getting started tutorial`,
//         ],
//         resource: `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial for beginners')}`,
//       },
//       {
//         day: 2,
//         title: `${skill} — Hands-on Practice`,
//         tasks: [
//           `Build a small project using ${skill}`,
//           `Implement at least 3 core features`,
//           `Read best practices and common patterns`,
//         ],
//         resource: `https://www.google.com/search?q=${encodeURIComponent(skill + ' best practices')}`,
//       },
//       {
//         day: 3,
//         title: `${skill} — Integration`,
//         tasks: [
//           `Integrate ${skill} into an existing project`,
//           `Write notes summarizing what you learned`,
//           `Find and solve one real problem using ${skill}`,
//         ],
//         resource: `https://www.google.com/search?q=${encodeURIComponent(skill + ' real world examples')}`,
//       },
//     ];
//   }
// }

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService }      from '@nestjs/config';
import Groq                   from 'groq-sdk';

export interface DayPlan {
  day:      number;
  title:    string;
  tasks:    string[];
  resource: string;
}

export interface SkillRoadmap {
  skill:       string;
  description: string;
  priority:    'high' | 'medium';
  days:        DayPlan[];
}

export interface FullRoadmap {
  targetRole:         string;
  totalSkillsToLearn: number;
  estimatedDays:      number;
  roadmap:            SkillRoadmap[];
  quickWins:          string[];
  interviewQuestions: InterviewQuestion[];
}

export interface InterviewQuestion {
  skill:    string;
  question: string;
  hint:     string;
}

@Injectable()
export class RoadmapService {

  private readonly logger = new Logger(RoadmapService.name);
  private readonly client: Groq;

  constructor(private readonly configService: ConfigService) {
    this.client = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async generateRoadmap(
    missingRequired:    string[],
    missingNiceToHave:  string[],
    targetRole:         string,
  ): Promise<FullRoadmap> {

    const allMissing = [
      ...missingRequired.map(s    => ({ skill: s, priority: 'high'   as const })),
      ...missingNiceToHave.map(s  => ({ skill: s, priority: 'medium' as const })),
    ];

    if (allMissing.length === 0) {
      return {
        targetRole,
        totalSkillsToLearn: 0,
        estimatedDays:      0,
        roadmap:            [],
        quickWins:          [],
        interviewQuestions: [],
      };
    }

    // Generate all roadmap items and interview questions in parallel
    const [roadmapItems, interviewQuestions] = await Promise.all([
      this.generateAllRoadmaps(allMissing, targetRole),
      this.generateInterviewQuestions(missingRequired, targetRole),
    ]);

    return {
      targetRole,
      totalSkillsToLearn: roadmapItems.length,
      estimatedDays:      roadmapItems.length * 3,
      roadmap:            roadmapItems,
      quickWins:          missingRequired.slice(0, 2),
      interviewQuestions,
    };
  }

  // ── Generate roadmaps for all skills in one Groq call ──────────────
  private async generateAllRoadmaps(
    skills:     { skill: string; priority: 'high' | 'medium' }[],
    targetRole: string,
  ): Promise<SkillRoadmap[]> {

    const skillList = skills.map(s => s.skill).join(', ');

    this.logger.log(`Generating roadmap for skills: ${skillList}`);

    const prompt = `You are a curriculum designer creating micro-learning plans.

For a person targeting the role "${targetRole}", create a 3-day learning plan for each of these skills: ${skillList}

Return a JSON array with this exact structure:
[
  {
    "skill": "skill name here",
    "description": "one sentence about what this skill is",
    "days": [
      {
        "day": 1,
        "title": "short title",
        "tasks": ["task 1", "task 2", "task 3"],
        "resource": "https://actual-url.com"
      },
      { "day": 2, "title": "...", "tasks": [...], "resource": "..." },
      { "day": 3, "title": "...", "tasks": [...], "resource": "..." }
    ]
  }
]

Rules:
- Each skill gets exactly 3 days
- Each day has 3 practical tasks
- Resources must be real URLs (official docs preferred)
- Tasks must be specific and actionable, not vague
- Works for any field: tech, medicine, law, finance, design
- Return ONLY the JSON array, no explanation`;

    try {
      const completion = await this.client.chat.completions.create({
        model:           'llama-3.1-8b-instant',
        temperature:     0.2,
        max_tokens:      3000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role:    'system',
            content: 'You are a curriculum designer. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
      });

      const text   = completion.choices[0]?.message?.content?.trim() ?? '{}';
      const parsed = JSON.parse(text);

      // Groq with json_object mode wraps arrays — handle both cases
      const items: any[] = Array.isArray(parsed)
        ? parsed
        : parsed.skills ?? parsed.roadmap ?? parsed.plans ?? Object.values(parsed)[0] ?? [];

      // Map back with priority
      return items.map((item: any) => {
        const found = skills.find(s => s.skill === item.skill);
        return {
          skill:       item.skill       ?? 'unknown',
          description: item.description ?? `Learn ${item.skill} fundamentals`,
          priority:    found?.priority  ?? 'medium',
          days:        (item.days ?? []).map((d: any) => ({
            day:      d.day      ?? 1,
            title:    d.title    ?? `Day ${d.day}`,
            tasks:    d.tasks    ?? [],
            resource: d.resource ?? `https://www.google.com/search?q=${encodeURIComponent(item.skill)}`,
          })),
        };
      });

    } catch (err) {
      this.logger.error(`Roadmap generation failed: ${err}`);
      // Fallback — generate basic plan for each skill
      return skills.map(({ skill, priority }) => ({
        skill,
        description: `Learn ${skill} and apply it in real projects`,
        priority,
        days: this.fallbackPlan(skill),
      }));
    }
  }

  // ── Generate interview questions for missing required skills ────────
  private async generateInterviewQuestions(
    skills:     string[],
    targetRole: string,
  ): Promise<InterviewQuestion[]> {

    if (skills.length === 0) return [];

    const prompt = `Generate one interview question with a hint for each of these skills for a "${targetRole}" role: ${skills.join(', ')}

Return a JSON object:
{
  "questions": [
    {
      "skill": "skill name",
      "question": "interview question here",
      "hint": "key points to cover in the answer"
    }
  ]
}

Return ONLY the JSON object.`;

    try {
      const completion = await this.client.chat.completions.create({
        model:           'llama-3.1-8b-instant',
        temperature:     0.3,
        max_tokens:      1000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role:    'system',
            content: 'You are an interviewer. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
      });

      const text   = completion.choices[0]?.message?.content?.trim() ?? '{}';
      const parsed = JSON.parse(text);
      return parsed.questions ?? [];

    } catch {
      return [];
    }
  }

  // ── Simple fallback if Groq fails ────────────────────────────────────
  private fallbackPlan(skill: string): DayPlan[] {
    return [
      {
        day:      1,
        title:    `${skill} — core concepts`,
        tasks:    [`Read the official ${skill} documentation`, `Watch a beginner tutorial`, `Set up a practice environment`],
        resource: `https://www.google.com/search?q=${encodeURIComponent(skill + ' getting started')}`,
      },
      {
        day:      2,
        title:    `${skill} — hands-on practice`,
        tasks:    [`Build a small example project`, `Implement 3 core features`, `Read best practices guide`],
        resource: `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial')}`,
      },
      {
        day:      3,
        title:    `${skill} — real world use`,
        tasks:    [`Integrate ${skill} into an existing project`, `Write notes on what you learned`, `Find one real problem to solve with it`],
        resource: `https://www.google.com/search?q=${encodeURIComponent(skill + ' examples')}`,
      },
    ];
  }
}

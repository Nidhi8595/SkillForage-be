import { Injectable } from '@nestjs/common';

@Injectable()
export class SkillsService {

  // Master list of skills we can detect
  // In a real AI system, this would be an ML model
  // Here it's rule-based — which is honest and explainable
  private readonly skillKeywords: string[] = [
    // Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#',
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin',

    // Frontend
    'react', 'angular', 'vue', 'nextjs', 'html', 'css',
    'tailwind', 'bootstrap', 'redux', 'sass',

    // Backend
    'node', 'nodejs', 'express', 'nestjs', 'django',
    'flask', 'spring', 'fastapi', 'graphql', 'rest api',

    // Databases
    'mongodb', 'postgresql', 'mysql', 'redis', 'sqlite',
    'elasticsearch', 'firebase', 'dynamodb',

    // DevOps / Cloud
    'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'ci/cd', 'jenkins', 'github actions', 'terraform', 'linux',

    // Tools
    'git', 'webpack', 'vite', 'jest', 'mocha',

    // Data
    'pandas', 'numpy', 'sql', 'excel', 'power bi',
    'tableau', 'statistics', 'machine learning', 'tensorflow',

    // Auth / Security
    'jwt', 'oauth', 'ssl',
  ];

  extractSkills(normalizedText: string): string[] {
    const foundSkills = new Set<string>(); // Set prevents duplicates

    for (const skill of this.skillKeywords) {
      // Use word boundary matching to avoid false positives
      // e.g., "java" should not match inside "javascript"
      const pattern = new RegExp(`\\b${this.escapeRegex(skill)}\\b`, 'i');
      if (pattern.test(normalizedText)) {
        foundSkills.add(skill);
      }
    }

    return Array.from(foundSkills);
  }

  // Escape special regex characters in skill names (e.g., "c++", "ci/cd")
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
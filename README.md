# SkillForge Backend — AI-Driven Skill Gap Analyzer API

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq_AI-FF6B35?style=for-the-badge&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

**Production-grade REST API built with NestJS, TypeScript, MongoDB Atlas, and Groq AI**

[Live API](https://skillforage-be.onrender.com/api) · [Swagger Docs](https://skillforage-be.onrender.com/docs)

</div>

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Tech Stack & Why](#tech-stack--why)
- [Project Structure](#project-structure)
- [All API Endpoints](#all-api-endpoints)
- [Key Features](#key-features)
- [AI Integration](#ai-integration)
- [Database Design](#database-design)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Bugs Fixed](#bugs-fixed)
- [Interview Talking Points](#interview-talking-points)

---

## Overview

SkillForge is a full-stack AI-powered career development platform. The backend is the brain — it handles resume PDF parsing, intelligent skill extraction using NLP regex, AI-powered skill gap analysis via Groq's LLaMA model, dynamic learning roadmap generation, and progress tracking with streak mechanics.

**What makes this special:**
- Zero hardcoded role benchmarks — Groq AI generates skill requirements for any job title on Earth
- MongoDB caching so each unique role is only queried once — subsequent lookups are instant and free
- Fully modular NestJS architecture following industry patterns
- Automatic progress tracker initialization on every analysis run

---

## System Architecture

```
Client (Angular)
       │
       ▼
NestJS REST API  ←→  Swagger UI (/docs)
       │
       ├── UsersModule      → CRUD + score history + login
       ├── ResumeModule     → PDF upload + text extraction + skill NLP
       ├── SkillsModule     → Keyword extraction engine (300+ skills)
       ├── RolesModule      → Groq AI benchmark + MongoDB cache
       ├── AnalysisModule   → Weighted gap scoring + orchestration
       ├── RoadmapModule    → Groq AI 3-day learning plan generation
       └── ProgressModule   → Skill state machine + streak algorithm
               │
               ▼
       MongoDB Atlas (Cloud)
               │
       ├── users collection
       ├── resumes collection
       ├── rolebenchmarks collection  ← AI response cache
       └── progresses collection
```

**Request lifecycle:**
```
POST /resume/upload
  → Multer intercepts multipart form
  → pdf-parse-fork extracts raw text
  → SkillsService regex scans 300+ keywords
  → Resume saved to MongoDB
  → User profile updated

POST /analysis/run
  → Resume skills fetched from MongoDB
  → RolesService checks MongoDB cache for role benchmark
  → Cache miss → Groq AI generates benchmark JSON
  → Benchmark cached for future requests
  → Weighted scoring: required (70%) + bonus (30%)
  → Groq AI generates 3-day roadmap for missing skills
  → Progress tracker auto-initialized
  → Score appended to user history array
  → Full result returned to client
```

---

## Tech Stack & Why

| Technology | Version | Why Chosen |
|---|---|---|
| **NestJS** | Latest | Forces modular architecture, built-in DI, decorators, testable by design |
| **TypeScript** | ~5.9 | Type safety catches bugs at compile time, not runtime |
| **MongoDB Atlas** | Cloud | Flexible schema perfect for variable resume/skill data |
| **Mongoose** | Latest | ODM layer with schema validation, population, middleware |
| **Groq AI** | API | Fastest free LLM inference — llama-3.1-8b-instant runs in < 1s |
| **pdf-parse-fork** | Latest | Fixed version of pdf-parse that works in NestJS without path export errors |
| **Multer** | Built-in | Multipart form parsing — memoryStorage avoids disk I/O |
| **@nestjs/swagger** | Latest | Auto-generates OpenAPI docs from decorators |
| **class-validator** | Latest | DTO validation — rejects malformed requests before they reach services |
| **Render** | Cloud | Free tier Node.js hosting with GitHub auto-deploy |

**Why NestJS over Express?**
Express is minimal and unopinionated — great for small projects, but scales messy. NestJS enforces the same architecture patterns that Angular uses (modules, services, DI), making the codebase predictable, testable, and maintainable at scale. Companies like Adidas, Roche, and hundreds of startups use NestJS in production.

**Why Groq over OpenAI/Gemini?**
- Gemini free tier had quota = 0 on our account
- OpenAI requires billing
- Groq: genuinely free, no credit card, 14,400 requests/day, < 1 second response times
- Runs llama-3.1-8b-instant which is sufficient for structured JSON generation

---

## Project Structure

```
src/
├── modules/
│   ├── users/
│   │   ├── users.module.ts        ← registers schema, exports service
│   │   ├── users.controller.ts    ← POST /users, GET /users/:id, POST /users/login
│   │   ├── users.service.ts       ← CRUD + findByEmail + saveAnalysis + scoreHistory
│   │   └── users.schema.ts        ← User document with scoreHistory[]
│   │
│   ├── resume/
│   │   ├── resume.module.ts       ← imports SkillsModule + UsersModule
│   │   ├── resume.controller.ts   ← POST /resume/upload, GET /resume/user/:id
│   │   ├── resume.service.ts      ← orchestrates upload pipeline
│   │   ├── resume.schema.ts       ← Resume document schema
│   │   └── pdf-parser.service.ts  ← wraps pdf-parse-fork with normalization
│   │
│   ├── skills/
│   │   ├── skills.module.ts
│   │   └── skills.service.ts      ← 300+ keyword taxonomy + regex extraction
│   │
│   ├── roles/
│   │   ├── roles.module.ts        ← imports ConfigModule
│   │   ├── roles.service.ts       ← MongoDB cache check → Groq fallback
│   │   ├── role-benchmark.schema.ts
│   │   ├── ai-provider.service.ts ← dev: Ollama, prod: Groq, auto-fallback
│   │   └── groq.service.ts        ← Groq API wrapper with JSON mode
│   │
│   ├── analysis/
│   │   ├── analysis.module.ts     ← imports all other modules
│   │   ├── analysis.controller.ts ← POST /analysis/run, GET /analysis/explain
│   │   └── analysis.service.ts    ← weighted scoring algorithm
│   │
│   ├── roadmap/
│   │   ├── roadmap.module.ts
│   │   └── roadmap.service.ts     ← Groq-powered dynamic plan generation
│   │
│   └── progress/
│       ├── progress.module.ts
│       ├── progress.controller.ts ← GET/PATCH /progress/:userId
│       └── progress.service.ts    ← state machine + streak algorithm
│
├── common/
│   ├── dto/
│   │   ├── create-user.dto.ts     ← name + email with class-validator
│   │   ├── upload-resume.dto.ts   ← userId + targetRole
│   │   └── run-analysis.dto.ts    ← userId + resumeId + targetRole
│   └── utils/
│       └── multer.config.ts       ← memoryStorage + PDF filter + 5MB limit
│
├── app.module.ts                  ← root module, MongoDB connection, ConfigModule
└── main.ts                        ← bootstrap, CORS, ValidationPipe, Swagger, port
```

---

## All API Endpoints

### Users

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Create user (returns existing if email found) |
| POST | `/api/users/login` | Login by email — returns user profile |
| GET  | `/api/users/:id` | Get user by MongoDB ID |
| PATCH| `/api/users/:id/role` | Update target role |
| GET  | `/api/users/:id/history` | Score history array for chart |

### Resume

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resume/upload` | Upload PDF + extract skills (multipart/form-data) |
| GET  | `/api/resume/user/:userId` | All resumes for user |
| GET  | `/api/resume/user/:userId/latest` | Most recent resume |

### Analysis

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analysis/run` | Run full gap analysis + generate roadmap |
| GET  | `/api/analysis/explain?role=X` | Preview skill benchmark for any role |
| GET  | `/api/analysis/heatmap/:userId` | Skill heatmap data for visualization |

### Progress

| Method | Endpoint | Description |
|---|---|---|
| POST  | `/api/progress/init` | Initialize tracker (called automatically) |
| GET   | `/api/progress/:userId` | Full progress dashboard data |
| PATCH | `/api/progress/:userId/skill` | Update skill status (not_started → in_progress → completed) |

---

## Key Features

### 1. Weighted Scoring Algorithm
```
Score = (Required Match % × 70) + (Bonus Match % × 30)

Example:
  Required: node, express, mongodb, postgresql, jwt, docker, git, rest api (8 skills)
  Matched:  node, express, mongodb, postgresql, jwt, docker (6/8)
  Required score: 6/8 × 70 = 52.5

  Bonus: redis, kubernetes, aws, graphql, nestjs, typescript (6 skills)
  Matched: aws, nestjs, typescript (3/6)
  Bonus score: 3/6 × 30 = 15

  Total: 67.5 → rounds to 68
```
This mirrors real hiring: missing a required skill hurts more than missing a bonus skill.

### 2. Skill Extraction with Word Boundary Regex
```typescript
const pattern = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i');
```
`\b` prevents false positives — "java" won't match inside "javascript". The 300+ keyword list covers all major tech, data, DevOps, and cloud skills.

### 3. MongoDB Caching for AI Responses
Every Groq AI response is cached by role name. The first request for "cardiac surgeon" calls Groq (~1s). Every subsequent request is served from MongoDB instantly with zero API cost. This is the cache-aside pattern used in production systems.

### 4. Streak Algorithm
```typescript
const diffDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
if (diffDays === 0) return currentStreak;        // same day
if (diffDays === 1) return currentStreak + 1;    // consecutive — increment
return 1;                                         // gap — reset
```
Same logic as Duolingo, GitHub contribution graphs, and LeetCode.

### 5. Score History Tracking
```typescript
$push: {
  scoreHistory: {
    score:      analysis.score,
    targetRole: dto.targetRole,
    analyzedAt: new Date(),
  }
}
```
`$push` appends without overwriting — builds a complete history array. Used for the score progression chart on the frontend.

---

## AI Integration

### Groq Service (Production)
```
Model:       llama-3.1-8b-instant
Temperature: 0.1 (deterministic, consistent JSON)
Format:      response_format: { type: 'json_object' }
Rate limit:  14,400 requests/day (free tier)
Latency:     ~500ms average
```

### What Groq generates
1. **Role Benchmark** — given "ux designer", returns required and bonus skills
2. **Learning Roadmap** — given missing skills, returns 3-day plans with tasks and resources
3. **Interview Questions** — given missing skills, returns questions with hints

### Why this is AI (not just hardcoded)
This is a **rule-based expert system** supplemented by a **generative AI** for zero-hardcoding. The system handles:
- "quantum ml researcher" → infers Python, TensorFlow, research, mathematics
- "maritime lawyer" → infers admiralty law, contract law, negotiation, compliance
- "blockchain architect" → infers Solidity, Ethereum, cryptography, distributed systems

No human ever defined these mappings. Groq figures it out.

---

## Database Design

### User Document
```typescript
{
  _id:          ObjectId,
  name:         string,
  email:        string (unique, lowercase),
  targetRole:   string,
  latestAnalysis: {
    score:      number,
    matched:    string[],
    missing:    string[],
    analyzedAt: Date,
  },
  scoreHistory: [{         // ← NEW: tracks score over time
    score:      number,
    targetRole: string,
    analyzedAt: Date,
  }],
  createdAt:    Date,      // auto from timestamps:true
  updatedAt:    Date,
}
```

### Resume Document
```typescript
{
  _id:            ObjectId,
  userId:         ObjectId (ref: User),
  originalFileName:string,
  extractedText:  string,
  detectedSkills: string[],
  targetRole:     string,
  analysisResult: object,
  createdAt:      Date,
}
```

### RoleBenchmark Document (AI Cache)
```typescript
{
  _id:          ObjectId,
  roleName:     string (unique, lowercase),
  required:     string[],
  good_to_have: string[],
  createdAt:    Date,
}
```

### Progress Document
```typescript
{
  _id:         ObjectId,
  userId:      ObjectId (ref: User, unique),
  targetRole:  string,
  skills: [{
    skill:       string,
    status:      'not_started' | 'in_progress' | 'completed',
    startedAt:   Date | null,
    completedAt: Date | null,
    daysSpent:   number,
  }],
  currentScore:    number,
  previousScore:   number,
  streak:          number,
  lastActivityDate:Date | null,
  totalCompleted:  number,
}
```

---

## Environment Variables

Create `.env` in project root:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillforge

# Groq API key (free at console.groq.com)
GROQ_API_KEY=gsk_your_key_here

# Application
PORT=3000
NODE_ENV=development
```

**Never commit `.env` to Git.** It is in `.gitignore` by default.

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/skillforge-backend.git
cd skillforge-backend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI and Groq API key

# 4. Start in development mode (watch mode, auto-restart)
npm run start:dev

# 5. Open Swagger docs
open http://localhost:3000/docs
```

**Available scripts:**
```bash
npm run start:dev    # Development with hot reload
npm run build        # Compile TypeScript to dist/
npm run start:prod   # Run compiled production build
```

---

## Deployment

Deployed on **Render** (free tier) with GitHub auto-deploy.

### Render Configuration
```
Build Command:  npm install && npm run build
Start Command:  node dist/src/main.js
Environment:    Node.js
Region:         Singapore (closest to India)
```

### Auto-deploy
Every `git push` to `main` triggers automatic rebuild and redeploy on Render. Zero manual steps.

### Production Checklist
- [x] `NODE_ENV=production` set in Render environment variables
- [x] `MONGODB_URI` points to Atlas (not localhost)
- [x] `GROQ_API_KEY` set in Render environment variables
- [x] CORS enabled for Vercel frontend domain
- [x] Global ValidationPipe with `whitelist: true`
- [x] `dist/src/main.js` as start command (NestJS compiles to dist/src/)

---

## Bugs Fixed

### 1. TypeScript null type error on `findByIdAndUpdate`
**Problem:** Mongoose `findByIdAndUpdate` returns `Document | null`. TypeScript rejected this when the return type was `UserDocument`.

**Fix:** Added explicit null check after the call:
```typescript
const updated = await this.userModel.findByIdAndUpdate(...).exec();
if (!updated) throw new NotFoundException(`User ${id} not found`);
return updated; // TypeScript narrows type from Document|null to Document
```

### 2. `forbidNonWhitelisted` rejecting valid DTO fields
**Problem:** Inline DTO classes without `class-validator` decorators caused all fields to be treated as unknown and rejected with 400.

**Fix:** All DTOs moved to `src/common/dto/` with proper `@IsString()`, `@IsEmail()`, `@IsNotEmpty()` decorators. Used `!` definite assignment assertion for TypeScript strict mode compatibility.

### 3. `pdf-parse` ERR_PACKAGE_PATH_NOT_EXPORTED
**Problem:** `pdf-parse` v1.1.1 uses an `exports` field in `package.json` that blocks subpath imports. Both `import * as pdfParse from 'pdf-parse'` and `require('pdf-parse/lib/pdf-parse.js')` failed.

**Fix:** Replaced with `pdf-parse-fork` which exports correctly without the broken test runner:
```bash
npm uninstall pdf-parse
npm install pdf-parse-fork
```

### 4. Gemini 1.5 Flash — 404 Model Not Found
**Problem:** Google deprecated Gemini 1.5 models. All requests returned 404.

**Fix:** Attempted upgrade to `gemini-2.0-flash` with new `@google/genai` SDK but hit quota = 0 on free tier. Switched to **Groq** which is genuinely free with no hidden quotas.

### 5. Roadmap showing "undefined" for unknown skills
**Problem:** `generateRoadmap` used `uncoveredSkills.map(({ skill }: any) => ...)` but `uncoveredSkills` was already `string[]` after `.map(({ skill }) => skill)`. Destructuring a string as `{ skill }` gives `undefined`.

**Fix:**
```typescript
// Before (bug)
const genericItems = uncoveredSkills.map(({ skill }: any) => ({

// After (fix)
const genericItems = uncoveredSkills.map((skill: string) => ({
```

### 6. `dist/main.js` not found on Render
**Problem:** NestJS with `sourceRoot: "src"` compiles to `dist/src/main.js` not `dist/main.js`. Render start command was wrong.

**Fix:**
```
Start Command: node dist/src/main.js
```
Also updated `tsconfig.build.json` with `"rootDir": "./src"`.

---

## Interview Talking Points

**"Why NestJS instead of Express?"**
NestJS enforces module boundaries, dependency injection, and separation of concerns by design. In Express you can put everything in one file — it scales messily. NestJS forces the same architecture patterns Angular uses, making the codebase predictable at any team size.

**"Explain Dependency Injection in your project."**
NestJS's DI container manages service instantiation. When `AnalysisController` declares `private readonly rolesService: RolesService` in its constructor, NestJS injects the singleton instance automatically. I never call `new RolesService()` — the framework handles it. This makes unit testing trivial — you mock the injected dependency.

**"How does your AI integration work?"**
Groq runs llama-3.1-8b-instant. I send a structured prompt asking for JSON output with `response_format: { type: 'json_object' }` which forces valid JSON. The response is parsed, normalized to lowercase, and cached in MongoDB. Cache-aside pattern: check DB first, miss → call Groq → store result.

**"What's your scoring algorithm?"**
Weighted: required skills contribute 70% of total score, bonus skills 30%. This mirrors real hiring — missing a required skill is more serious than missing a nice-to-have. `score = (matchedRequired/totalRequired * 70) + (matchedBonus/totalBonus * 30)`.

**"How did you handle file uploads?"**
Multer middleware with `memoryStorage` — the file never touches disk. It lives in RAM as a `Buffer`, gets passed to `pdf-parse-fork` for text extraction, then discarded. No disk I/O means faster processing and no cleanup needed. File type validated by MIME type, size capped at 5MB.

**"Explain your streak algorithm."**
Calculate days between `lastActivityDate` and now. Zero days = same day, don't double-count. One day = consecutive, increment. More than one day = gap, reset to 1. Identical to GitHub's contribution streak logic.

---

## What I Would Do Differently

1. Add **JWT authentication** with refresh tokens for production security
2. Implement **Redis** for the AI response cache instead of MongoDB for better performance
3. Add **rate limiting** per IP to prevent API abuse
4. Write **unit tests** for the scoring algorithm and skill extraction
5. Add **webhooks** to notify users when their analysis is ready (for long-running jobs)
6. Move to **microservices** — split resume parsing and AI inference into separate services

---

*Built with ❤️
*SkillForge demonstrates: NestJS architecture · AI integration · MongoDB design · REST API design · Deployment · TypeScript · Clean code patterns*
# MongoDB + Mongoose
npm install @nestjs/mongoose mongoose

# File Upload
npm install @nestjs/platform-express multer
npm install --save-dev @types/multer

# PDF Parsing
npm install pdf-parse
npm install --save-dev @types/pdf-parse

# Fuzzy Skill Matching
npm install fuse.js

# Config Management (best practice for env vars)
npm install @nestjs/config

# Validation (DTOs)
npm install class-validator class-transformer


# Create module folders manually inside src/
mkdir -p src/modules/users
mkdir -p src/modules/resume
mkdir -p src/modules/skills
mkdir -p src/modules/roles
mkdir -p src/modules/analysis
mkdir -p src/modules/roadmap
mkdir -p src/modules/progress
mkdir -p src/common/dto
mkdir -p src/common/utils

nest generate module modules/users
nest generate module modules/resume
nest generate module modules/skills
nest generate module modules/roles
nest generate module modules/analysis
nest generate module modules/roadmap
nest generate module modules/progress

# Users
nest generate controller modules/users
nest generate service modules/users

# Resume
nest generate controller modules/resume
nest generate service modules/resume

# Skills
nest generate service modules/skills

# Roles
nest generate service modules/roles

# Analysis
nest generate service modules/analysis

# Roadmap
nest generate service modules/roadmap

# Progress
nest generate controller modules/progress
nest generate service modules/progress
```


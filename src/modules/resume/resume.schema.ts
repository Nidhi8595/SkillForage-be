import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResumeDocument = Resume & Document;

@Schema({ timestamps: true })
export class Resume {

  // Reference to the User who uploaded this resume
  // This is a MongoDB relation — like a foreign key in SQL
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  originalFileName!: string;

  @Prop({ required: true })
  extractedText!: string; // raw text from PDF

  @Prop({ type: [String], default: [] })
  detectedSkills!: string[]; // skills found in resume

  @Prop({ required: true })
  targetRole!: string; // role user wants to match against

  @Prop({ type: Object })
  analysisResult!: {
    score: number;
    matched: string[];
    missing: string[];
    analyzedAt: Date;
  };
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
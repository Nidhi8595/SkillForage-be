import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgressDocument = Progress & Document;

export enum SkillStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Schema()
export class SkillProgress {

  @Prop({ required: true })
  skill!: string;

  @Prop({ enum: SkillStatus, default: SkillStatus.NOT_STARTED })
  status!: SkillStatus;

  // @Prop({ default: null })
  // startedAt!: Date | null;
  @Prop({ type: Date, required: false, default: null })
  startedAt!: Date | null;

  @Prop({ type: Date, required: false, default: null })
  completedAt!: Date | null;

  @Prop({ default: 0 })
  daysSpent!: number;    // how many days user worked on this skill
}

@Schema({ timestamps: true })
export class Progress {

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  targetRole!: string;

  @Prop({ type: [Object], default: [] })
  skills!: SkillProgress[];

  @Prop({ default: 0 })
  currentScore!: number;   // starts at analysis score

  @Prop({ default: 0 })
  previousScore!: number;  // score before last update

  @Prop({ default: 0 })
  streak!: number;         // days in a row with activity

  @Prop({
    type: Date, required: false,
    default: null
  })
  lastActivityDate!: Date | null;

  @Prop({ default: 0 })
  totalCompleted!: number; // total skills completed
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);
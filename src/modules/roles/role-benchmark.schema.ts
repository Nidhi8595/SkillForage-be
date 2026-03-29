import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleBenchmarkDocument = RoleBenchmark & Document;

@Schema({ timestamps: true })
export class RoleBenchmark {

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  roleName!: string;

  @Prop({ type: [String], default: [] })
  required!: string[];

  @Prop({ type: [String], default: [] })
  good_to_have!: string[];
}

export const RoleBenchmarkSchema = SchemaFactory.createForClass(RoleBenchmark);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// This type combines our class with Mongoose Document methods
// (like .save(), .deleteOne(), etc.)
export type UserDocument = User & Document;

@Schema({ timestamps: true }) // auto-adds createdAt and updatedAt
export class User {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop()
    targetRole: string; // e.g., "backend developer"

    @Prop({ type: [String], default: [] })
    uploadedResumes: string[]; // stores filenames or paths

    @Prop({ type: Object })
    latestAnalysis: {
        score: number;
        matched: string[];
        missing: string[];
        analyzedAt: Date;
    };
}

export const UserSchema = SchemaFactory.createForClass(User);
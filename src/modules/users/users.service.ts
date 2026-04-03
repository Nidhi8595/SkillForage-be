import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) { }

  // async create(name: string, email: string): Promise<UserDocument> {
  //   const user = new this.userModel({ name, email });
  //   return user.save();
  // }
  async create(name: string, email: string): Promise<UserDocument> {
  const existing = await this.userModel.findOne({ email }).exec();

  if (existing) {
    throw new BadRequestException('User already exists. Please login.');
  }

  const user = new this.userModel({ name, email });
  return user.save();
}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user; // TypeScript now knows: if we reach here, it's NOT null
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateTargetRole(id: string, role: string): Promise<UserDocument> {
    const user = await this.findById(id); // findById already handles null
    user.targetRole = role;
    return user.save();
  }

  // ✅ THE FIX IS HERE
  async saveAnalysis(
    id: string,
    analysis: { score: number; matched: string[]; missing: string[] }
  ): Promise<UserDocument> {

    const updated = await this.userModel.findByIdAndUpdate(
      id,
      {
        latestAnalysis: {
          ...analysis,
          analyzedAt: new Date(),
        },
      },
      { new: true }
    ).exec();

    // Explicitly handle the null case
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updated; // TypeScript now knows this is UserDocument, not null
  }

  // Find existing user by email — for login
  async login(email: string): Promise<UserDocument> {
  const user = await this.userModel
    .findOne({ email: email.toLowerCase().trim() })
    .exec();

  if (!user) {
    throw new NotFoundException(
      'No account found. Please sign up first.'
    );
  }

  return user;
}
}
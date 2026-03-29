import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { RolesService } from './roles.service';
import { GroqService } from './groq.service';
import { RoleBenchmark, RoleBenchmarkSchema } from './role-benchmark.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: RoleBenchmark.name, schema: RoleBenchmarkSchema },
    ]),
  ],
  providers: [RolesService, GroqService],
  exports: [RolesService],
})
export class RolesModule {}
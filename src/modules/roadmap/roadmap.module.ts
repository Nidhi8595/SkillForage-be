import { Module } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';

@Module({
  providers: [RoadmapService]
})
export class RoadmapModule {}

import { Module }        from '@nestjs/common';
import { ConfigModule }  from '@nestjs/config';
import { RoadmapService } from './roadmap.service';

@Module({
  imports:   [ConfigModule],
  providers: [RoadmapService],
  exports:   [RoadmapService],
})
export class RoadmapModule {}
import { Module } from '@nestjs/common';

import { AgeController } from './age.controller';
import { AgeApiService } from './age-api.service';

@Module({
  imports: [],
  controllers: [AgeController],
  providers: [AgeApiService],
})
export class AppModule {}

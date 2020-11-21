import { Module } from '@nestjs/common';

import { AgeController } from './age.controller';
import { AgeApiClient } from './age-api-client';
import { AgeApiService } from './age-api.service';

@Module({
  imports: [],
  controllers: [AgeController],
  providers: [AgeApiClient, AgeApiService],
})
export class AppModule {}

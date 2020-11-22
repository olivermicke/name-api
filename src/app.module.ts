import { CacheModule, HttpModule, Logger, Module } from '@nestjs/common';

import { NameController } from './name.controller';
import { NameApiClient } from './name-api.client';
import { NameApiService } from './name-api.service';

@Module({
  imports: [CacheModule.register({ max: 1000, ttl: 3600 }), HttpModule],
  controllers: [NameController],
  providers: [Logger, NameApiClient, NameApiService],
})
export class AppModule {}

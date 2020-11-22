import { Logger, Module } from '@nestjs/common';

import { NameController } from './name.controller';
import { NameApiClient } from './name-api.client';
import { NameApiService } from './name-api.service';

@Module({
  imports: [],
  controllers: [NameController],
  providers: [Logger, NameApiClient, NameApiService],
})
export class AppModule {}

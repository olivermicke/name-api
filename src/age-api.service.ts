import { Injectable } from '@nestjs/common';

import { AgeApiClient } from './age-api-client';

import { GetAgeInformationRequestDTO } from './age.controller';

@Injectable()
export class AgeApiService {
  constructor(private readonly ageApiClient: AgeApiClient) {}

  async getEstimatedAge(params: GetAgeInformationRequestDTO): Promise<number> {
    const response = await this.ageApiClient.getEstimatedAge(params);
    return response.age;
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { IsString } from 'class-validator';

import { AgeApiService } from './age-api.service';

export class GetAgeInformationRequestDTO {
  @IsString()
  name: string;
}

interface IGetAgeInformationResponseDTO {
  estimatedAge: number;
}

@Controller('age')
export class AgeController {
  constructor(private readonly ageApiService: AgeApiService) {}

  @Get(':name')
  async getAgeInformation(
    @Param() params: GetAgeInformationRequestDTO,
  ): Promise<IGetAgeInformationResponseDTO> {
    const estimatedAge = await this.ageApiService.getEstimatedAge(params);

    return { estimatedAge };
  }
}

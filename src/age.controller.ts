import { Controller, Get, Param } from '@nestjs/common';
import { IsString } from 'class-validator';

import { AgeApiService, IGetGuessedNameInformation } from './age-api.service';

export class GetAgeInformationRequestDTO {
  @IsString()
  name: string;
}

interface IGetGuessedNameInformationDTO extends IGetGuessedNameInformation {}

@Controller()
export class AgeController {
  constructor(private readonly ageApiService: AgeApiService) {}

  @Get(':name')
  async getGuessedNameInformation(
    @Param() params: GetAgeInformationRequestDTO,
  ): Promise<IGetGuessedNameInformationDTO> {
    const guessedNameInformation = await this.ageApiService.getGuessedNameInformation(
      params,
    );

    return guessedNameInformation;
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { IsString } from 'class-validator';

import { NameApiService } from './name-api.service';

import { CountryNamesEnum } from './country-names';
import { GenderEnum } from './name-api.client';

export class GetGuessedNameInformationRequestDTO {
  @IsString()
  name: string;
}

export interface IGetGuessedNameInformationResponseDTO {
  name: string;
  age: number;
  gender: {
    gender: GenderEnum;
    probability: string;
  };
  nationality: {
    country: CountryNamesEnum;
    probability: string;
  }[];
}

@Controller()
export class NameController {
  constructor(private readonly nameApiService: NameApiService) {}

  @Get(':name')
  async getGuessedNameInformation(
    @Param() params: GetGuessedNameInformationRequestDTO,
  ): Promise<IGetGuessedNameInformationResponseDTO> {
    const guessedNameInformation = await this.nameApiService.getGuessedNameInformation(
      params,
    );

    return guessedNameInformation;
  }
}

import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { NameApiService } from './name-api.service';

import { CountryCode, CountryNamesEnum, COUNTRY_CODES } from './country-names';
import { GenderEnum } from './name-api.client';

class GetGuessedNameInformationParams {
  @IsString()
  name: string;
}

class GetGuessedNameInformationQuery {
  @IsOptional()
  @IsIn(COUNTRY_CODES)
  country?: CountryCode;
}

export interface IGetGuessedNameInformationRequestDTO
  extends GetGuessedNameInformationParams,
    GetGuessedNameInformationQuery {}

export interface IGetGuessedNameInformationResponseDTO {
  name: string;
  age: {
    age: number;
    country?: CountryNamesEnum;
  };
  gender: {
    gender: GenderEnum;
    probability: string;
    country?: CountryNamesEnum;
  };
  nationality: {
    country: CountryNamesEnum;
    probability: string;
  }[];
}

@Controller()
export class NameController {
  constructor(
    private readonly nameApiService: NameApiService,
    private readonly logger: Logger,
  ) {}

  @Get(':name')
  async getGuessedNameInformation(
    @Param() params: GetGuessedNameInformationParams,
    @Query() query: GetGuessedNameInformationQuery,
  ): Promise<IGetGuessedNameInformationResponseDTO> {
    this.logger.log(
      `called ":name" with "name=${params.name}" and "country=${query.country}"`,
    );

    const guessedNameInformation = await this.nameApiService.getGuessedNameInformation(
      { ...params, ...query },
    );

    return guessedNameInformation;
  }
}

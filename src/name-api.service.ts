import { Injectable } from '@nestjs/common';

import {
  GetGuessedNameInformationRequestDTO,
  IGetGuessedNameInformationResponseDTO,
} from './name.controller';
import { NameApiClient } from './name-api.client';

import { CountryNamesEnum } from './country-names';

function probabilityToPercentage(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

@Injectable()
export class NameApiService {
  constructor(private readonly nameApiClient: NameApiClient) {}

  async getGuessedNameInformation(
    params: GetGuessedNameInformationRequestDTO,
  ): Promise<IGetGuessedNameInformationResponseDTO> {
    const {
      age,
      gender,
      name,
      nationality,
    } = await this.nameApiClient.getGuessedNameInformation(params);

    return {
      name,
      age: age.age,
      gender: {
        gender: gender.gender,
        probability: probabilityToPercentage(gender.probability),
      },
      nationality: nationality.country.map((nation) => ({
        country: CountryNamesEnum[nation.country_id],
        probability: probabilityToPercentage(nation.probability),
      })),
    };
  }
}

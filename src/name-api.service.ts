import { Injectable } from '@nestjs/common';

import {
  IGetGuessedNameInformationRequestDTO,
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
    requestDTO: IGetGuessedNameInformationRequestDTO,
  ): Promise<IGetGuessedNameInformationResponseDTO> {
    const {
      age,
      gender,
      name,
      nationality,
    } = await this.nameApiClient.getGuessedNameInformation(requestDTO);

    return {
      name,
      age: {
        age: age.age,
        country: CountryNamesEnum[age.country_id],
      },
      gender: {
        gender: gender.gender,
        probability: probabilityToPercentage(gender.probability),
        country: CountryNamesEnum[gender.country_id],
      },
      nationality: nationality.country.map((nation) => ({
        country: CountryNamesEnum[nation.country_id],
        probability: probabilityToPercentage(nation.probability),
      })),
    };
  }
}

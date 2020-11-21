import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { GetAgeInformationRequestDTO } from './age.controller';

export interface IEstimatedAgeResponseDTO {
  name: string;
  age: number;
  count: number;
}

export interface IGuessedGenderResponseDTO {
  name: string;
  gender: string;
  probability: number;
  count: number;
}

export interface IGuessedNationalityResponseDTO {
  name: string;
  country: { country_id: string; probability: number }[];
}

export interface IGetGuessedNameInformation {
  age: IEstimatedAgeResponseDTO;
  gender: IGuessedGenderResponseDTO;
  nationality: IGuessedNationalityResponseDTO;
}

@Injectable()
export class AgeApiService {
  async getGuessedAge({
    name,
  }: GetAgeInformationRequestDTO): Promise<IEstimatedAgeResponseDTO> {
    const response = await axios.get(`https://api.agify.io/?name=${name}`);
    return response.data;
  }

  async getGuessedGender({
    name,
  }: GetAgeInformationRequestDTO): Promise<IGuessedGenderResponseDTO> {
    const response = await axios.get(`https://api.genderize.io/?name=${name}`);
    return response.data;
  }

  async getGuessedNationality({
    name,
  }: GetAgeInformationRequestDTO): Promise<IGuessedNationalityResponseDTO> {
    const response = await axios.get(
      `https://api.nationalize.io/?name=${name}`,
    );
    return response.data;
  }

  async getGuessedNameInformation(
    params: GetAgeInformationRequestDTO,
  ): Promise<IGetGuessedNameInformation> {
    const [age, gender, nationality] = await Promise.all([
      this.getGuessedAge(params),
      this.getGuessedGender(params),
      this.getGuessedNationality(params),
    ]);

    return { age, gender, nationality };
  }
}

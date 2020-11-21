import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { GetAgeInformationRequestDTO } from './age.controller';

export interface IEstimatedAgeResponseDTO {
  name: string;
  age: number;
  count: number;
}

@Injectable()
export class AgeApiClient {
  async getEstimatedAge({
    name,
  }: GetAgeInformationRequestDTO): Promise<IEstimatedAgeResponseDTO> {
    const response = await axios.get(`https://api.agify.io/?name=${name}`);
    return response.data;
  }
}

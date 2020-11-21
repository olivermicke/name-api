import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsString,
  validate,
  ValidateNested,
} from 'class-validator';
import { plainToClass } from 'class-transformer';

import { GetGuessedNameInformationRequestDTO } from './name.controller';
import { CountryCode, COUNTRY_CODES } from './country-names';

export interface IGetGuessedNameInformation {
  age: GuessedAgeResponseDTO;
  gender: GuessedGenderResponseDTO;
  name: string;
  nationality: GuessedNationalityResponseDTO;
}

class GuessedAgeResponseDTO {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsNumber()
  count: number;
}

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
}

class GuessedGenderResponseDTO {
  @IsString()
  name: string;

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsNumber()
  probability: number;

  @IsNumber()
  count: number;
}

class CountryDTO {
  @IsIn(COUNTRY_CODES)
  country_id: CountryCode;

  @IsNumber()
  probability: number;
}
class GuessedNationalityResponseDTO {
  @IsString()
  name: string;

  @ValidateNested({ each: true })
  country: CountryDTO[];
}

async function fetchData<T>(url: string): Promise<T> {
  return axios
    .get(url)
    .then((response: AxiosResponse): T => response.data)
    .catch((error: AxiosError): never => {
      console.log(error);
      throw new InternalServerErrorException();
    });
}

async function validateDTO(
  dto:
    | GuessedAgeResponseDTO
    | GuessedGenderResponseDTO
    | GuessedNationalityResponseDTO,
) {
  const validationErrors = await validate(dto);

  if (validationErrors.length > 0) {
    console.log(validationErrors);
    throw new ServiceUnavailableException();
  }
}

@Injectable()
export class NameApiClient {
  public async getGuessedNameInformation(
    params: GetGuessedNameInformationRequestDTO,
  ): Promise<IGetGuessedNameInformation> {
    const [age, gender, nationality] = await Promise.all([
      this.getGuessedAge(params),
      this.getGuessedGender(params),
      this.getGuessedNationality(params),
    ]);

    return { age, gender, name: params.name, nationality };
  }

  private async getGuessedAge({
    name,
  }: GetGuessedNameInformationRequestDTO): Promise<GuessedAgeResponseDTO> {
    const data = await fetchData(`https://api.agify.io/?name=${name}`);

    const classData = plainToClass(GuessedAgeResponseDTO, data);
    await validateDTO(classData);

    return classData;
  }

  private async getGuessedGender({
    name,
  }: GetGuessedNameInformationRequestDTO): Promise<GuessedGenderResponseDTO> {
    const data = await fetchData(`https://api.genderize.io/?name=${name}`);

    const classData = plainToClass(GuessedGenderResponseDTO, data);
    await validateDTO(classData);

    return classData;
  }

  private async getGuessedNationality({
    name,
  }: GetGuessedNameInformationRequestDTO): Promise<
    GuessedNationalityResponseDTO
  > {
    const data = await fetchData(`https://api.nationalize.io/?name=${name}`);

    const classData = plainToClass(GuessedNationalityResponseDTO, data);
    classData.country = plainToClass(CountryDTO, classData.country);
    await validateDTO(classData);

    return classData;
  }
}

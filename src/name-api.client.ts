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
  IsOptional,
  IsString,
  validate,
  ValidateNested,
} from 'class-validator';
import { plainToClass } from 'class-transformer';

import { IGetGuessedNameInformationRequestDTO } from './name.controller';
import { CountryCode, COUNTRY_CODES } from './country-names';

export interface IGetGuessedNameInformation {
  name: string;
  country_id?: CountryCode;
  age: GuessedAgeResponseDTO;
  gender: GuessedGenderResponseDTO;
  nationality: GuessedNationalityResponseDTO;
}

class GuessedAgeResponseDTO {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsNumber()
  count: number;

  @IsOptional()
  @IsIn(COUNTRY_CODES)
  country_id: CountryCode;
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

  @IsOptional()
  @IsIn(COUNTRY_CODES)
  country_id: CountryCode;
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

enum NameApiApplicationNamesEnum {
  AGIFY = 'agify',
  GENDERIZE = 'genderize',
  NATIONALIZE = 'nationalize',
}

function urlBuilder(
  application: 'agify' | 'genderize' | 'nationalize',
  { name, country }: IGetGuessedNameInformationRequestDTO,
): string {
  let url = `https://api.${application}.io?name=${name}`;

  if (country) {
    url += `&country_id=${country}`;
  }

  return url;
}

async function fetchData<T>(
  applicationName: NameApiApplicationNamesEnum,
  requestDTO: IGetGuessedNameInformationRequestDTO,
): Promise<T> {
  const url = urlBuilder(applicationName, requestDTO);

  return axios
    .get(url)
    .then((response: AxiosResponse): T => response.data)
    .catch((error: AxiosError): never => {
      console.log(`Error while fetching from "${url}"`, error);
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
    requestDTO: IGetGuessedNameInformationRequestDTO,
  ): Promise<IGetGuessedNameInformation> {
    const [age, gender, nationality] = await Promise.all([
      this.getGuessedAge(requestDTO),
      this.getGuessedGender(requestDTO),
      this.getGuessedNationality(requestDTO),
    ]);

    return {
      age,
      gender,
      name: age.name,
      nationality,
    };
  }

  private async getGuessedAge(
    requestDTO: IGetGuessedNameInformationRequestDTO,
  ): Promise<GuessedAgeResponseDTO> {
    const data = await fetchData(NameApiApplicationNamesEnum.AGIFY, requestDTO);

    const classData = plainToClass(GuessedAgeResponseDTO, data);
    await validateDTO(classData);

    return classData;
  }

  private async getGuessedGender(
    requestDTO: IGetGuessedNameInformationRequestDTO,
  ): Promise<GuessedGenderResponseDTO> {
    const data = await fetchData(
      NameApiApplicationNamesEnum.GENDERIZE,
      requestDTO,
    );

    const classData = plainToClass(GuessedGenderResponseDTO, data);
    await validateDTO(classData);

    return classData;
  }

  private async getGuessedNationality(
    requestDTO: IGetGuessedNameInformationRequestDTO,
  ): Promise<GuessedNationalityResponseDTO> {
    const data = await fetchData(
      NameApiApplicationNamesEnum.NATIONALIZE,
      requestDTO,
    );

    const classData = plainToClass(GuessedNationalityResponseDTO, data);
    classData.country = plainToClass(CountryDTO, classData.country);
    await validateDTO(classData);

    return classData;
  }
}

import {
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
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

  @IsOptional()
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

  @IsOptional()
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

@Injectable()
export class NameApiClient {
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
  ) {}

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
    const data = await this.fetchData(
      NameApiApplicationNamesEnum.AGIFY,
      requestDTO,
    );

    const classData = plainToClass(GuessedAgeResponseDTO, data);
    await this.validateDTO(classData);

    return classData;
  }

  private async getGuessedGender(
    requestDTO: IGetGuessedNameInformationRequestDTO,
  ): Promise<GuessedGenderResponseDTO> {
    const data = await this.fetchData(
      NameApiApplicationNamesEnum.GENDERIZE,
      requestDTO,
    );

    const classData = plainToClass(GuessedGenderResponseDTO, data);
    await this.validateDTO(classData);

    return classData;
  }

  private async getGuessedNationality(
    requestDTO: IGetGuessedNameInformationRequestDTO,
  ): Promise<GuessedNationalityResponseDTO> {
    const data = await this.fetchData(
      NameApiApplicationNamesEnum.NATIONALIZE,
      requestDTO,
    );

    const classData = plainToClass(GuessedNationalityResponseDTO, data);
    classData.country = plainToClass(CountryDTO, classData.country);
    await this.validateDTO(classData);

    return classData;
  }

  private async fetchData<T>(
    applicationName: NameApiApplicationNamesEnum,
    requestDTO: IGetGuessedNameInformationRequestDTO,
  ): Promise<T> {
    const url = this.urlBuilder(applicationName, requestDTO);

    this.logger.log(`executing GET request on external endpoint ${url}`);

    return this.httpService
      .get(url)
      .toPromise()
      .then((response: AxiosResponse): T => response.data)
      .catch((error: AxiosError): never => {
        this.logger.error(`Error while fetching from "${url}"`, String(error));
        throw new InternalServerErrorException();
      });
  }

  private urlBuilder(
    application: 'agify' | 'genderize' | 'nationalize',
    { name, country }: IGetGuessedNameInformationRequestDTO,
  ): string {
    let url = `https://api.${application}.io?name=${name}`;

    if (country) {
      url += `&country_id=${country}`;
    }

    return url;
  }

  private async validateDTO(
    dto:
      | GuessedAgeResponseDTO
      | GuessedGenderResponseDTO
      | GuessedNationalityResponseDTO,
  ) {
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      this.logger.log(
        `Encountered validation error(s) while validating dto ${dto}`,
        validationErrors.join(''),
      );
      throw new ServiceUnavailableException();
    }
  }
}

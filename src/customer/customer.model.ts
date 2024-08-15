import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const regexAlphabetsSpaces = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export class CreateCustomerDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters longs' })
  @Matches(regexAlphabetsSpaces, { message: 'First name must contain only letters' })
  firstName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters longs' })
  @Matches(regexAlphabetsSpaces, { message: 'Last name must contain only letters' })
  lastName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(2, { message: 'Password must be at least 2 characters longs' })
  password: string;

  @ApiProperty()
  @IsString({
    message:
      'The phone number you entered is not in the correct format. Please use a 10-digit number (e.g., 123-456-7890).',
  })
  cellphone: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  email: string;
}

export class CustomerRefreshTokenDTO {
  @ApiProperty()
  refreshToken: string;
}

export class CustomerJwtDTO {
  @ApiProperty()
  customerId: string;
  @ApiProperty()
  token: string;
  @ApiProperty()
  issuedAt: string;
  @ApiProperty()
  expAt: string;
  @ApiProperty()
  refreshToken: string;
}

export class CustomerDTO {
  @ApiProperty()
  customerId: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  cellphone: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  email: string;
}

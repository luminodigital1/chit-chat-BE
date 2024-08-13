import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CustomerDTO, CustomerJwtDTO } from 'src/customer/customer.model';

export class LoginDTO {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class CustomerLoginResDTO {
  @ApiProperty()
  jwt: CustomerJwtDTO;

  @ApiProperty()
  customer: CustomerDTO;
}

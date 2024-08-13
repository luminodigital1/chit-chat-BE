import { DatabaseService } from 'src/database/database.service';
import { CustomerLoginResDTO, LoginDTO } from './auth.model';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { comparePassword } from 'src/utils';
import { CustomerUser } from 'src/JwtStrategy/customer.jwt.strategy';
import { CustomerService } from 'src/customer/customer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly customerService: CustomerService,
  ) {}

  async login(customer: LoginDTO): Promise<CustomerLoginResDTO> {
    const { email, password } = customer;
    const result = await this.db.query({
      text: 'Select * FROM customer WHERE email = $1',
      values: [email],
    });
    if (result.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const isCorrectPassword = await comparePassword(password, result.rows[0].password);
    if (!isCorrectPassword) {
      throw new BadRequestException('Incorrect password');
    }

    const jwtTokenData = await this.customerService.createUnknownToken(result.rows[0].id);
    return {
      jwt: jwtTokenData,
      customer: await this.customerService.getCustomer(email),
    };
  }
}

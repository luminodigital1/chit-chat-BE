import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import * as sql from 'sql-bricks-postgres';
import { v4 as uidv4 } from 'uuid';

import { DatabaseService } from 'src/database/database.service';
import {
  CreateCustomerDTO,
  CustomerDTO,
  CustomerJwtDTO,
  CustomerRefreshTokenDTO,
} from './customer.model';
import { JWT_CUSTOMER_AUD } from 'src/JwtStrategy/customer.jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { hashPassword } from 'src/utils';

@Injectable()
export class CustomerService {
  constructor(
    private db: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async getCustomer(email: string): Promise<CustomerDTO> {
    const query = sql
      .select(
        'id as "customerId"',
        'first_name as "firstName"',
        'last_name as "lastName"',
        'cell_phone as "cellphone"',
        'email',
        'password',
      )
      .from('customer')
      .where({ email: email });
    const result = await this.db.query(query.toParams());
    if (result.rows.length === 0) {
      throw new NotFoundException('Customer not found');
    }
    return result.rows[0];
  }

  async getCustomerById(id: string): Promise<CustomerDTO> {
    const query = sql
      .select(
        'id as "customerId"',
        'first_name as "firstName"',
        'last_name as "lastName"',
        'cell_phone as "cellphone"',
        'email',
        'password',
      )
      .from('customer')
      .where({ id: id });
    const result = await this.db.query(query.toParams());
    if (result.rows.length === 0) {
      throw new NotFoundException('Customer not found');
    }
    return result.rows[0];
  }
  async register(customer: CreateCustomerDTO) {
    const cellphone = await this.db.query({
      text: 'select id from customer where cell_phone = $1',
      values: [customer.cellphone],
    });

    if (cellphone.rows.length > 0) {
      throw new NotAcceptableException('This cellphone number is already registered.');
    }

    const email = await this.db.query({
      text: 'select id from customer where email = $1',
      values: [customer.email],
    });

    if (email.rows.length > 0) {
      throw new NotAcceptableException('This email is already registered.');
    }

    const hashedPassword = await hashPassword(customer.password);
    customer.password = hashedPassword;

    const query = sql
      .insert('customer', {
        id: uidv4(),
        created_at: sql('now()'),
        updated_at: sql('now()'),
        first_name: customer.firstName,
        last_name: customer.lastName,
        cell_phone: customer.cellphone,
        password: customer.password,
        email: customer.email,
      })
      .returning('id as "id"')
      .onConflict('id')
      .doNothing();
    const result = await this.db.query(query.toParams());

    if (result.rows.length > 0) this.createUnknownToken(result.rows[0].id);
    return customer;
  }

  async createUnknownToken(customerId: string) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 30 * 60 * 60;
    const aud = JWT_CUSTOMER_AUD;
    const token = this.jwtService.sign({
      sub: customerId,
      aud,
      iat,
      exp,
    });

    const expRefresh = iat + 365 * 24 * 60 * 60;
    const refreshToken = this.jwtService.sign({
      sub: customerId,
      aud,
      iat,
      exp: expRefresh,
    });

    const customerJwtResult = await this.db.query(
      sql
        .insert('customer_jwt', {
          customer_id: customerId,
          created_at: sql('now()'),
          device: {},
          token: token,
          issued_at: new Date(iat * 1000),
          exp_at: new Date(exp * 1000),
          refresh_token: refreshToken,
        })
        .returning(
          'customer_id as "customerId"',
          'token as "token"',
          'issued_at as "issuedAt"',
          'exp_at as "expAt"',
          'refresh_token as "refreshToken"',
        )
        .toParams(),
    );

    return {
      customerId,
      token,
      issuedAt: new Date(exp * 1000).toJSON(),
      expAt: new Date(exp * 1000).toJSON(),
      refreshToken,
    };
  }

  async refreshToken(body: CustomerRefreshTokenDTO): Promise<CustomerJwtDTO> {
    try {
      const payload = this.jwtService.verify(body.refreshToken);
      if (payload.aud === JWT_CUSTOMER_AUD) {
        return this.getRefreshToken(payload);
      }
    } catch (err) {
      throw new NotFoundException(
        `The refresh token is invalid '${body.refreshToken?.substring(0, 15)}...'`,
      );
    }
  }

  async getRefreshToken(payload: any): Promise<CustomerJwtDTO> {
    const customerId = payload.sub;
    const result = this.createUnknownToken(customerId);
    return result;
  }
}

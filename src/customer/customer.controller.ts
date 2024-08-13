import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  CustomerJwtAuthGuard,
  CustomerUser,
  RequestUser,
} from 'src/JwtStrategy/customer.jwt.strategy';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  CreateCustomerDTO,
  CustomerDTO,
  CustomerJwtDTO,
  CustomerRefreshTokenDTO,
} from './customer.model';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiBody({ type: CreateCustomerDTO })
  @ApiResponse({ type: CreateCustomerDTO, status: 201 })
  @Post('register')
  async register(@Body() body: CreateCustomerDTO): Promise<CreateCustomerDTO | undefined> {
    const result = await this.customerService.register(body);
    return result;
  }

  @ApiBody({ type: CustomerRefreshTokenDTO })
  @ApiResponse({ type: CustomerJwtDTO, status: 201 })
  @Post('refresh')
  async token(@Body() body: CustomerRefreshTokenDTO): Promise<CustomerJwtDTO | undefined> {
    return this.customerService.refreshToken(body);
  }

  @ApiResponse({ type: CustomerDTO, status: 201 })
  @Get()
  async getCustomer(@Body() id: string): Promise<CustomerDTO | undefined> {
    const result = await this.customerService.getCustomer(id);
    return result;
  }

  @ApiResponse({ type: CustomerDTO, status: 201 })
  @Get(':id')
  async getCustomerById(@Param('id') id: string): Promise<CustomerDTO | undefined> {
    const result = await this.customerService.getCustomerById(id);
    return result;
  }
}

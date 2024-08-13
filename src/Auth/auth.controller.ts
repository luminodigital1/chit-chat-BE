import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CustomerJwtAuthGuard,
  CustomerUser,
  RequestUser,
} from 'src/JwtStrategy/customer.jwt.strategy';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CustomerLoginResDTO, LoginDTO } from './auth.model';
import { CustomerService } from 'src/customer/customer.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //   @UseGuards(CustomerJwtAuthGuard)
  //   @ApiBearerAuth()
  @ApiBody({ type: LoginDTO })
  @ApiResponse({ status: 201 })
  @Post('login')
  async login(
    @Body() body: LoginDTO,
    // @RequestUser() user: CustomerUser,
  ): Promise<CustomerLoginResDTO> {
    return await this.authService.login(body);
  }
}

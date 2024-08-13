import { BadRequestException, Module, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CustomerController } from './customer/customer.controller';
import { CustomerService } from './customer/customer.service';
import { DatabaseService } from './database/database.service';
import { CustomerJwtStrategy } from './JwtStrategy/customer.jwt.strategy';
import { AuthController } from './Auth/auth.controller';
import { AuthService } from './Auth/auth.service';
import { MessageController } from './messege/message.controller';
import { MessageService } from './messege/message.service';
import { MessageGateway } from './messege/message.gateway';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [CustomerController, AuthController, MessageController],
  providers: [
    CustomerService,
    DatabaseService,
    CustomerJwtStrategy,
    AuthService,
    MessageService,
    MessageGateway,
  ],
})
export class AppModule {}

export function createValidationPipe() {
  return new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    validationError: {
      target: true,
      value: true,
    },
    exceptionFactory: (errors) => {
      const message = createErrors(errors).flat();
      return new BadRequestException(message, 'validation exception');
    },
  });
}

function createErrors(errors: ValidationError[], property = ''): any[] {
  return errors.map((error) => createError(error, property));
}

function createError(error: ValidationError, property: string) {
  if (error.constraints) {
    return { property: property + error.property, constraints: error.constraints };
  } else if (error.children) {
    return createErrors(error.children, property + error.property + '.').flat();
  }
}

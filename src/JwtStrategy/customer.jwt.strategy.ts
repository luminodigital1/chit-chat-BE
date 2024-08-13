import { createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export interface CustomerUser {
  customerId: string;
}

export const JWT_CUSTOMER_AUD = 'c';
@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const now = Math.floor(Date.now() / 1000);
    if (payload.aud === JWT_CUSTOMER_AUD && payload.exp >= now) {
      return { customerId: payload.sub, customer: true };
    }
    return null;
  }
}

@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('customer-jwt') {}

export const RequestUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as CustomerUser;
});

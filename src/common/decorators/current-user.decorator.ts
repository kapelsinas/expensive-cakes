import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUserData = {
  id: string;
  email: string;
  displayName: string;
};

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();

    // Mock user for development/demo
    // In production, this would come from JWT token or session
    return (
      request.user ?? {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@example.com',
        displayName: 'Demo User',
      }
    );
  },
);

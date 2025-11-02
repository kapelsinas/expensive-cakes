import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Zod validation globally
  patchNestjsSwagger();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Enable CORS for development
  app.enableCors();

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Multi-Provider Checkout Platform')
    .setDescription(
      'A scalable cart, order, and payment system with multi-provider strategy pattern. ' +
        'Demonstrates clean architecture, SOLID principles, and extensible payment integration.',
    )
    .setVersion('1.0')
    .addTag('cart', 'Shopping cart operations')
    .addTag('orders', 'Order management and checkout')
    .addTag('payments', 'Payment provider integration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule, createValidationPipe } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const { version } = require('../package.json');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const needSwagger = process.env.SWAGGER_ENABLED === 'true';
  if (needSwagger) {
    Logger.log(`Let's have swagger.`);
    const options = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Alter Mobility Subscription Api')
      .setDescription('')
      .setVersion(version)
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  app.useGlobalPipes(createValidationPipe());
  app.enableCors({
    origin: true,
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();

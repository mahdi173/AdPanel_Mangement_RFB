import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layout/main' });
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  // Custom HBS helpers
  hbs.registerHelper('eq', (a, b) => a === b);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { SmtpModule } from './smtp/smtp.module';
import { TlsModule } from './tls/tls.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EmailModule,
    SmtpModule,
    TlsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

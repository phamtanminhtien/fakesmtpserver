import { Module } from '@nestjs/common';
import { SmtpService } from './smtp.service';
import { SmtpController } from './smtp.controller';
import { EmailModule } from '../email/email.module';
import { TlsModule } from '../tls/tls.module';

@Module({
  imports: [EmailModule, TlsModule],
  controllers: [SmtpController],
  providers: [SmtpService],
  exports: [SmtpService],
})
export class SmtpModule {}

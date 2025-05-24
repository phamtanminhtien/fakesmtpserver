import { ApiProperty } from '@nestjs/swagger';

export class Email {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Time email was received' })
  receivedAt: Date;

  @ApiProperty({ description: 'Email from address' })
  from: string;

  @ApiProperty({ description: 'Email to addresses' })
  to: string[];

  @ApiProperty({ description: 'Email subject' })
  subject: string;

  @ApiProperty({ description: 'Email text content' })
  text?: string;

  @ApiProperty({ description: 'Email HTML content' })
  html?: string;

  @ApiProperty({ description: 'Raw email content' })
  raw: string;
}

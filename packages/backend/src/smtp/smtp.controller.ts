import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SmtpService } from './smtp.service';

@ApiTags('smtp')
@Controller('smtp')
export class SmtpController {
  constructor(private readonly smtpService: SmtpService) {}

  @Get('connection-info')
  @ApiOperation({ summary: 'Get SMTP server connection information' })
  @ApiResponse({
    status: 200,
    description: 'Returns connection details for the SMTP server',
    schema: {
      type: 'object',
      properties: {
        host: { type: 'string', example: '192.168.1.100' },
        port: { type: 'number', example: 2525 },
        secure: { type: 'boolean', example: false },
        requiresAuth: { type: 'boolean', example: false },
        auth: {
          type: 'object',
          nullable: true,
          properties: {
            user: { type: 'string', example: 'testuser' },
            pass: { type: 'string', example: 'testpass' },
          },
        },
      },
    },
  })
  getConnectionInfo() {
    return this.smtpService.getConnectionInfo();
  }
}

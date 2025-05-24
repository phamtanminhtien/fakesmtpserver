import {
  Controller,
  Get,
  Delete,
  Param,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { Email } from './email.model';

@ApiTags('emails')
@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  @ApiOperation({ summary: 'Get all emails' })
  @ApiResponse({
    status: 200,
    description: 'Return all received emails',
    type: [Email],
  })
  getAllEmails(): Email[] {
    return this.emailService.getAllEmails();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email by ID' })
  @ApiParam({ name: 'id', description: 'Email ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the email by ID',
    type: Email,
  })
  @ApiResponse({ status: 404, description: 'Email not found' })
  getEmailById(@Param('id') id: string): Email {
    const email = this.emailService.getEmailById(id);
    if (!email) {
      throw new NotFoundException(`Email with ID ${id} not found`);
    }
    return email;
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all emails' })
  @ApiResponse({ status: 204, description: 'All emails deleted' })
  @HttpCode(204)
  deleteAllEmails(): void {
    this.emailService.deleteAllEmails();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete email by ID' })
  @ApiParam({ name: 'id', description: 'Email ID' })
  @ApiResponse({ status: 204, description: 'Email deleted' })
  @ApiResponse({ status: 404, description: 'Email not found' })
  @HttpCode(204)
  deleteEmailById(@Param('id') id: string): void {
    const deleted = this.emailService.deleteEmailById(id);
    if (!deleted) {
      throw new NotFoundException(`Email with ID ${id} not found`);
    }
  }
}

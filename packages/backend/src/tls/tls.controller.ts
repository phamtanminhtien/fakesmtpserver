import {
  Controller,
  Post,
  Get,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { TlsService } from './tls.service';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@ApiTags('tls')
@Controller('tls')
export class TlsController {
  constructor(private readonly tlsService: TlsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload TLS certificate and private key' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Certificate uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        uploadedAt: { type: 'string', format: 'date-time' },
        isActive: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid certificate or key files',
  })
  @UseInterceptors(FilesInterceptor('files', 2))
  async uploadCertificate(@UploadedFiles() files: MulterFile[]) {
    if (!files || files.length !== 2) {
      throw new BadRequestException(
        'Please upload exactly 2 files: certificate (.crt or .pem) and private key (.key or .pem)',
      );
    }

    // Find certificate and key files based on filename or content
    let certFile: MulterFile | undefined;
    let keyFile: MulterFile | undefined;

    for (const file of files) {
      const content = file.buffer.toString('utf8');
      const filename = file.originalname.toLowerCase();

      if (
        content.includes('BEGIN CERTIFICATE') &&
        content.includes('END CERTIFICATE')
      ) {
        certFile = file;
      } else if (
        content.includes('BEGIN') &&
        content.includes('PRIVATE KEY') &&
        content.includes('END')
      ) {
        keyFile = file;
      } else if (filename.includes('cert') || filename.endsWith('.crt')) {
        certFile = file;
      } else if (filename.includes('key') || filename.endsWith('.key')) {
        keyFile = file;
      }
    }

    if (!certFile || !keyFile) {
      throw new BadRequestException(
        'Could not identify certificate and key files. Please ensure one file contains a certificate and the other contains a private key.',
      );
    }

    const result = await this.tlsService.uploadCertificate(
      certFile.buffer,
      keyFile.buffer,
    );

    return {
      message: 'Certificate uploaded successfully',
      uploadedAt: result.uploadedAt,
      isActive: result.isActive,
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Get current TLS certificate information' })
  @ApiResponse({
    status: 200,
    description: 'Certificate information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        hasActive: { type: 'boolean' },
        uploadedAt: { type: 'string', format: 'date-time', nullable: true },
        isActive: { type: 'boolean', nullable: true },
        subject: { type: 'string', nullable: true },
        issuer: { type: 'string', nullable: true },
        validFrom: { type: 'string', nullable: true },
        validTo: { type: 'string', nullable: true },
        fingerprint: { type: 'string', nullable: true },
        error: { type: 'string', nullable: true },
      },
    },
  })
  getCertificateInfo() {
    const info = this.tlsService.getCertificateInfo();
    return info || { hasActive: false };
  }

  @Delete('certificate')
  @ApiOperation({ summary: 'Delete the current TLS certificate' })
  @ApiResponse({
    status: 200,
    description: 'Certificate deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' },
      },
    },
  })
  deleteCertificate() {
    const success = this.tlsService.deleteCertificate();
    return {
      message: success
        ? 'Certificate deleted successfully'
        : 'Failed to delete certificate',
      success,
    };
  }
}

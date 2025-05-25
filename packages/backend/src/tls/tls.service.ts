import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as tls from 'tls';
import { X509Certificate } from 'crypto';

export interface TlsCertificate {
  cert: string;
  key: string;
  uploadedAt: Date;
  isActive: boolean;
}

interface CertificateMetadata {
  uploadedAt: string;
  isActive: boolean;
}

@Injectable()
export class TlsService {
  private readonly logger = new Logger(TlsService.name);
  private readonly certStoragePath: string;
  private currentCertificate: TlsCertificate | null = null;

  constructor(private readonly configService: ConfigService) {
    this.certStoragePath = path.join(process.cwd(), 'data', 'certificates');
    this.ensureStorageDirectory();
    this.loadExistingCertificate();
  }

  private ensureStorageDirectory() {
    try {
      if (!fs.existsSync(this.certStoragePath)) {
        fs.mkdirSync(this.certStoragePath, { recursive: true });
        this.logger.log(
          `Created certificate storage directory: ${this.certStoragePath}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to create certificate storage directory: ${error}`,
      );
    }
  }

  private loadExistingCertificate() {
    try {
      const certPath = path.join(this.certStoragePath, 'cert.pem');
      const keyPath = path.join(this.certStoragePath, 'key.pem');
      const metaPath = path.join(this.certStoragePath, 'metadata.json');

      if (
        fs.existsSync(certPath) &&
        fs.existsSync(keyPath) &&
        fs.existsSync(metaPath)
      ) {
        const cert = fs.readFileSync(certPath, 'utf8');
        const key = fs.readFileSync(keyPath, 'utf8');
        const metadata = JSON.parse(
          fs.readFileSync(metaPath, 'utf8'),
        ) as CertificateMetadata;

        this.currentCertificate = {
          cert,
          key,
          uploadedAt: new Date(metadata.uploadedAt),
          isActive: metadata.isActive,
        };

        this.logger.log('Loaded existing TLS certificate');
      }
    } catch (error) {
      this.logger.warn(`Failed to load existing certificate: ${error}`);
    }
  }

  uploadCertificate(
    certFile: Buffer,
    keyFile: Buffer,
  ): Promise<TlsCertificate> {
    return new Promise((resolve, reject) => {
      try {
        const cert = certFile.toString('utf8');
        const key = keyFile.toString('utf8');

        // Validate certificate and key
        this.validateCertificateAndKey(cert, key);

        // Save files
        const certPath = path.join(this.certStoragePath, 'cert.pem');
        const keyPath = path.join(this.certStoragePath, 'key.pem');
        const metaPath = path.join(this.certStoragePath, 'metadata.json');

        fs.writeFileSync(certPath, cert);
        fs.writeFileSync(keyPath, key);

        const certificate: TlsCertificate = {
          cert,
          key,
          uploadedAt: new Date(),
          isActive: true,
        };

        fs.writeFileSync(
          metaPath,
          JSON.stringify({
            uploadedAt: certificate.uploadedAt.toISOString(),
            isActive: certificate.isActive,
          }),
        );

        this.currentCertificate = certificate;
        this.logger.log('TLS certificate uploaded and saved successfully');

        resolve(certificate);
      } catch (error) {
        this.logger.error(`Failed to upload certificate: ${error}`);
        reject(
          new BadRequestException(
            `Invalid certificate or key: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ),
        );
      }
    });
  }

  private validateCertificateAndKey(cert: string, key: string) {
    try {
      // Validate certificate format
      if (
        !cert.includes('BEGIN CERTIFICATE') ||
        !cert.includes('END CERTIFICATE')
      ) {
        throw new Error('Invalid certificate format');
      }

      // Validate key format
      if (
        !key.includes('BEGIN') ||
        !key.includes('END') ||
        !key.includes('PRIVATE KEY')
      ) {
        throw new Error('Invalid private key format');
      }

      // Test if they work together by creating a tls context
      tls.createSecureContext({ cert, key });

      this.logger.log('Certificate and key validation successful');
    } catch (error) {
      throw new Error(
        `Certificate validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  getCurrentCertificate(): TlsCertificate | null {
    return this.currentCertificate;
  }

  getCertificateInfo() {
    if (!this.currentCertificate) {
      return null;
    }

    try {
      const cert = this.currentCertificate.cert;
      const x509 = new X509Certificate(cert);

      return {
        hasActive: true,
        uploadedAt: this.currentCertificate.uploadedAt,
        isActive: this.currentCertificate.isActive,
        subject: x509.subject,
        issuer: x509.issuer,
        validFrom: x509.validFrom,
        validTo: x509.validTo,
        fingerprint: x509.fingerprint,
      };
    } catch (error) {
      this.logger.error(`Failed to parse certificate info: ${error}`);
      return {
        hasActive: true,
        uploadedAt: this.currentCertificate.uploadedAt,
        isActive: this.currentCertificate.isActive,
        error: 'Failed to parse certificate details',
      };
    }
  }

  deleteCertificate(): boolean {
    try {
      const certPath = path.join(this.certStoragePath, 'cert.pem');
      const keyPath = path.join(this.certStoragePath, 'key.pem');
      const metaPath = path.join(this.certStoragePath, 'metadata.json');

      if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
      if (fs.existsSync(keyPath)) fs.unlinkSync(keyPath);
      if (fs.existsSync(metaPath)) fs.unlinkSync(metaPath);

      this.currentCertificate = null;
      this.logger.log('TLS certificate deleted successfully');
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete certificate: ${error}`);
      return false;
    }
  }

  getCertificateFiles(): { cert: string; key: string } | null {
    if (!this.currentCertificate) {
      return null;
    }
    return {
      cert: this.currentCertificate.cert,
      key: this.currentCertificate.key,
    };
  }
}

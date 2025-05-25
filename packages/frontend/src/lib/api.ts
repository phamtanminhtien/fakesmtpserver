const API_BASE_URL = import.meta.env.PROD ? "/api" : "http://localhost:3000";

export interface Email {
  id: string;
  receivedAt: string;
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  raw: string;
}

export interface SMTPConnectionInfo {
  host: string;
  port: number;
  secure: boolean;
  tls?: boolean;
  requiresAuth: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

export interface TLSCertificateInfo {
  hasActive: boolean;
  uploadedAt?: string;
  isActive?: boolean;
  subject?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  fingerprint?: string;
  error?: string;
}

export interface TLSUploadResponse {
  message: string;
  uploadedAt: string;
  isActive: boolean;
}

// Email API functions
export async function getAllEmails(): Promise<Email[]> {
  const response = await fetch(`${API_BASE_URL}/emails`);
  if (!response.ok) {
    throw new Error("Failed to fetch emails");
  }
  return response.json();
}

export async function getEmailById(id: string): Promise<Email> {
  const response = await fetch(`${API_BASE_URL}/emails/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch email with ID ${id}`);
  }
  return response.json();
}

export async function deleteAllEmails(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/emails`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete all emails");
  }
}

export async function deleteEmailById(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/emails/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete email with ID ${id}`);
  }
}

// SMTP API functions
export async function getSMTPConnectionInfo(): Promise<SMTPConnectionInfo> {
  const response = await fetch(`${API_BASE_URL}/smtp/connection-info`);
  if (!response.ok) {
    throw new Error("Failed to fetch SMTP connection info");
  }
  return response.json();
}

// TLS API functions
export async function getTLSCertificateInfo(): Promise<TLSCertificateInfo> {
  const response = await fetch(`${API_BASE_URL}/tls/info`);
  if (!response.ok) {
    throw new Error("Failed to fetch TLS certificate info");
  }
  return response.json();
}

export async function uploadTLSCertificate(
  certificateFile: File,
  keyFile: File
): Promise<TLSUploadResponse> {
  const formData = new FormData();
  formData.append("files", certificateFile);
  formData.append("files", keyFile);

  const response = await fetch(`${API_BASE_URL}/tls/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload TLS certificate");
  }

  return response.json();
}

export async function deleteTLSCertificate(): Promise<{
  message: string;
  success: boolean;
}> {
  const response = await fetch(`${API_BASE_URL}/tls/certificate`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete TLS certificate");
  }

  return response.json();
}

// Utility function to calculate email size from raw content
export function calculateEmailSize(email: Email): number {
  return new Blob([email.raw]).size;
}

import { useState, useEffect, useCallback } from "react";
import {
  getTLSCertificateInfo,
  uploadTLSCertificate,
  deleteTLSCertificate,
} from "@/lib/api";
import type { TLSCertificateInfo, TLSUploadResponse } from "@/lib/api";

export function useTLS() {
  const [certificateInfo, setCertificateInfo] =
    useState<TLSCertificateInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificateInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await getTLSCertificateInfo();
      setCertificateInfo(info);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch TLS certificate info"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadCertificate = useCallback(
    async (
      certificateFile: File,
      keyFile: File
    ): Promise<TLSUploadResponse> => {
      try {
        setUploading(true);
        setError(null);
        const result = await uploadTLSCertificate(certificateFile, keyFile);
        // Refresh certificate info after successful upload
        await fetchCertificateInfo();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload certificate";
        setError(errorMessage);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [fetchCertificateInfo]
  );

  const deleteCertificate = useCallback(async () => {
    try {
      setDeleting(true);
      setError(null);
      const result = await deleteTLSCertificate();
      if (result.success) {
        // Refresh certificate info after successful deletion
        await fetchCertificateInfo();
      }
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete certificate";
      setError(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [fetchCertificateInfo]);

  useEffect(() => {
    fetchCertificateInfo();
  }, [fetchCertificateInfo]);

  return {
    certificateInfo,
    loading,
    uploading,
    deleting,
    error,
    refreshCertificateInfo: fetchCertificateInfo,
    uploadCertificate,
    deleteCertificate,
  };
}

import { useState, useEffect, useCallback } from "react";
import { getSMTPConnectionInfo } from "@/lib/api";
import type { SMTPConnectionInfo } from "@/lib/api";

export function useSMTPInfo() {
  const [connectionInfo, setConnectionInfo] =
    useState<SMTPConnectionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectionInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await getSMTPConnectionInfo();
      setConnectionInfo(info);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch SMTP connection info"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnectionInfo();
  }, [fetchConnectionInfo]);

  return {
    connectionInfo,
    loading,
    error,
    refreshConnectionInfo: fetchConnectionInfo,
  };
}

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getAllEmails,
  deleteAllEmails,
  deleteEmailById,
  calculateEmailSize,
} from "@/lib/api";
import type { Email } from "@/lib/api";

export interface EmailWithSize extends Email {
  size: number;
}

export function useEmails() {
  const [emails, setEmails] = useState<EmailWithSize[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailWithSize | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  // Use ref to get current selectedEmail without dependency issues
  const selectedEmailRef = useRef<EmailWithSize | null>(null);
  selectedEmailRef.current = selectedEmail;

  // Convert API email to EmailWithSize
  const enhanceEmail = (email: Email): EmailWithSize => ({
    ...email,
    size: calculateEmailSize(email),
  });

  // Fetch emails from API - removed selectedEmail dependency
  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const emailsData = await getAllEmails();
      const enhancedEmails = emailsData.map(enhanceEmail);
      setEmails(enhancedEmails);

      // Update selected email if it still exists - using ref to avoid dependency
      const currentSelected = selectedEmailRef.current;
      if (currentSelected) {
        const updatedSelectedEmail = enhancedEmails.find(
          (e) => e.id === currentSelected.id
        );
        if (updatedSelectedEmail) {
          setSelectedEmail(updatedSelectedEmail);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array to prevent loops

  // Delete all emails
  const clearEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await deleteAllEmails();
      setEmails([]);
      setSelectedEmail(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete emails");
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete single email
  const deleteEmail = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteEmailById(id);
      setEmails((prev) => prev.filter((email) => email.id !== id));

      // Check if deleted email was selected
      if (selectedEmailRef.current?.id === id) {
        setSelectedEmail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete email");
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle polling
  const togglePolling = useCallback(() => {
    setIsPolling((prev) => !prev);
  }, []);

  // Refresh emails manually
  const refreshEmails = useCallback(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Set selected email
  const selectEmail = useCallback((email: EmailWithSize) => {
    setSelectedEmail(email);
  }, []);

  // Auto-select first email when emails change
  useEffect(() => {
    if (emails.length > 0 && !selectedEmail) {
      setSelectedEmail(emails[0]);
    }
  }, [emails, selectedEmail]);

  // Polling effect - now fetchEmails has stable reference
  useEffect(() => {
    if (!isPolling) return;

    const refreshInterval = parseInt(
      import.meta.env.VITE_REFRESH_INTERVAL || "2000",
      10
    );

    console.log(`Setting up polling every ${refreshInterval}ms`);
    const interval = setInterval(() => {
      console.log("Polling for emails...");
      fetchEmails();
    }, refreshInterval);

    return () => {
      console.log("Clearing polling interval");
      clearInterval(interval);
    };
  }, [isPolling, fetchEmails]);

  // Initial fetch - only run once on mount
  useEffect(() => {
    console.log("Initial email fetch");
    fetchEmails();
  }, []); // Empty dependency array - only run on mount

  return {
    emails,
    selectedEmail,
    loading,
    error,
    isPolling,
    clearEmails,
    deleteEmail,
    refreshEmails,
    selectEmail,
    togglePolling,
  };
}

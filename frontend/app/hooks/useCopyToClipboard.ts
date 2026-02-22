"use client";

import { useState, useCallback } from "react";

/**
 * useCopyToClipboard
 * Provides clipboard write functionality with a timed "copied" state indicator.
 * @returns [copied, copyToClipboard] — boolean state and copy trigger function
 */
export function useCopyToClipboard(resetDelay: number = 2000) {
  const [copied, setCopied] = useState(false);

  const fallbackCopy = useCallback((text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    } catch (err) {
      console.error("Fallback copy failed:", err);
    } finally {
      document.body.removeChild(textarea);
    }
  }, [resetDelay]);

  const copyToClipboard = useCallback(async (value: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
      } else {
        throw new Error("Clipboard API unavailable");
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback for environments where navigator.clipboard is unavailable
      fallbackCopy(value);
    }
  }, [resetDelay, fallbackCopy]);

  return [copied, copyToClipboard] as const;
}

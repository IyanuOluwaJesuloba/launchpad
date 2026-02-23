"use client";

import React from "react";
import { Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/app/hooks/useCopyToClipboard";

interface CopyButtonProps {
    /** The exact string value to be copied to the clipboard */
    value: string;
    /** Optional accessible label describing what is being copied.
     *  Defaults to "Copy to clipboard" if not provided. */
    label?: string;
    /** Optional additional className for layout/spacing overrides
     *  from the parent context */
    className?: string;
}

/**
 * CopyButton — A reusable button that copies a given string value to the
 * user's clipboard. Displays a brief confirmation on successful copy.
 *
 * @param value - The string to copy to the clipboard
 * @param label - Accessible aria-label for the button (default: "Copy to clipboard")
 * @param className - Optional className for spacing/layout overrides
 */
export const CopyButton = ({
    value,
    label = "Copy to clipboard",
    className = "",
}: CopyButtonProps) => {
    const [copied, copy] = useCopyToClipboard();

    return (
        <div className={`relative inline-flex items-center ${className}`}>
            <button
                type="button"
                onClick={() => copy(value)}
                className="inline-flex items-center justify-center rounded-md border border-white/10 p-1.5 text-gray-400 transition-all hover:border-stellar-400/30 hover:text-stellar-300 focus:outline-none focus:ring-2 focus:ring-stellar-500/50"
                aria-label={label}
                title={label}
            >
                {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                    <Copy className="h-3.5 w-3.5" />
                )}
            </button>

            {/* Inline Tooltip Feedback */}
            {copied && (
                <span
                    className="absolute left-full ml-2 flex items-center rounded bg-stellar-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg animate-fade-in"
                    aria-live="polite"
                >
                    Copied!
                </span>
            )}
        </div>
    );
};

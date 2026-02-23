"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Settings, X, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import {
  DEFAULT_RPC_URL,
  DEFAULT_HORIZON_URL,
} from "../providers/SettingsProvider";

// ---------------------------------------------------------------------------
// URL validation
// ---------------------------------------------------------------------------

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

type ValidationState = "idle" | "validating" | "valid" | "invalid";

// ---------------------------------------------------------------------------
// Settings Modal
// ---------------------------------------------------------------------------

export function SettingsModal() {
  const { rpcUrl, horizonUrl, setRpcUrl, setHorizonUrl, resetToDefaults } =
    useSettings();

  const [open, setOpen] = useState(false);
  const [draftRpc, setDraftRpc] = useState(rpcUrl);
  const [draftHorizon, setDraftHorizon] = useState(horizonUrl);
  const [rpcStatus, setRpcStatus] = useState<ValidationState>("idle");
  const [horizonStatus, setHorizonStatus] = useState<ValidationState>("idle");
  const [rpcError, setRpcError] = useState("");
  const [horizonError, setHorizonError] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync drafts when context values change (e.g. reset)
  useEffect(() => {
    setDraftRpc(rpcUrl);
    setDraftHorizon(horizonUrl);
  }, [rpcUrl, horizonUrl]);

  // Open / close the native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  // Close on Escape (native dialog does this, but reset state too)
  const handleClose = useCallback(() => {
    setOpen(false);
    setRpcStatus("idle");
    setHorizonStatus("idle");
    setRpcError("");
    setHorizonError("");
  }, []);

  // ---------------------------------------------------------------------------
  // Validate a URL by sending a lightweight request
  // ---------------------------------------------------------------------------
  const validateUrl = useCallback(
    async (
      url: string,
      kind: "rpc" | "horizon",
    ): Promise<boolean> => {
      const setStatus = kind === "rpc" ? setRpcStatus : setHorizonStatus;
      const setError = kind === "rpc" ? setRpcError : setHorizonError;

      if (!isValidUrl(url)) {
        setStatus("invalid");
        setError("Enter a valid HTTP or HTTPS URL.");
        return false;
      }

      setStatus("validating");
      setError("");

      try {
        const endpoint =
          kind === "rpc" ? url : `${url.replace(/\/$/, "")}/.well-known/stellar.toml`;

        const res = await fetch(endpoint, {
          method: kind === "rpc" ? "POST" : "GET",
          headers: kind === "rpc" ? { "Content-Type": "application/json" } : {},
          body:
            kind === "rpc"
              ? JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" })
              : undefined,
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok && kind === "rpc") {
          throw new Error(`HTTP ${res.status}`);
        }

        // For Horizon, any non-network-error response is enough
        setStatus("valid");
        return true;
      } catch {
        setStatus("invalid");
        setError("Could not reach this URL. Please check and try again.");
        return false;
      }
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------
  const handleSave = useCallback(async () => {
    const [rpcOk, horizonOk] = await Promise.all([
      validateUrl(draftRpc, "rpc"),
      validateUrl(draftHorizon, "horizon"),
    ]);

    if (rpcOk && horizonOk) {
      setRpcUrl(draftRpc);
      setHorizonUrl(draftHorizon);
      handleClose();
    }
  }, [draftRpc, draftHorizon, validateUrl, setRpcUrl, setHorizonUrl, handleClose]);

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------
  const handleReset = useCallback(() => {
    resetToDefaults();
    setRpcStatus("idle");
    setHorizonStatus("idle");
    setRpcError("");
    setHorizonError("");
  }, [resetToDefaults]);

  // ---------------------------------------------------------------------------
  // Status icon helper
  // ---------------------------------------------------------------------------
  function StatusIcon({ status }: { status: ValidationState }) {
    switch (status) {
      case "validating":
        return (
          <svg
            className="h-4 w-4 animate-spin text-stellar-400"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "invalid":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const isDefault =
    draftRpc === DEFAULT_RPC_URL && draftHorizon === DEFAULT_HORIZON_URL;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-white/10 p-2 text-gray-400 transition-colors hover:border-stellar-400/30 hover:text-stellar-300"
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </button>

      {/* Modal */}
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-void-800 p-0 text-white backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Network Settings</h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Close settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-400">
            Configure custom Soroban RPC and Horizon URLs. Changes are saved to
            your browser and persist across sessions.
          </p>

          {/* Soroban RPC URL */}
          <div className="flex flex-col gap-1.5">
            <label className="ml-1 text-sm font-medium text-gray-300">
              Soroban RPC URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={draftRpc}
                onChange={(e) => {
                  setDraftRpc(e.target.value);
                  setRpcStatus("idle");
                  setRpcError("");
                }}
                placeholder={DEFAULT_RPC_URL}
                className={`w-full rounded-xl border bg-void-800/50 px-4 py-3 pr-10 text-white placeholder:text-gray-500 transition-all duration-300 focus:outline-none focus:ring-1 ${
                  rpcStatus === "invalid"
                    ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                    : "border-stellar-500/10 focus:border-stellar-500/40 focus:ring-stellar-500/20"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <StatusIcon status={rpcStatus} />
              </span>
            </div>
            {rpcError && (
              <span className="ml-1 text-xs text-red-400">{rpcError}</span>
            )}
          </div>

          {/* Horizon URL */}
          <div className="flex flex-col gap-1.5">
            <label className="ml-1 text-sm font-medium text-gray-300">
              Horizon URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={draftHorizon}
                onChange={(e) => {
                  setDraftHorizon(e.target.value);
                  setHorizonStatus("idle");
                  setHorizonError("");
                }}
                placeholder={DEFAULT_HORIZON_URL}
                className={`w-full rounded-xl border bg-void-800/50 px-4 py-3 pr-10 text-white placeholder:text-gray-500 transition-all duration-300 focus:outline-none focus:ring-1 ${
                  horizonStatus === "invalid"
                    ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                    : "border-stellar-500/10 focus:border-stellar-500/40 focus:ring-stellar-500/20"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <StatusIcon status={horizonStatus} />
              </span>
            </div>
            {horizonError && (
              <span className="ml-1 text-xs text-red-400">{horizonError}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
            <button
              onClick={handleReset}
              disabled={isDefault}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to defaults
            </button>

            <div className="flex gap-3">
              <button onClick={handleClose} className="btn-secondary px-4 py-2 text-sm">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary px-4 py-2 text-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

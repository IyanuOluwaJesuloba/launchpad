"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Wallet,
  Loader2,
  AlertCircle,
  RefreshCw,
  Coins,
  Lock,
  Search,
  ArrowUpRight,
  ArrowLeftRight,
  Flame,
  Droplets,
  ArrowRight,
} from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { useSoroban } from "@/hooks/useSoroban";
import { CopyButton } from "@/components/ui/CopyButton";
import {
  fetchAccountOperations,
  truncateAddress,
  type AccountBalance,
  type VestingScheduleInfo,
  type TokenActivityInfo,
} from "@/lib/stellar";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ConnectPrompt({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center animate-fade-in-up">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <Wallet className="h-12 w-12 text-stellar-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">Connect Your Wallet</h2>
        <p className="mt-2 max-w-md text-sm text-gray-400">
          Connect your Freighter wallet to view your personal token balances,
          vesting schedules, and transaction history.
        </p>
      </div>
      <button onClick={onConnect} className="btn-primary px-8 py-3 text-sm">
        Connect Wallet
      </button>
    </div>
  );
}

function BalanceCard({
  assetCode,
  balance,
  assetIssuer,
}: {
  assetCode: string;
  balance: string;
  assetIssuer: string;
}) {
  return (
    <div className="glass-card flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stellar-500/10">
          <Coins className="h-5 w-5 text-stellar-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{assetCode}</p>
          {assetIssuer && (
            <p className="text-xs text-gray-500" title={assetIssuer}>
              {truncateAddress(assetIssuer, 4)}
            </p>
          )}
        </div>
      </div>
      <span className="font-mono text-lg font-semibold text-white">
        {parseFloat(balance).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 7,
        })}
      </span>
    </div>
  );
}

function VestingCard({
  schedule,
  contractId,
  currentLedger,
}: {
  schedule: VestingScheduleInfo;
  contractId: string;
  currentLedger: number;
}) {
  const totalAmount = BigInt(schedule.totalAmount);
  const released = BigInt(schedule.released);
  const unreleased = totalAmount - released;

  // Calculate vesting progress
  let vestPct = 0;
  if (currentLedger >= schedule.endLedger) {
    vestPct = 100;
  } else if (currentLedger > schedule.cliffLedger) {
    vestPct =
      ((currentLedger - schedule.cliffLedger) /
        (schedule.endLedger - schedule.cliffLedger)) *
      100;
  }

  const releasedPct =
    totalAmount > 0n ? Number((released * 100n) / totalAmount) : 0;

  const statusLabel = schedule.revoked
    ? "Revoked"
    : currentLedger < schedule.cliffLedger
      ? "Cliff Pending"
      : currentLedger >= schedule.endLedger
        ? "Fully Vested"
        : "Vesting";

  const statusColor = schedule.revoked
    ? "text-red-400 bg-red-400/10 border-red-400/20"
    : currentLedger >= schedule.endLedger
      ? "text-green-400 bg-green-400/10 border-green-400/20"
      : "text-amber-400 bg-amber-400/10 border-amber-400/20";

  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-stellar-400" />
          <span className="text-xs text-gray-400" title={contractId}>
            Contract: {truncateAddress(contractId, 6)}
          </span>
          <CopyButton value={contractId} label="Copy contract ID" />
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-mono text-sm font-semibold text-white">
            {totalAmount.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Released</p>
          <p className="font-mono text-sm font-semibold text-green-400">
            {released.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Unreleased</p>
          <p className="font-mono text-sm font-semibold text-amber-400">
            {unreleased.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-4 space-y-2">
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>Vested</span>
            <span>{vestPct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-void-700">
            <div
              className="h-full rounded-full bg-linear-to-r from-stellar-500 to-stellar-400 transition-all"
              style={{ width: `${Math.min(vestPct, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>Released</span>
            <span>{releasedPct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-void-700">
            <div
              className="h-full rounded-full bg-linear-to-r from-green-500 to-green-400 transition-all"
              style={{ width: `${Math.min(releasedPct, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalActivityTable({
  operations,
  loadingMore,
  hasMore,
  onLoadMore,
  publicKey,
}: {
  operations: TokenActivityInfo[];
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  publicKey: string;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "mint":
        return <Droplets className="h-4 w-4 text-blue-400" />;
      case "burn":
        return <Flame className="h-4 w-4 text-red-400" />;
      case "transfer":
        return <ArrowLeftRight className="h-4 w-4 text-green-400" />;
      default:
        return <ArrowRight className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStyleForType = (type: string) => {
    switch (type) {
      case "mint":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "burn":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "transfer":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  // Determine send/receive for transfers
  const getDirection = (op: TokenActivityInfo) => {
    if (op.type !== "transfer") return null;
    if (op.from === publicKey) return "Sent";
    if (op.to === publicKey) return "Received";
    return null;
  };

  if (operations.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-sm text-gray-500">
        No personal transaction history found.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Personal transaction history">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Direction
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Counterparty
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Time
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Tx
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {operations.map((op, i) => {
              const direction = getDirection(op);
              const counterparty =
                op.from === publicKey ? op.to : op.from;

              return (
                <tr
                  key={`${op.id}-${i}`}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${getStyleForType(op.type)}`}
                    >
                      {getTypeIcon(op.type)}
                      {op.type}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {direction && (
                      <span
                        className={`text-xs font-medium ${direction === "Sent" ? "text-red-400" : "text-green-400"}`}
                      >
                        {direction}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    {op.amount !== "-" ? op.amount : "-"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stellar-300">
                    {counterparty && counterparty !== "-" ? (
                      <span title={counterparty}>
                        {truncateAddress(counterparty, 5)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400">
                    {new Date(op.timestamp).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${op.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded text-xs text-stellar-400 hover:text-stellar-300 hover:underline"
                      title="View on Stellar Expert"
                    >
                      View
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="border-t border-white/5 p-4 text-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PersonalDashboard() {
  const { connected, publicKey, connect } = useWallet();
  const { fetchVestingSchedule, fetchCurrentLedger, fetchAccountBalances } =
    useSoroban();

  // Balances
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balancesError, setBalancesError] = useState<string | null>(null);

  // Vesting
  const [vestingContractId, setVestingContractId] = useState("");
  const [vestingSchedule, setVestingSchedule] =
    useState<VestingScheduleInfo | null>(null);
  const [vestingLoading, setVestingLoading] = useState(false);
  const [vestingError, setVestingError] = useState<string | null>(null);
  const [currentLedger, setCurrentLedger] = useState(0);

  // Transaction history
  const [operations, setOperations] = useState<TokenActivityInfo[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txLoadingMore, setTxLoadingMore] = useState(false);
  const [txNextCursor, setTxNextCursor] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);
  cursorRef.current = txNextCursor;

  // Refreshing state
  const [refreshing, setRefreshing] = useState(false);

  // Fetch balances
  const loadBalances = useCallback(async () => {
    if (!publicKey) return;
    setBalancesLoading(true);
    setBalancesError(null);
    try {
      const data = await fetchAccountBalances(publicKey);
      setBalances(data);
    } catch (err) {
      setBalancesError(
        err instanceof Error ? err.message : "Failed to fetch balances.",
      );
    } finally {
      setBalancesLoading(false);
    }
  }, [publicKey, fetchAccountBalances]);

  // Fetch personal transactions
  const loadTransactions = useCallback(
    async (isLoadMore = false) => {
      if (!publicKey) return;
      if (!isLoadMore) setTxLoading(true);
      if (isLoadMore) setTxLoadingMore(true);

      try {
        const cursor = isLoadMore ? cursorRef.current : undefined;
        const { records, nextCursor } = await fetchAccountOperations(
          publicKey,
          cursor ?? undefined,
          15,
        );

        if (isLoadMore) {
          setOperations((prev) => [...prev, ...records]);
        } else {
          setOperations(records);
        }
        setTxNextCursor(nextCursor);
      } catch {
        // Silently fail for tx feed on refresh
        if (!isLoadMore) setOperations([]);
      } finally {
        if (!isLoadMore) setTxLoading(false);
        if (isLoadMore) setTxLoadingMore(false);
      }
    },
    [publicKey],
  );

  // Load vesting schedule
  const lookupVesting = useCallback(async () => {
    if (!publicKey || !vestingContractId.trim()) return;
    setVestingLoading(true);
    setVestingError(null);
    setVestingSchedule(null);
    try {
      const [schedule, ledger] = await Promise.all([
        fetchVestingSchedule(vestingContractId.trim(), publicKey),
        fetchCurrentLedger(),
      ]);
      setVestingSchedule(schedule);
      setCurrentLedger(ledger);
    } catch (err) {
      setVestingError(
        err instanceof Error
          ? err.message
          : "Failed to fetch vesting schedule. Check the contract ID.",
      );
    } finally {
      setVestingLoading(false);
    }
  }, [publicKey, vestingContractId, fetchVestingSchedule, fetchCurrentLedger]);

  // Initial data load
  useEffect(() => {
    if (connected && publicKey) {
      loadBalances();
      loadTransactions();
    }
  }, [connected, publicKey, loadBalances, loadTransactions]);

  // Refresh all
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadBalances(), loadTransactions()]);
    setRefreshing(false);
  }, [loadBalances, loadTransactions]);

  // Not connected
  if (!connected || !publicKey) {
    return <ConnectPrompt onConnect={connect} />;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Account</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
            <span className="font-mono text-xs">
              <span className="hidden md:inline">{publicKey}</span>
              <span className="md:hidden">
                {truncateAddress(publicKey, 8)}
              </span>
            </span>
            <CopyButton value={publicKey} label="Copy wallet address" />
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary inline-flex items-center gap-2 self-start px-4 py-2 text-sm"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Token Balances Section */}
      <section aria-label="Token balances" className="mb-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
          Token Balances
        </h2>
        {balancesLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-stellar-400" />
          </div>
        ) : balancesError ? (
          <div className="glass-card p-6 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-400" />
            <p className="text-sm text-gray-400">{balancesError}</p>
            <button
              onClick={loadBalances}
              className="btn-secondary mt-3 px-4 py-1.5 text-sm"
            >
              Retry
            </button>
          </div>
        ) : balances.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm text-gray-500">
            No balances found for this account.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {balances.map((bal) => (
              <BalanceCard
                key={`${bal.assetCode}-${bal.assetIssuer}`}
                assetCode={bal.assetCode}
                balance={bal.balance}
                assetIssuer={bal.assetIssuer}
              />
            ))}
          </div>
        )}
      </section>

      {/* Vesting Schedule Section */}
      <section aria-label="Vesting schedule" className="mb-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
          Vesting Schedule
        </h2>
        <div className="glass-card p-5">
          <p className="mb-3 text-xs text-gray-400">
            Enter a vesting contract ID to view your vesting schedule.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={vestingContractId}
              onChange={(e) => setVestingContractId(e.target.value)}
              placeholder="Vesting Contract ID (C...)"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-stellar-400/50 focus:ring-1 focus:ring-stellar-400/30"
            />
            <button
              onClick={lookupVesting}
              disabled={vestingLoading || !vestingContractId.trim()}
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {vestingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Lookup
            </button>
          </div>

          {vestingError && (
            <p className="mt-3 text-sm text-red-400">{vestingError}</p>
          )}
        </div>

        {vestingSchedule && (
          <div className="mt-4">
            <VestingCard
              schedule={vestingSchedule}
              contractId={vestingContractId}
              currentLedger={currentLedger}
            />
          </div>
        )}
      </section>

      {/* Personal Transaction History */}
      <section aria-label="Personal transaction history">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">
          Transaction History
        </h2>
        {txLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-stellar-400" />
          </div>
        ) : (
          <PersonalActivityTable
            operations={operations}
            loadingMore={txLoadingMore}
            hasMore={txNextCursor !== null}
            onLoadMore={() => loadTransactions(true)}
            publicKey={publicKey}
          />
        )}
      </section>
    </div>
  );
}

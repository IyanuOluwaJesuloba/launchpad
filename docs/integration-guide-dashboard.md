# Integration Guide: Pre-flight Checks in Dashboard

This guide shows how to integrate pre-flight checks into the token dashboard and admin panel.

## Dashboard Admin Panel

The dashboard needs an admin tab with forms for mint, burn, transfer, and vesting operations. Here's how to add pre-flight checks:

### Mint Admin Panel

```typescript
// app/dashboard/[contractId]/AdminPanel.tsx

"use client";

import { useState } from "react";
import { MintForm } from "@/components/forms/MintForm";
import { BurnForm } from "@/components/forms/BurnForm";
import { VestingReleaseForm } from "@/components/forms/VestingForm";
import { useWallet } from "@/app/hooks/useWallet";

export function AdminPanel({ contractId }: { contractId: string }) {
  const { walletAddress } = useWallet();
  const [activeTab, setActiveTab] = useState<"mint" | "burn" | "vesting">("mint");

  if (!walletAddress) {
    return (
      <div className="text-center text-gray-400">
        Connect wallet to access admin controls
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("mint")}
          className={`px-4 py-2 rounded ${
            activeTab === "mint" ? "bg-stellar-500" : "bg-void-700"
          }`}
        >
          Mint
        </button>
        <button
          onClick={() => setActiveTab("burn")}
          className={`px-4 py-2 rounded ${
            activeTab === "burn" ? "bg-stellar-500" : "bg-void-700"
          }`}
        >
          Burn
        </button>
        <button
          onClick={() => setActiveTab("vesting")}
          className={`px-4 py-2 rounded ${
            activeTab === "vesting" ? "bg-stellar-500" : "bg-void-700"
          }`}
        >
          Vesting
        </button>
      </div>

      <div className="max-w-xl">
        {activeTab === "mint" && (
          <MintForm
            adminAddress={walletAddress}
            onSuccess={(txHash) => {
              console.log("Mint confirmed:", txHash);
              // Refresh supply metrics, reload holders, etc.
            }}
          />
        )}

        {activeTab === "burn" && (
          <BurnForm
            adminAddress={walletAddress}
            onSuccess={(txHash) => {
              console.log("Burn confirmed:", txHash);
              // Refresh supply metrics
            }}
          />
        )}

        {activeTab === "vesting" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Release Vested Tokens</h3>
              <VestingReleaseForm
                onSuccess={(txHash) => {
                  console.log("Release confirmed:", txHash);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Add to TokenDashboard

```typescript
// app/dashboard/[contractId]/TokenDashboard.tsx

import { AdminPanel } from "./AdminPanel";

export function TokenDashboard({ contractId }: { contractId: string }) {
  const [activeView, setActiveView] = useState<"summary" | "holders" | "admin">(
    "summary"
  );

  return (
    <div>
      {/* Navigation */}
      <div className="flex gap-4 border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveView("summary")}
          className={`px-4 py-2 ${
            activeView === "summary"
              ? "border-b-2 border-stellar-500"
              : "text-gray-400"
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveView("holders")}
          className={`px-4 py-2 ${
            activeView === "holders"
              ? "border-b-2 border-stellar-500"
              : "text-gray-400"
          }`}
        >
          Holders
        </button>
        <button
          onClick={() => setActiveView("admin")}
          className={`px-4 py-2 ${
            activeView === "admin"
              ? "border-b-2 border-stellar-500"
              : "text-gray-400"
          }`}
        >
          Admin Controls
        </button>
      </div>

      {/* Content */}
      {activeView === "summary" && <TokenSummary contractId={contractId} />}
      {activeView === "holders" && <HoldersTable contractId={contractId} />}
      {activeView === "admin" && <AdminPanel contractId={contractId} />}
    </div>
  );
}
```

## User Transfer Form

For non-admin token transfers, add pre-flight checks:

```typescript
// app/dashboard/[contractId]/TransferPanel.tsx

"use client";

import { TransferForm } from "@/components/forms/TransferForm";
import { useWallet } from "@/app/hooks/useWallet";

export function TransferPanel({ contractId }: { contractId: string }) {
  const { walletAddress } = useWallet();

  if (!walletAddress) {
    return <div className="text-gray-400">Connect wallet to transfer tokens</div>;
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Transfer Tokens</h2>
      <TransferForm
        senderAddress={walletAddress}
        onSuccess={(txHash) => {
          console.log("Transfer confirmed:", txHash);
          // Show success toast
          // Refresh balances
        }}
      />
    </div>
  );
}
```

## Vesting Release Panel

For beneficiaries to release vested tokens:

```typescript
// app/dashboard/[contractId]/VestingReleasePanel.tsx

"use client";

import { VestingReleaseForm } from "@/components/forms/VestingForm";
import { useSoroban } from "@/hooks/useSoroban";
import { useState, useEffect } from "react";

export function VestingReleasePanel({
  contractId,
  vestingContractId,
}: {
  contractId: string;
  vestingContractId: string;
}) {
  const { fetchVestingSchedule } = useSoroban();
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    // Load vesting schedule for current wallet
    // fetchVestingSchedule(vestingContractId, walletAddress).then(setSchedule);
  }, []);

  return (
    <div className="space-y-6">
      {schedule && (
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-2">Your Vesting Schedule</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Total Allocated</p>
              <p className="font-semibold">{schedule.totalAmount}</p>
            </div>
            <div>
              <p className="text-gray-400">Already Released</p>
              <p className="font-semibold">{schedule.released}</p>
            </div>
          </div>
        </div>
      )}

      <VestingReleaseForm
        onSuccess={(txHash) => {
          console.log("Release confirmed:", txHash);
          // Refresh schedule
        }}
      />
    </div>
  );
}
```

## Complete Admin Dashboard Example

```typescript
// app/dashboard/[contractId]/FullAdminDashboard.tsx

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MintForm } from "@/components/forms/MintForm";
import { BurnForm } from "@/components/forms/BurnForm";
import { TransferForm } from "@/components/forms/TransferForm";
import {
  VestingReleaseForm,
  VestingRevokeForm,
} from "@/components/forms/VestingForm";
import { useWallet } from "@/app/hooks/useWallet";

export function FullAdminDashboard({
  contractId,
  vestingContractId,
}: {
  contractId: string;
  vestingContractId?: string;
}) {
  const { walletAddress } = useWallet();

  if (!walletAddress) {
    return (
      <div className="text-center p-8 text-gray-400">
        <p>Connect your wallet to access admin controls</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Controls</h2>
        <p className="text-gray-400">Manage your token with pre-flight validation</p>
      </div>

      <Tabs defaultValue="mint" className="w-full">
        <TabsList>
          <TabsTrigger value="mint">Mint</TabsTrigger>
          <TabsTrigger value="burn">Burn</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          {vestingContractId && (
            <>
              <TabsTrigger value="release">Release Vesting</TabsTrigger>
              <TabsTrigger value="revoke">Revoke Vesting</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="mint" className="mt-6">
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Mint New Tokens</h3>
            <p className="text-gray-400 mb-6">
              Create new tokens and distribute them to addresses. Minting will update
              total supply if no max supply cap exists.
            </p>
            <MintForm
              adminAddress={walletAddress}
              onSuccess={(txHash) => {
                console.log("Mint successful:", txHash);
                // Show success notification
                // Refresh supply metrics
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="burn" className="mt-6">
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Burn Tokens</h3>
            <p className="text-gray-400 mb-6">
              Permanently remove tokens from circulation. This action cannot be undone.
            </p>
            <BurnForm
              adminAddress={walletAddress}
              onSuccess={(txHash) => {
                console.log("Burn successful:", txHash);
                // Show success notification
                // Refresh supply metrics
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="transfer" className="mt-6">
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Transfer Tokens</h3>
            <TransferForm
              senderAddress={walletAddress}
              onSuccess={(txHash) => {
                console.log("Transfer successful:", txHash);
                // Show success notification
              }}
            />
          </div>
        </TabsContent>

        {vestingContractId && (
          <>
            <TabsContent value="release" className="mt-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">Release Vested Tokens</h3>
                <p className="text-gray-400 mb-6">
                  Permit a beneficiary to claim their vested tokens.
                </p>
                <VestingReleaseForm
                  onSuccess={(txHash) => {
                    console.log("Release successful:", txHash);
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="revoke" className="mt-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-4">Revoke Vesting Schedule</h3>
                <p className="text-gray-400 mb-6">
                  Cancel a vesting schedule. Vested tokens go to recipient, unvested return
                  to admin.
                </p>
                <VestingRevokeForm
                  adminAddress={walletAddress}
                  onSuccess={(txHash) => {
                    console.log("Revoke successful:", txHash);
                  }}
                />
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
```

## Success Notifications

After a transaction succeeds, show a notification:

```typescript
import { CheckCircle } from "lucide-react";

function SuccessNotification({ txHash }: { txHash: string }) {
  return (
    <div className="glass-card border border-green-500/30 bg-green-500/10 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
        <div>
          <p className="font-semibold text-green-300">Transaction Confirmed</p>
          <p className="text-sm text-green-200 mt-2">
            Hash:{" "}
            <code className="bg-void-800 px-2 py-1 rounded text-xs">
              {txHash.slice(0, 16)}...{txHash.slice(-16)}
            </code>
          </p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            className="text-sm text-stellar-400 hover:text-stellar-300 mt-2 inline-block"
            target="_blank"
          >
            View on Stellar Expert →
          </a>
        </div>
      </div>
    </div>
  );
}
```

## Error Handling

For failed transactions, show the pre-flight error that was missed:

```typescript
function TransactionError({ error }: { error: string }) {
  return (
    <div className="glass-card border border-red-500/30 bg-red-500/10 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
        <div>
          <p className="font-semibold text-red-300">Transaction Failed</p>
          <p className="text-sm text-red-200 mt-2">{error}</p>
          <p className="text-xs text-red-300 mt-2">
            Try running the pre-flight check again to see detailed error message.
          </p>
        </div>
      </div>
    </div>
  );
}
```

## Workflow Summary

1. **User connects wallet**
2. **Admin panel appears with form tabs**
3. **User fills form fields**
4. **User clicks "Check Transaction"**
   - Pre-flight simulation runs
   - Errors/warnings displayed in real-time
5. **If check passes:**
   - Submit button enabled
   - Green success message shown
6. **User clicks submit**
   - Transaction sent to Freighter
   - User signs in wallet extension
   - Transaction broadcast to network
7. **On success:**
   - Show success notification
   - Refresh dashboard data
   - Clear form for next transaction

## Testing the Integration

```bash
# Run dashboard tests
npm test -- TokenDashboard.test.tsx

# Run admin panel tests
npm test -- AdminPanel.test.tsx

# E2E test the full flow
npm run test:e2e
```

## Checklist for Full Integration

- [ ] Add `AdminPanel.tsx` to dashboard
- [ ] Add tabs for mint, burn, transfer, vesting
- [ ] Import and use `MintForm`, `BurnForm`, `TransferForm`
- [ ] Import and use `VestingReleaseForm`, `VestingRevokeForm`
- [ ] Add success notification component
- [ ] Add error handling component
- [ ] Integrate with existing supply refresh logic
- [ ] Add loading states while transactions process
- [ ] Test with testnet deployments
- [ ] Add E2E tests for complete workflows

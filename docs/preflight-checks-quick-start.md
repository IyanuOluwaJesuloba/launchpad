# Pre-flight Checks: Quick Start

## 5-Minute Integration Guide

Add transaction pre-flight checks to any form in 5 minutes.

### Step 1: Import

```typescript
import { useTransactionSimulator } from "@/hooks/useTransactionSimulator";
import { PreflightCheckDisplay } from "@/components/ui/PreflightCheck";
```

### Step 2: Initialize Hook & State

```typescript
export function MyTransactionForm() {
  const simulator = useTransactionSimulator();
  const [preflightResult, setPreflightResult] = useState<{
    isLoading: boolean;
    success: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
```

### Step 3: Add Check Handler

```typescript
  const handleCheck = async () => {
    setPreflightResult({ isLoading: true, success: false, errors: [], warnings: [] });
    
    try {
      const result = await simulator.checkTransfer(
        contractId,
        fromAddress,
        toAddress,
        amount
      );
      setPreflightResult({ isLoading: false, ...result });
    } catch (error) {
      setPreflightResult({
        isLoading: false,
        success: false,
        errors: [error.message],
        warnings: [],
      });
    }
  };
```

### Step 4: Add UI

```typescript
  return (
    <form>
      {/* Your form fields... */}
      
      {preflightResult && (
        <PreflightCheckDisplay
          isLoading={preflightResult.isLoading}
          errors={preflightResult.errors}
          warnings={preflightResult.warnings}
          successMessage={preflightResult.success ? "Ready to sign" : undefined}
          onDismiss={() => setPreflightResult(null)}
        />
      )}
      
      <button onClick={handleCheck}>Check Transaction</button>
      <button type="submit" disabled={!preflightResult?.success}>Submit</button>
    </form>
  );
}
```

## Available Simulation Methods

```typescript
const simulator = useTransactionSimulator();

// Token operations
simulator.checkTransfer(contractId, from, to, amount);
simulator.checkMint(contractId, to, amount, adminAddress);
simulator.checkBurn(contractId, from, amount, adminAddress);
simulator.checkTransferFrom(contractId, spender, from, to, amount);
simulator.checkApprove(contractId, owner, spender, amount, expirationLedger);

// Vesting operations
simulator.checkVestingRelease(vestingContractId, recipientAddress);
simulator.checkVestingRevoke(vestingContractId, recipientAddress, adminAddress);
simulator.checkCreateSchedule(
  vestingContractId,
  recipientAddress,
  totalAmount,
  cliffLedger,
  endLedger,
  adminAddress
);

// Generic
simulator.simulateContract(contractId, method, args, sourcePublicKey);
```

## Example: Mint Form

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTransactionSimulator } from "@/hooks/useTransactionSimulator";
import { PreflightCheckDisplay } from "@/components/ui/PreflightCheck";
import { Button } from "@/components/ui/Button";

export function QuickMintForm({ adminAddress }: { adminAddress: string }) {
  const [preflightResult, setPreflightResult] = useState<any>(null);
  const simulator = useTransactionSimulator();

  const { register, watch, formState: { isValid } } = useForm({
    defaultValues: { contractId: "", to: "", amount: "" },
  });

  const formData = watch();

  return (
    <form className="space-y-4">
      <input {...register("contractId")} placeholder="Contract ID" />
      <input {...register("to")} placeholder="Recipient" />
      <input {...register("amount")} placeholder="Amount" />

      {preflightResult && <PreflightCheckDisplay {...preflightResult} />}

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={async () => {
            setPreflightResult({ isLoading: true, success: false, errors: [], warnings: [] });
            const result = await simulator.checkMint(
              formData.contractId,
              formData.to,
              BigInt(formData.amount),
              adminAddress
            );
            setPreflightResult({ isLoading: false, ...result });
          }}
          disabled={!isValid || simulator.isLoading}
        >
          Check
        </Button>
        <Button type="submit" disabled={!preflightResult?.success}>
          Mint
        </Button>
      </div>
    </form>
  );
}
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Insufficient balance" | Not enough tokens to transfer | Check wallet balance first |
| "Max supply exceeded" | Mint would exceed cap | Check max supply and total supply |
| "Account is frozen" | Account cannot transfer | Check if account is frozen |
| "No schedule found" | Recipient has no vesting | Create schedule first |
| "Nothing to release" | All tokens already released | Come back after cliff period |

## Troubleshooting

**Q: Simulation always says "success" but transaction fails**  
A: Your RPC simulation may be using a stale state. Ensure you have the latest contract ID and state.

**Q: Simulation is very slow**  
A: The Soroban RPC may be congested. Try again in a few moments.

**Q: Custom error not being parsed**  
A: Add it to `ERROR_MESSAGE_MAP` in `transactionSimulator.ts`:
```typescript
"my custom error": "User-friendly message",
```

**Q: Need to simulate a custom operation**  
A: Use the generic `simulateContract` method:
```typescript
const result = await simulator.simulateContract(
  contractId,
  "custom_method",
  [arg1, arg2],
  sourcePublicKey
);
```

## Files Created/Modified

```
frontend/
  ├── lib/
  │   └── transactionSimulator.ts          (NEW)
  ├── hooks/
  │   └── useTransactionSimulator.ts       (NEW)
  ├── components/
  │   ├── ui/
  │   │   └── PreflightCheck.tsx           (NEW)
  │   └── forms/
  │       ├── MintForm.tsx                 (NEW)
  │       ├── BurnForm.tsx                 (NEW)
  │       ├── TransferForm.tsx             (NEW)
  │       └── VestingForm.tsx              (NEW)
  └── app/
      └── deploy/
          └── DeployForm.tsx               (UPDATED)
docs/
  ├── preflight-checks.md                  (NEW)
  └── preflight-checks-quick-start.md      (THIS FILE)
```

## Related Issues

**#53** — Feature: Simulate Transactions Before Signing (Pre-flight Checks)

## Support

For questions or issues, please refer to:
- Full docs: [preflight-checks.md](./preflight-checks.md)
- Example forms: [components/forms/](../frontend/components/forms/)
- Utility code: [lib/transactionSimulator.ts](../frontend/lib/transactionSimulator.ts)

# Transaction Pre-flight Checks

## Overview

Transaction pre-flight checks simulate Soroban contract invocations before the user signs them. This prevents wasted transactions, contract panics, and provides clear, user-friendly feedback about why a transaction might fail.

## Features

✅ **Error Simulation** — Detect contract execution errors before signing  
✅ **User-Friendly Messages** — Convert technical errors to plain English  
✅ **Warnings** — Alert users to high fees or other non-critical issues  
✅ **Loading States** — Clear feedback while simulation is in progress  
✅ **Success Confirmation** — Explicit signal that a transaction is safe to sign

## Architecture

```
User Form
    ↓
useTransactionSimulator Hook
    ↓
transactionSimulator.ts (simulateTransaction, simulateTransfer, etc.)
    ↓
Soroban RPC simulateTransaction Endpoint
    ↓
Parsed Result (Success/Warnings/Errors)
    ↓
PreflightCheck UI Components (Display to User)
```

## Core Utilities

### `transactionSimulator.ts`

Low-level utilities for simulating transactions and parsing errors.

```typescript
import {
  simulateTransaction,
  simulateTransfer,
  simulateMint,
  simulateBurn,
  simulateTransferFrom,
  simulateVestingRelease,
  simulateVestingRevoke,
  simulateCreateSchedule,
  parseSorobanError,
  type PreflightCheckResult,
} from "@/lib/transactionSimulator";

// Generic simulation
const result = await simulateTransaction(
  contractId,
  "mint",
  args,
  networkConfig,
  adminPublicKey
);

if (result.success) {
  console.log("Transaction is safe!");
} else {
  console.log("Errors:", result.errors);
  console.log("Warnings:", result.warnings);
}
```

#### `PreflightCheckResult` Type

```typescript
interface PreflightCheckResult {
  success: boolean;
  warnings: string[];
  errors: string[];
  simulationDetails?: {
    cost: string;
    footprint: string;
  };
}
```

#### Error Messages

The simulator automatically converts Soroban contract panics and RPC errors into user-friendly messages:

| Error | → | Friendly Message |
|-------|---|-----------------|
| `"insufficient balance"` | → | "Insufficient token balance for this operation." |
| `"max_supply exceeded"` | → | "Operation would exceed the maximum supply cap." |
| `"account is frozen"` | → | "The account is frozen and cannot perform transfers." |
| `"schedule already exists"` | → | "A vesting schedule already exists for this recipient." |
| `"unauthorized"` | → | "You don't have permission for this operation." |

### `useTransactionSimulator` Hook

High-level React hook for running pre-flight checks in forms.

```typescript
import { useTransactionSimulator } from "@/hooks/useTransactionSimulator";

export function MyForm() {
  const { isLoading, checkMint, checkTransfer, networkConfig } = useTransactionSimulator();

  const handleCheck = async () => {
    const result = await checkMint(
      contractId,
      recipientAddress,
      amount,
      adminAddress
    );

    if (result.success) {
      // Enable submit button
    } else {
      // Show errors to user
    }
  };

  return (
    <button onClick={handleCheck} disabled={isLoading}>
      {isLoading ? "Checking..." : "Check Transaction"}
    </button>
  );
}
```

### UI Components

**`PreflightCheckDisplay`** — Unified component that shows loading, errors, warnings, or success.

```typescript
import { PreflightCheckDisplay } from "@/components/ui/PreflightCheck";

<PreflightCheckDisplay
  isLoading={isLoading}
  errors={errors}
  warnings={warnings}
  successMessage="Ready to sign"
  onDismiss={() => setResult(null)}
/>
```

**`PreflightError`** — Shows error messages in a red alert box.

```typescript
<PreflightError errors={["Insufficient balance", "Max supply exceeded"]} />
```

**`PreflightWarning`** — Shows non-critical warnings in a yellow alert box.

```typescript
<PreflightWarning warnings={["High transaction fee estimated"]} />
```

**`PreflightSuccess`** — Shows success state in a green alert box.

```typescript
<PreflightSuccess message="Transaction is ready to sign" />
```

**`PreflightLoading`** — Shows loading spinner during simulation.

```typescript
<PreflightLoading message="Checking transaction..." />
```

## Usage Examples

### Basic Transfer Form

```typescript
import { useState } from "react";
import { useTransactionSimulator } from "@/hooks/useTransactionSimulator";
import { PreflightCheckDisplay } from "@/components/ui/PreflightCheck";

export function TransferForm({ walletAddress }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  
  const simulator = useTransactionSimulator();

  const handleCheck = async () => {
    setResult({ isLoading: true, success: false, errors: [], warnings: [] });
    
    try {
      const checkResult = await simulator.checkTransfer(
        contractId,
        walletAddress,
        recipient,
        BigInt(amount)
      );
      
      setResult({
        isLoading: false,
        success: checkResult.success,
        errors: checkResult.errors,
        warnings: checkResult.warnings,
      });
    } catch (error) {
      setResult({
        isLoading: false,
        success: false,
        errors: [error.message],
        warnings: [],
      });
    }
  };

  return (
    <div>
      <input
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient address"
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
      />
      
      {result && (
        <PreflightCheckDisplay
          isLoading={result.isLoading}
          errors={result.errors}
          warnings={result.warnings}
          successMessage={result.success ? "Ready to transfer" : undefined}
        />
      )}
      
      <button onClick={handleCheck} disabled={!recipient || !amount}>
        Check Transaction
      </button>
      <button disabled={!result?.success}>
        Sign & Send
      </button>
    </div>
  );
}
```

### Mint Form with Validation

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransactionSimulator } from "@/hooks/useTransactionSimulator";

const mintSchema = z.object({
  toAddress: z.string().regex(/^G[A-Z2-7]{55}$/),
  amount: z.string().refine((v) => !isNaN(parseFloat(v))),
});

export function MintForm({ adminAddress }) {
  const [preflightResult, setPreflightResult] = useState(null);
  const simulator = useTransactionSimulator();
  
  const { register, watch, trigger, formState: { isValid } } = useForm({
    resolver: zodResolver(mintSchema),
  });

  const formData = watch();

  const handleCheck = async () => {
    if (!await trigger()) return;

    setPreflightResult({ isLoading: true, success: false, errors: [], warnings: [] });

    const result = await simulator.checkMint(
      contractId,
      formData.toAddress,
      BigInt(formData.amount),
      adminAddress
    );

    setPreflightResult({
      isLoading: false,
      success: result.success,
      errors: result.errors,
      warnings: result.warnings,
    });
  };

  return (
    <form>
      <input {...register("toAddress")} placeholder="Recipient" />
      <input {...register("amount")} placeholder="Amount" />
      
      {preflightResult && (
        <PreflightCheckDisplay {...preflightResult} />
      )}
      
      <button type="button" onClick={handleCheck} disabled={!isValid}>
        Validate
      </button>
      <button type="submit" disabled={!preflightResult?.success}>
        Mint
      </button>
    </form>
  );
}
```

### Admin Burn Form with Warnings

```typescript
export function BurnForm({ adminAddress }) {
  const [preflightResult, setPreflightResult] = useState(null);
  const simulator = useTransactionSimulator();

  const handleCheck = async () => {
    setPreflightResult({ isLoading: true, success: false, errors: [], warnings: [] });

    const result = await simulator.checkBurn(
      contractId,
      targetAddress,
      BigInt(amount),
      adminAddress
    );

    setPreflightResult({
      isLoading: false,
      success: result.success,
      errors: result.errors,
      warnings: [
        ...result.warnings,
        // Add custom warnings
        parseFloat(amount) > 1000000 ? "Large burn amount - ensure this is intentional" : null,
      ].filter(Boolean),
    });
  };

  return (
    <div className="border-red-500/30">
      {/* Form fields... */}
      
      {preflightResult && (
        <PreflightCheckDisplay {...preflightResult} />
      )}
      
      <button onClick={handleCheck}>Check Burn</button>
    </div>
  );
}
```

### Vesting Release Form

```typescript
export function VestingReleaseForm() {
  const simulator = useTransactionSimulator();
  const [preflightResult, setPreflightResult] = useState(null);

  const handleCheck = async () => {
    setPreflightResult({ isLoading: true, success: false, errors: [], warnings: [] });

    const result = await simulator.checkVestingRelease(
      vestingContractId,
      recipientAddress
    );

    setPreflightResult({
      isLoading: false,
      ...result,
    });
  };

  return (
    <div>
      {/* Form fields... */}
      {preflightResult && (
        <PreflightCheckDisplay
          {...preflightResult}
          successMessage="Ready to release vested tokens"
        />
      )}
      <button onClick={handleCheck}>Check Release</button>
    </div>
  );
}
```

## Implementing in Existing Forms

To add pre-flight checks to any transaction form:

1. **Import the hook and UI component**:
   ```typescript
   import { useTransactionSimulator } from "@/hooks/useTransactionSimulator";
   import { PreflightCheckDisplay } from "@/components/ui/PreflightCheck";
   ```

2. **Add state for pre-flight results**:
   ```typescript
   const [preflightResult, setPreflightResult] = useState<{
     isLoading: boolean;
     success: boolean;
     errors: string[];
     warnings: string[];
   } | null>(null);
   
   const simulator = useTransactionSimulator();
   ```

3. **Create a check handler**:
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
       
       setPreflightResult({
         isLoading: false,
         ...result,
       });
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

4. **Add UI to display results**:
   ```tsx
   {preflightResult && (
     <PreflightCheckDisplay
       isLoading={preflightResult.isLoading}
       errors={preflightResult.errors}
       warnings={preflightResult.warnings}
       successMessage={preflightResult.success ? "Ready to sign" : undefined}
       onDismiss={() => setPreflightResult(null)}
     />
   )}
   ```

5. **Gate submission**:
   ```tsx
   <button
     onClick={handleCheck}
     disabled={!formIsValid || simulator.isLoading}
   >
     Check Transaction
   </button>
   
   <button
     type="submit"
     disabled={!preflightResult?.success}
   >
     Sign & Submit
   </button>
   ```

## Supported Operations

### Token Contract

- `transfer(from, to, amount)`
- `transfer_from(spender, from, to, amount)`
- `mint(to, amount)` *(admin only)*
- `burn(from, amount)` *(admin only)*
- `approve(from, spender, amount, expiration_ledger)`

### Vesting Contract

- `release(recipient)`
- `revoke(recipient)` *(admin only)*
- `create_schedule(recipient, total_amount, cliff_ledger, end_ledger)` *(admin only)*

### Generic Simulation

For operations not listed above, use the generic simulator:

```typescript
const result = await simulator.simulateContract(
  contractId,
  "method_name",
  [arg1, arg2, arg3],
  sourcePublicKey
);
```

## Error Handling Best Practices

1. **Always wrap in try-catch**:
   ```typescript
   try {
     const result = await simulator.checkTransfer(...);
     // Handle result
   } catch (error) {
     setPreflightResult({
       isLoading: false,
       success: false,
       errors: [error.message],
       warnings: [],
     });
   }
   ```

2. **Distinguish RPC errors from contract errors**:
   - RPC errors (network, timeout) → Show generic retry message
   - Contract errors (balance, authorization) → Show specific action messages

3. **Add contextual warnings**:
   ```typescript
   const warnings = [
     ...result.warnings,
     amount > largeThreshold ? "Large transaction - double-check amount" : null,
     estimatedFee > highFeeThreshold ? "High estimated fee" : null,
   ].filter(Boolean);
   ```

## Performance Notes

- Simulation typically completes in **100-500ms** on testnet
- Mainnet simulations may be **200-1000ms** depending on RPC load
- Results are **not cached** (each simulation is fresh)
- Simulate only when user clicks "Check" button, not on every keystroke

## Testing

```typescript
import { simulateTransfer, parseSorobanError } from "@/lib/transactionSimulator";

describe("Transaction Simulator", () => {
  it("parses insufficient balance error", () => {
    const message = parseSorobanError("insufficient balance for transfer");
    expect(message).toContain("Insufficient token balance");
  });

  it("simulates transfer successfully", async () => {
    const result = await simulateTransfer(
      contractId,
      sender,
      recipient,
      "1000",
      networkConfig
    );
    expect(result.success).toBe(true);
  });
});
```

## Migration Checklist

To add pre-flight checks to an existing transaction form:

- [ ] Import `useTransactionSimulator` hook
- [ ] Import `PreflightCheckDisplay` component
- [ ] Add state for `preflightResult`
- [ ] Create `handleCheck` function
- [ ] Add UI component to form
- [ ] Update form submission to require `preflightResult.success`
- [ ] Test with valid and invalid inputs
- [ ] Test error messages with common scenarios
- [ ] Update form documentation

## See Also

- [Transaction Simulator Source](../lib/transactionSimulator.ts)
- [Hook Source](../hooks/useTransactionSimulator.ts)
- [UI Components Source](../components/ui/PreflightCheck.tsx)
- [Example Forms](../components/forms/)

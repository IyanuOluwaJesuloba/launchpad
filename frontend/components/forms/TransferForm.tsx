"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PreflightCheckDisplay } from "@/components/ui/PreflightCheck";
import { useTransactionSimulator } from "@/hooks/useTransactionSimulator";
import { Send } from "lucide-react";

const transferSchema = z.object({
  tokenContractId: z.string().regex(/^C[A-Z0-9]{55}$/, "Invalid token contract ID"),
  toAddress: z.string().regex(/^G[A-Z2-7]{55}$/, "Invalid recipient address"),
  amount: z
    .string()
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Amount must be positive"),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  senderAddress: string;
  onSuccess?: (txHash: string) => void;
}

/**
 * Example Transfer Form with pre-flight checks
 */
export function TransferForm({ senderAddress, onSuccess }: TransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preflightResult, setPreflightResult] = useState<{
    isLoading: boolean;
    success: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const simulator = useTransactionSimulator();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isValid },
    watch,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    mode: "onChange",
  });

  const formData = watch();

  const handleCheck = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setPreflightResult({ isLoading: true, success: false, errors: [], warnings: [] });

    try {
      const result = await simulator.checkTransfer(
        formData.tokenContractId,
        senderAddress,
        formData.toAddress,
        BigInt(Math.floor(parseFloat(formData.amount) * 1e7)), // Assuming 7 decimals
      );

      setPreflightResult({
        isLoading: false,
        success: result.success,
        errors: result.errors,
        warnings: result.warnings,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setPreflightResult({
        isLoading: false,
        success: false,
        errors: [message],
        warnings: [],
      });
    }
  };

  const onSubmit = async (data: TransferFormData) => {
    if (!preflightResult?.success) {
      alert("Please run pre-flight check first");
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit transaction to Freighter
      // await submitToFreighter(...)
      console.log("Submitting transfer transaction:", data);
      onSuccess?.("0x...");
    } catch (error) {
      console.error("Failed to submit transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Token Contract ID
        </label>
        <Input
          type="text"
          placeholder="CABC123..."
          {...register("tokenContractId")}
        />
        {errors.tokenContractId && (
          <p className="text-red-400 text-sm mt-1">{errors.tokenContractId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Recipient Address
        </label>
        <Input
          type="text"
          placeholder="GABC123..."
          {...register("toAddress")}
        />
        {errors.toAddress && (
          <p className="text-red-400 text-sm mt-1">{errors.toAddress.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount
        </label>
        <Input
          type="text"
          placeholder="1000.50"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Pre-flight check status */}
      {preflightResult && (
        <div className="mt-6">
          <PreflightCheckDisplay
            isLoading={preflightResult.isLoading}
            errors={preflightResult.errors}
            warnings={preflightResult.warnings}
            successMessage={preflightResult.success ? "Ready to transfer tokens" : undefined}
            onDismiss={() => setPreflightResult(null)}
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCheck}
          disabled={!isValid || simulator.isLoading}
        >
          Check Transaction
        </Button>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting || !(preflightResult?.success ?? false)}
          isLoading={isSubmitting}
        >
          <Send className="w-4 h-4" />
          Transfer
        </Button>
      </div>
    </form>
  );
}

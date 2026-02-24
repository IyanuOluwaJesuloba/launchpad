"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PreflightCheckDisplay } from "@/components/ui/PreflightCheck";
import { StepMetadata } from "./steps/StepMetadata";
import { StepSupply } from "./steps/StepSupply";
import { StepAdmin } from "./steps/StepAdmin";
import { StepReview } from "./steps/StepReview";
import { useTransactionSimulator } from "@/hooks/useTransactionSimulator";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";

const deploySchema = z.object({
    name: z.string().min(1, "Token name is required").max(32, "Name too long"),
    symbol: z.string().min(1, "Symbol is required").max(12, "Symbol too long"),
    decimals: z.number().min(0).max(14),
    initialSupply: z.number().min(1, "Initial supply must be at least 1"),
    maxSupply: z.number().min(1, "Max supply must be at least 1").optional(),
    adminAddress: z.string().regex(/^G[A-Z2-7]{55}$/, "Invalid Stellar public key"),
}).refine((data) => !data.maxSupply || data.initialSupply <= data.maxSupply, {
    message: "Initial supply cannot exceed maximum supply",
    path: ["initialSupply"],
});

type DeployFormData = z.infer<typeof deploySchema>;

const STEPS = [
    "Metadata",
    "Supply",
    "Admin",
    "Review"
];

export default function DeployForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isDeploying, setIsDeploying] = useState(false);
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
        control,
        trigger,
        formState: { errors, isValid },
        watch,
    } = useForm<DeployFormData>({
        resolver: zodResolver(deploySchema),
        mode: "onChange",
        defaultValues: {
            decimals: 7,
            initialSupply: 0,
            name: "",
            symbol: "",
            adminAddress: "",
        }
    });

    const nextStep = async () => {
        let fieldsToValidate: (keyof DeployFormData)[] = [];
        if (currentStep === 1) fieldsToValidate = ["name", "symbol", "decimals"];
        if (currentStep === 2) fieldsToValidate = ["initialSupply", "maxSupply"];
        if (currentStep === 3) fieldsToValidate = ["adminAddress"];

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const onSubmit = async (data: DeployFormData) => {
        setIsDeploying(true);
        setPreflightResult({ isLoading: true, success: false, errors: [], warnings: [] });

        try {
            // Placeholder for actual deployment logic
            // In a real implementation, this would:
            // 1. Build the token contract deployment transaction
            // 2. Simulate it via Soroban RPC
            // 3. Show results to user
            // 4. Prompt for Freighter signature if all checks pass
            
            console.log("Deploying with data:", data);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            
            setPreflightResult({
                isLoading: false,
                success: true,
                errors: [],
                warnings: [],
            });
            
            alert("Token deployment simulated! Check console for data.");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setPreflightResult({
                isLoading: false,
                success: false,
                errors: [errorMessage],
                warnings: [],
            });
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="mb-10">
                <ProgressBar current={currentStep} total={STEPS.length} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 min-h-[400px] flex flex-col">
                <div className="flex-grow">
                    {currentStep === 1 && <StepMetadata register={register} errors={errors} />}
                    {currentStep === 2 && <StepSupply register={register} errors={errors} />}
                    {currentStep === 3 && <StepAdmin register={register} errors={errors} />}
                    {currentStep === 4 && <StepReview control={control} />}
                </div>

                {/* Pre-flight check results (shown on review step) */}
                {currentStep === 4 && preflightResult && (
                    <div className="mt-6 mb-6">
                        <PreflightCheckDisplay
                            isLoading={preflightResult.isLoading}
                            errors={preflightResult.errors}
                            warnings={preflightResult.warnings}
                            successMessage={preflightResult.success ? "Transaction is ready to sign" : undefined}
                            onDismiss={() => setPreflightResult(null)}
                        />
                    </div>
                )}

                <div className="mt-10 flex justify-between items-center bg-void-900/50 -mx-8 -mb-8 p-6 rounded-b-2xl border-t border-white/5">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={prevStep}
                        disabled={currentStep === 1 || isDeploying || (preflightResult?.isLoading ?? false)}
                        className="px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>

                    {currentStep < STEPS.length ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-2"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={async () => {
                                    const formData = watch();
                                    setPreflightResult({
                                        isLoading: true,
                                        success: false,
                                        errors: [],
                                        warnings: [],
                                    });
                                    // Pre-flight check simulation would go here
                                    // For now, simulate success after a delay
                                    await new Promise((resolve) => setTimeout(resolve, 1000));
                                    setPreflightResult({
                                        isLoading: false,
                                        success: true,
                                        errors: [],
                                        warnings: [],
                                    });
                                }}
                                disabled={!isValid || isDeploying || (preflightResult?.isLoading ?? false)}
                                className="px-6 py-2"
                            >
                                Check
                            </Button>
                            <Button
                                type="submit"
                                disabled={!isValid || isDeploying || !(preflightResult?.success ?? false)}
                                isLoading={isDeploying}
                                className="px-8 py-2"
                            >
                                <Rocket className="w-4 h-4" />
                                Deploy Token
                            </Button>
                        </div>
                    )}
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                    Step {currentStep}: {STEPS[currentStep - 1]}
                </p>
            </div>
        </div>
    );
}

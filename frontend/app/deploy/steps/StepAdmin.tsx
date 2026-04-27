"use client";

import { UseFormRegister, FieldErrors, useWatch, Control, useController } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { DeployFormData } from "../DeployForm";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

interface StepProps {
    register: UseFormRegister<DeployFormData>;
    errors: FieldErrors<DeployFormData>;
    control: Control<DeployFormData>;
}

interface ToggleProps {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

const Toggle = ({ id, label, description, checked, onChange, disabled }: ToggleProps) => (
    <div className="flex items-start justify-between gap-4 py-3">
        <div className="flex-1">
            <label htmlFor={id} className="text-sm font-medium text-gray-200 cursor-pointer">
                {label}
            </label>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <button
            type="button"
            id={id}
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stellar-500/40
                ${checked ? "bg-stellar-500" : "bg-void-700"}
                ${disabled ? "opacity-40 cursor-not-allowed" : ""}
            `}
        >
            <span
                className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                    transition duration-200 ease-in-out
                    ${checked ? "translate-x-5" : "translate-x-0"}
                `}
            />
        </button>
    </div>
);

export const StepAdmin = ({ register, errors, control }: StepProps) => {
    const [advancedOpen, setAdvancedOpen] = useState(false);

    const { field: authRequiredField } = useController({ control, name: "authorizationRequired" });
    const { field: authRevocableField } = useController({ control, name: "authorizationRevocable" });

    const authRequired = authRequiredField.value;

    const handleAuthRequiredChange = (val: boolean) => {
        authRequiredField.onChange(val);
        // Revocable can only be true when required is true
        if (!val) authRevocableField.onChange(false);
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-left">
                <h2 className="text-xl font-bold text-white mb-2">Administration</h2>
                <p className="text-sm text-gray-400">
                    Specify the administrative address and access-control settings for this token.
                </p>
            </div>

            <Input
                label="Admin Address (Stellar Public Key)"
                placeholder="e.g. G..."
                {...register("adminAddress")}
                error={errors.adminAddress?.message as string}
            />

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <p className="text-xs text-amber-200 leading-relaxed">
                    <strong>Note:</strong> The administrator has the authority to mint more tokens,
                    change token metadata, and manage other administrative settings.
                    Ensure you have access to this account.
                </p>
            </div>

            {/* Advanced Settings */}
            <div className="border border-white/10 rounded-xl overflow-hidden">
                <button
                    type="button"
                    onClick={() => setAdvancedOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-void-800/40 hover:bg-void-800/60 transition-colors"
                >
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <ShieldCheck className="w-4 h-4 text-stellar-400" />
                        Advanced Settings
                    </span>
                    {advancedOpen
                        ? <ChevronUp className="w-4 h-4 text-gray-500" />
                        : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>

                {advancedOpen && (
                    <div className="px-4 pb-4 pt-2 bg-void-900/30">
                        <p className="text-xs text-gray-500 mb-3">
                            These flags restrict who may hold this token and are suited for regulated
                            or security tokens that require KYC / whitelisting.
                        </p>

                        <Toggle
                            id="authorizationRequired"
                            label="Authorization Required"
                            description="Recipients must be explicitly authorized by the admin before they can receive or hold tokens."
                            checked={!!authRequired}
                            onChange={handleAuthRequiredChange}
                        />

                        <div className="border-t border-white/5" />

                        <Toggle
                            id="authorizationRevocable"
                            label="Authorization Revocable"
                            description="Allows the admin to revoke a holder's authorization, blocking them from receiving further transfers."
                            checked={!!authRevocableField.value}
                            onChange={(val) => authRevocableField.onChange(val)}
                            disabled={!authRequired}
                        />

                        {!authRequired && (
                            <p className="text-xs text-gray-600 italic mt-1">
                                Enable "Authorization Required" to use "Authorization Revocable".
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

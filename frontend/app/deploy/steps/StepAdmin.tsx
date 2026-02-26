import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { DeployFormData } from "../DeployForm";

interface StepProps {
    register: UseFormRegister<DeployFormData>;
    errors: FieldErrors<DeployFormData>;
}

export const StepAdmin = ({ register, errors }: StepProps) => {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-left">
                <h2 className="text-xl font-bold text-white mb-2">Administration</h2>
                <p className="text-sm text-gray-400">
                    Specify the administrative address for this token.
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
        </div>
    );
};

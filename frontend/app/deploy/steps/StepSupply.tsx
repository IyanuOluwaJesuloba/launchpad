import { FieldErrors, Controller, Control } from "react-hook-form";
import { NumericInput } from "@/components/ui/NumericInput";
import { DeployFormData } from "../DeployForm";

interface StepProps {
    control: Control<DeployFormData>;
    errors: FieldErrors<DeployFormData>;
}

export const StepSupply = ({ control, errors }: StepProps) => {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-left">
                <h2 className="text-xl font-bold text-white mb-2">Supply Configuration</h2>
                <p className="text-sm text-gray-400">
                    Set the initial and maximum supply for your token.
                </p>
            </div>

            <Controller
                name="initialSupply"
                control={control}
                render={({ field }) => (
                    <NumericInput
                        label="Initial Supply"
                        placeholder="e.g. 1,000,000"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.initialSupply?.message as string}
                    />
                )}
            />

            <Controller
                name="maxSupply"
                control={control}
                render={({ field }) => (
                    <NumericInput
                        label="Maximum Supply (Optional)"
                        placeholder="Leave empty for unlimited"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.maxSupply?.message as string}
                    />
                )}
            />
        </div>
    );
};
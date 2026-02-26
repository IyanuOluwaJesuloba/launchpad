import { Control, useWatch } from "react-hook-form";
import { DeployFormData } from "../DeployForm";

interface StepProps {
    control: Control<DeployFormData>;
}

const SummaryItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex justify-between py-2 border-b border-white/5">
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white font-medium truncate ml-4 max-w-[200px]">
            {value || <span className="text-gray-600 italic">Not set</span>}
        </span>
    </div>
);

export const StepReview = ({ control }: StepProps) => {
    const formData = useWatch({ control });

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-left">
                <h2 className="text-xl font-bold text-white mb-2">Review & Deploy</h2>
                <p className="text-sm text-gray-400">
                    Final check before deploying your token to the network.
                </p>
            </div>

            <div className="glass-card p-6 space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stellar-500 mb-4">Configuration Summary</h3>
                <SummaryItem label="Token Name" value={formData.name} />
                <SummaryItem label="Symbol" value={formData.symbol} />
                <SummaryItem label="Decimals" value={formData.decimals} />
                <SummaryItem label="Initial Supply" value={formData.initialSupply} />
                <SummaryItem label="Max Supply" value={formData.maxSupply || "Unlimited"} />
                <SummaryItem label="Admin Address" value={formData.adminAddress} />
            </div>
            
            <p className="text-[10px] text-gray-500 text-center px-4">
                By deploying, you will initiate a transaction on the Stellar network. 
                Resource fees will be calculated during the pre-flight check.
            </p>
        </div>
    );
};

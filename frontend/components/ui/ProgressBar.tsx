import React from "react";

interface ProgressProps {
    current: number;
    total: number;
}

export const ProgressBar = ({ current, total }: ProgressProps) => {
    const percentage = (current / total) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-stellar-400 uppercase tracking-wider">
                    Step {current} of {total}
                </span>
                <span className="text-xs font-medium text-gray-500">
                    {Math.round(percentage)}% Complete
                </span>
            </div>
            <div className="h-1.5 w-full bg-void-800 rounded-full overflow-hidden border border-white/5">
                <div
                    className="h-full bg-linear-to-r from-stellar-400 to-stellar-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(45,125,255,0.3)]"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

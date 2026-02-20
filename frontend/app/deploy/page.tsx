import DeployForm from "./DeployForm";

/**
 * /deploy — Token deployment page.
 *
 * TODO (issue #7): Build the full 4-step form here:
 *   (1) token metadata, (2) supply config, (3) admin address, (4) review + deploy.
 * Use react-hook-form + zod for validation and show a progress bar.
 */

export default function DeployPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in-up">
          Deploy Your <span className="gradient-text">Soroban Token</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto animate-fade-in-up [animation-delay:100ms]">
          Launch a production-ready SEP-41 token in minutes. Configure your metadata,
          supply, and governance, then deploy to the Stellar network.
        </p>
      </div>

      <div className="w-full animate-fade-in-up [animation-delay:200ms]">
        <DeployForm />
      </div>
    </div>
  );
}

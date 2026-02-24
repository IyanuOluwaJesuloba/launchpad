import type { Metadata } from "next";
import { ClaimVesting } from "./ClaimVesting";

export const metadata: Metadata = {
  title: "Claim Vesting — SoroPad",
  description:
    "View your vesting schedule and claim unlocked tokens on the SoroPad launchpad.",
};

export default function ClaimPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-bold gradient-text">Claim Vesting</h1>
      <p className="mb-10 text-gray-400">
        Enter your vesting contract address to view your schedule and release
        unlocked tokens.
      </p>
      <ClaimVesting />
    </section>
  );
}

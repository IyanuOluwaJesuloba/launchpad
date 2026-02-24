import type { Metadata } from "next";
import PersonalDashboard from "./PersonalDashboard";

export const metadata: Metadata = {
  title: "My Account — SoroPad",
  description:
    "View your personal token balances, vesting schedules, and transaction history on SoroPad.",
};

export default function MyAccountPage() {
  return <PersonalDashboard />;
}

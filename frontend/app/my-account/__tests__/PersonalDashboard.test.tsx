import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PersonalDashboard from "../PersonalDashboard";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockConnect = jest.fn();
const mockWallet = {
  connected: false,
  publicKey: null as string | null,
  connect: mockConnect,
  disconnect: jest.fn(),
  signTransaction: jest.fn(),
};

jest.mock("../../hooks/useWallet", () => ({
  useWallet: () => mockWallet,
}));

const mockFetchAccountBalances = jest.fn().mockResolvedValue([]);
const mockFetchVestingSchedule = jest.fn().mockResolvedValue({
  totalAmount: "1000",
  released: "250",
  cliffLedger: 100,
  endLedger: 1000,
  revoked: false,
});
const mockFetchCurrentLedger = jest.fn().mockResolvedValue(500);

jest.mock("@/hooks/useSoroban", () => ({
  useSoroban: () => ({
    fetchAccountBalances: mockFetchAccountBalances,
    fetchVestingSchedule: mockFetchVestingSchedule,
    fetchCurrentLedger: mockFetchCurrentLedger,
    networkConfig: { network: "testnet", horizonUrl: "", sorobanUrl: "" },
    formatTokenAmount: (v: string) => v,
    truncateAddress: (v: string) => v.slice(0, 6) + "..." + v.slice(-4),
  }),
}));

jest.mock("@/lib/stellar", () => ({
  fetchAccountOperations: jest.fn().mockResolvedValue({
    records: [],
    nextCursor: null,
  }),
  truncateAddress: (v: string, n = 4) =>
    v.length > n * 2 ? v.slice(0, n) + "..." + v.slice(-n) : v,
}));

jest.mock("@/components/ui/CopyButton", () => ({
  CopyButton: ({ label }: { label: string }) => (
    <button aria-label={label}>copy</button>
  ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setWallet(overrides: Partial<typeof mockWallet>) {
  Object.assign(mockWallet, overrides);
}

function resetWallet() {
  setWallet({
    connected: false,
    publicKey: null,
  });
  mockFetchAccountBalances.mockReset().mockResolvedValue([]);
  mockConnect.mockReset();
}

const TEST_PUBKEY = "GABC1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(resetWallet);

describe("PersonalDashboard", () => {
  describe("when wallet is not connected", () => {
    it("renders the connect prompt", () => {
      render(<PersonalDashboard />);
      expect(
        screen.getByRole("heading", { name: /connect your wallet/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /connect wallet/i }),
      ).toBeInTheDocument();
    });

    it("calls connect when button is clicked", async () => {
      const user = userEvent.setup();
      render(<PersonalDashboard />);
      await user.click(screen.getByRole("button", { name: /connect wallet/i }));
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe("when wallet is connected", () => {
    beforeEach(() => {
      setWallet({ connected: true, publicKey: TEST_PUBKEY });
    });

    it("renders the My Account heading", async () => {
      render(<PersonalDashboard />);
      expect(
        screen.getByRole("heading", { name: /my account/i }),
      ).toBeInTheDocument();
    });

    it("displays the wallet address", () => {
      render(<PersonalDashboard />);
      expect(screen.getByText(TEST_PUBKEY)).toBeInTheDocument();
    });

    it("shows empty state when there are no balances", async () => {
      render(<PersonalDashboard />);
      await waitFor(() =>
        expect(
          screen.getByText(/no balances found/i),
        ).toBeInTheDocument(),
      );
    });

    it("renders balance cards when balances are returned", async () => {
      mockFetchAccountBalances.mockResolvedValueOnce([
        { assetType: "native", assetCode: "XLM", assetIssuer: "", balance: "100.5" },
        {
          assetType: "credit_alphanum4",
          assetCode: "USDC",
          assetIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
          balance: "250.00",
        },
      ]);

      render(<PersonalDashboard />);

      await waitFor(() => {
        expect(screen.getByText("XLM")).toBeInTheDocument();
        expect(screen.getByText("USDC")).toBeInTheDocument();
      });
    });

    it("shows empty transaction history message", async () => {
      render(<PersonalDashboard />);
      await waitFor(() =>
        expect(
          screen.getByText(/no personal transaction history found/i),
        ).toBeInTheDocument(),
      );
    });

    it("renders the vesting contract lookup input", () => {
      render(<PersonalDashboard />);
      expect(
        screen.getByPlaceholderText(/vesting contract id/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /lookup/i }),
      ).toBeInTheDocument();
    });

    it("renders the refresh button", () => {
      render(<PersonalDashboard />);
      expect(
        screen.getByRole("button", { name: /refresh/i }),
      ).toBeInTheDocument();
    });

    it("has proper a11y section labels", () => {
      render(<PersonalDashboard />);
      expect(
        screen.getByRole("region", { name: /token balances/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: /vesting schedule/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: /personal transaction history/i }),
      ).toBeInTheDocument();
    });
  });
});

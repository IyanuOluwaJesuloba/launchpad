import { Page } from "@playwright/test";

/**
 * Inject a mock Freighter wallet into the page so that
 * `@stellar/freighter-api` calls resolve with a deterministic test keypair.
 *
 * @stellar/freighter-api v6 communicates with the extension via
 * window.postMessage (source: "FREIGHTER_EXTERNAL_MSG_REQUEST").  We listen
 * for those messages and immediately post a matching response so the
 * WalletProvider auto-connect flow completes without a real extension.
 *
 * The public key can be provided via the `TEST_PUBLIC_KEY` env variable or
 * defaults to a well-known testnet address.
 */
export const TEST_PUBLIC_KEY =
  process.env.TEST_PUBLIC_KEY ||
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

export async function mockFreighter(page: Page, publicKey = TEST_PUBLIC_KEY) {
  await page.addInitScript(
    (pk: string) => {
      const REQ = "FREIGHTER_EXTERNAL_MSG_REQUEST";
      const RES = "FREIGHTER_EXTERNAL_MSG_RESPONSE";

      window.addEventListener("message", (event: MessageEvent) => {
        // Only handle same-window messages from the freighter-api library.
        if (event.source !== window) return;

        // event.data is typed as `any` by the DOM lib — safe to access fields.
        const msg = event.data;
        if (!msg || msg.source !== REQ) return;

        const { messageId, type } = msg as { messageId: unknown; type: string };

        let payload: Record<string, unknown>;

        switch (type) {
          case "REQUEST_CONNECTION_STATUS":
            payload = { isConnected: true };
            break;
          case "REQUEST_ALLOWED_STATUS":
            payload = { isAllowed: true };
            break;
          case "SET_ALLOWED_STATUS":
            payload = { isAllowed: true };
            break;
          case "REQUEST_PUBLIC_KEY":
            payload = { publicKey: pk, error: "" };
            break;
          case "REQUEST_ACCESS":
            payload = { publicKey: pk, error: "" };
            break;
          case "SUBMIT_TRANSACTION":
          case "SUBMIT_TOKEN":
            payload = {
              signedTxXdr: (msg as Record<string, unknown>).transactionXdr ?? "",
              error: "",
            };
            break;
          case "REQUEST_NETWORK":
          case "REQUEST_NETWORK_DETAILS":
            payload = {
              network: "TESTNET",
              networkPassphrase: "Test SDF Network ; September 2015",
              error: "",
            };
            break;
          default:
            payload = {};
        }

        window.postMessage(
          { source: RES, messageId, ...payload },
          window.location.origin,
        );
      });

      // window.freighter = truthy → isConnected() short-circuits in v6
      // without sending a postMessage at all.
      const w = (window as unknown) as Record<string, unknown>;
      w.freighter = true;
      w.__FREIGHTER_API = {
        isConnected: async () => ({ isConnected: true }),
        isAllowed: async () => ({ isAllowed: true }),
        setAllowed: async () => ({ isAllowed: true }),
        getAddress: async () => ({ address: pk, error: "" }),
        signTransaction: async (xdr: string) => ({ signedTxXdr: xdr, error: "" }),
        getNetwork: async () => ({
          network: "TESTNET",
          networkPassphrase: "Test SDF Network ; September 2015",
        }),
      };
    },
    publicKey,
  );
}

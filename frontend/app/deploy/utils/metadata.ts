export type TokenMetadata = {
  name?: string;
  symbol?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  twitter?: string;
  discord?: string;
};

export function savePendingMetadata(symbol: string, metadata: TokenMetadata) {
  try {
    const key = `soropad:metadata:pending:${symbol}`;
    localStorage.setItem(key, JSON.stringify(metadata));
  } catch (e) {
    // ignore storage failures
    // eslint-disable-next-line no-console
    console.error("savePendingMetadata failed", e);
  }
}

export function saveMetadataForContract(contractId: string, metadata: TokenMetadata) {
  try {
    const key = `soropad:metadata:${contractId}`;
    localStorage.setItem(key, JSON.stringify(metadata));
  } catch (e) {
    // ignore
    // eslint-disable-next-line no-console
    console.error("saveMetadataForContract failed", e);
  }
}

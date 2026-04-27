import { type NetworkConfig } from "../types/network";

const DEFAULT_MERCURY_BASE_URL_TESTNET =
  process.env.NEXT_PUBLIC_MERCURY_TESTNET_URL ??
  "https://testnet.mercurydata.app/rest";
const DEFAULT_MERCURY_BASE_URL_MAINNET =
  process.env.NEXT_PUBLIC_MERCURY_MAINNET_URL ??
  "https://mainnet.mercurydata.app/rest";
const DEFAULT_MERCURY_AUTH_TOKEN =
  process.env.NEXT_PUBLIC_MERCURY_AUTH_TOKEN ?? "";

export interface IndexedEvent {
  id: string;
  ledger: number;
  tx_hash: string;
  timestamp: string;
  topic: unknown[];
  value: unknown;
}

export interface FetchIndexedEventsResult {
  events: IndexedEvent[];
  nextCursor: string | null;
}

export function getMercuryConfig(
  config: NetworkConfig,
): { baseUrl: string; token: string } | null {
  const explicitBaseUrl = process.env.NEXT_PUBLIC_MERCURY_BASE_URL;
  const baseUrl =
    explicitBaseUrl ??
    (config.network === "mainnet"
      ? DEFAULT_MERCURY_BASE_URL_MAINNET
      : DEFAULT_MERCURY_BASE_URL_TESTNET);
  const token = DEFAULT_MERCURY_AUTH_TOKEN;

  if (!token) {
    return null;
  }

  return { baseUrl, token };
}

export async function fetchIndexedEvents(
  contractId: string,
  config: NetworkConfig,
  options: {
    topics?: string[];
    cursor?: string;
    limit?: number;
  } = {},
): Promise<FetchIndexedEventsResult> {
  const mercury = getMercuryConfig(config);
  if (!mercury) {
    throw new Error(
      "Mercury indexer not configured. Set NEXT_PUBLIC_MERCURY_AUTH_TOKEN.",
    );
  }

  const { topics, cursor, limit = 200 } = options;

  const searchParams = new URLSearchParams();
  searchParams.set("limit", String(limit));
  if (topics && topics.length > 0) {
    searchParams.set("topics", topics.join(","));
  }
  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  const url = `${mercury.baseUrl}/events/by-contract/${contractId}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${mercury.token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Mercury request failed (${response.status}): ${body || response.statusText}`,
    );
  }

  const json = (await response.json()) as unknown;

  let rawEvents: unknown[];
  const payload = json as { events?: unknown; data?: unknown; cursor?: unknown };
  if (Array.isArray(payload?.events)) {
    rawEvents = payload.events;
  } else if (Array.isArray(payload?.data)) {
    rawEvents = payload.data;
  } else if (Array.isArray(json)) {
    rawEvents = json as unknown[];
  } else {
    rawEvents = [];
  }

  const nextCursor = extractNextCursor(payload, rawEvents);

  const events = rawEvents.map((raw) => normalizeEvent(raw));

  return { events, nextCursor };
}

function extractNextCursor(
  payload: { cursor?: unknown; next_cursor?: unknown },
  events: unknown[],
): string | null {
  if (typeof payload.cursor === "string" && payload.cursor) {
    return payload.cursor;
  }
  if (typeof payload.next_cursor === "string" && payload.next_cursor) {
    return payload.next_cursor;
  }

  // Fall back to the id of the last event as a cursor
  if (events.length > 0) {
    const last = events[events.length - 1] as {
      id?: unknown;
      event_id?: unknown;
    };
    const lastId = last.id ?? last.event_id;
    if (typeof lastId === "string" && lastId) return lastId;
    if (typeof lastId === "number") return String(lastId);
  }

  return null;
}

function normalizeEvent(raw: unknown): IndexedEvent {
  const e = raw as Record<string, unknown>;

  const id =
    typeof (e.id ?? e.event_id) === "string"
      ? String(e.id ?? e.event_id)
      : typeof (e.id ?? e.event_id) === "number"
        ? String(e.id ?? e.event_id)
        : "";

  const ledger =
    typeof (e.ledger ?? e.ledger_seq ?? e.ledger_sequence ?? e.ledgerSequence) ===
    "number"
      ? Number(
          e.ledger ?? e.ledger_seq ?? e.ledger_sequence ?? e.ledgerSequence,
        )
      : Number(
          e.ledger ?? e.ledger_seq ?? e.ledger_sequence ?? e.ledgerSequence,
        ) || 0;

  const tx_hash =
    typeof (e.tx_hash ?? e.txHash ?? e.hash) === "string"
      ? String(e.tx_hash ?? e.txHash ?? e.hash)
      : "";

  const rawTs =
    e.timestamp ??
    e.ledger_timestamp ??
    e.ledgerTimestamp ??
    e.created_at ??
    e.createdAt;
  let timestamp: string;
  if (typeof rawTs === "string") {
    timestamp = rawTs;
  } else if (typeof rawTs === "number") {
    timestamp = new Date(rawTs * 1000).toISOString();
  } else {
    timestamp = new Date(0).toISOString();
  }

  const topic: unknown[] = Array.isArray(e.topic)
    ? e.topic
    : Array.isArray(e.topics)
      ? e.topics
      : [];

  const value = e.value ?? e.data ?? null;

  return { id, ledger, tx_hash, timestamp, topic, value };
}

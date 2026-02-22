"use client";

import { useContext } from "react";
import { SettingsContext } from "../providers/SettingsProvider";

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a <SettingsProvider>");
  }
  return ctx;
}

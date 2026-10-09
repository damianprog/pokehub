"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60 * 1000;

function subscribe(onChange: () => void) {
  // Checking every second keeps the minute boundary prompt; the snapshot only
  // changes once a minute, so React re-renders once a minute.
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

function currentMinute() {
  return Math.floor(Date.now() / MINUTE) * MINUTE;
}

/**
 * The current time, floored to the minute. `serverNow` is what the server
 * rendered with, so hydration matches before the client clock takes over.
 */
export function useMinuteClock(serverNow: number): number {
  return useSyncExternalStore(subscribe, currentMinute, () => Math.floor(serverNow / MINUTE) * MINUTE);
}

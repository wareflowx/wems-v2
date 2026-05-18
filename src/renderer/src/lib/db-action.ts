// Database action wrapper utilities
// Centralized pattern to reduce repetition in database.ts

import { ipc } from "@@/ipc/manager";
import type { ORPCClient } from "orpc";

// Helper to get the ORPC client
function getClient(): ORPCClient | null {
  if (!ipc.isReady()) {
    console.warn(
      "[DB-ACTIONS] ORPC not ready - ensure you're using useORPCReady hook"
    );
    return null;
  }
  return ipc.client;
}

/**
 * Wrapper for database calls that handles the client null check pattern
 *
 * @param fn - Function to execute with the ORPC client
 * @param fallback - Value to return if client is not available
 */
export async function dbCall<T>(
  fn: (client: ORPCClient) => Promise<T>,
  fallback: T
): Promise<T> {
  const client = getClient();
  if (!client) {
    return fallback;
  }
  return fn(client);
}

/**
 * Create a getter function that follows the standard pattern
 */
export function createGetter<T>(
  getter: (client: ORPCClient) => Promise<T>,
  fallback: T
): () => Promise<T> {
  return () => dbCall(getter, fallback);
}

/**
 * Create a creator function that follows the standard pattern
 */
export function createCreator<TInput, TOutput>(
  creator: (client: ORPCClient, data: TInput) => Promise<TOutput>,
  fallback: TOutput | null
): (data: TInput) => Promise<TOutput | null> {
  return (data: TInput) =>
    dbCall((client) => creator(client, data), fallback);
}

/**
 * Create an updater function that follows the standard pattern
 */
export function createUpdater<TInput, TOutput>(
  updater: (client: ORPCClient, data: TInput) => Promise<TOutput>,
  fallback: TOutput | null
): (data: TInput) => Promise<TOutput | null> {
  return (data: TInput) =>
    dbCall((client) => updater(client, data), fallback);
}

/**
 * Create a deleter function that follows the standard pattern
 */
export function createDeleter(
  deleter: (client: ORPCClient, data: { id: number }) => Promise<unknown>,
  fallback: boolean | null
): (id: number) => Promise<boolean | null> {
  return (id: number) =>
    dbCall((client) => deleter(client, { id }).then(() => true), fallback);
}

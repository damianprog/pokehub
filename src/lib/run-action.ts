/** Shape every failed action result shares (`coding-standards.md` → Error Handling). */
export interface ActionFailure {
  success: false;
  error: string;
}

const TRANSPORT_ERROR_MESSAGE = "Something went wrong. Try again.";

/**
 * Awaits a server-action call and guarantees it resolves to a result.
 *
 * Actions catch their own errors and return `{ success: false, error }`, so
 * handlers branch on `result.success`. But the *call* can still throw when it
 * never reaches the action body — network drop, a non-2xx answer from
 * `proxy.ts` or the server, a stale action id after a deploy. Next's action
 * client surfaces all of those as the same opaque "unexpected response" error,
 * so nothing more specific than a generic message is honest here. Converting
 * the throw into a failure result lets each handler's existing `!success`
 * branch (revert optimistic state, clear busy flag, toast) cover both cases.
 */
export async function runAction<R extends { success: boolean }>(
  call: Promise<R>,
): Promise<R | ActionFailure> {
  try {
    return await call;
  } catch (error) {
    console.error("Server action call failed before returning a result:", error);
    return { success: false, error: TRANSPORT_ERROR_MESSAGE };
  }
}

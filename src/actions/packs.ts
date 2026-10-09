"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { DailyPackAlreadyOpenedError, openDailyPack, type OpenedPack } from "@/lib/packs";

type OpenDailyPackResult =
  | { success: true; data: OpenedPack }
  | { success: false; error: string; alreadyOpened?: true };

/** Takes no input: the user comes from the session, never from the client. */
export async function openDailyPackAction(): Promise<OpenDailyPackResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You need to be signed in to open packs." };
  }

  try {
    const pack = await openDailyPack(session.user.id);
    revalidatePath("/packs");
    return { success: true, data: pack };
  } catch (error) {
    if (error instanceof DailyPackAlreadyOpenedError) {
      return {
        success: false,
        error: "You've already opened today's pack.",
        alreadyOpened: true,
      };
    }
    console.error("Opening the daily pack failed:", error);
    return { success: false, error: "Couldn't open the pack, try again." };
  }
}

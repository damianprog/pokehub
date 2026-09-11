"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { setUserFavorite } from "@/lib/user-pokemon";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const setFavoriteSchema = z.object({
  pokemonId: z.number().int().positive(),
  slug: z.string().min(1),
  isFavorite: z.boolean(),
});

export async function setFavorite(
  input: z.infer<typeof setFavoriteSchema>,
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "You need to be signed in to favorite a Pokémon.",
    };
  }

  const parsed = setFavoriteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request." };
  }

  try {
    await setUserFavorite(
      session.user.id,
      parsed.data.pokemonId,
      parsed.data.isFavorite,
    );
    revalidatePath(`/p/${parsed.data.slug}`);
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Couldn't update your favorite. Try again." };
  }
}

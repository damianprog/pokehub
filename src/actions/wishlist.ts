"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { setUserWishlist, WishlistAtCapacityError } from "@/lib/user-pokemon";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; atCapacity?: boolean };

const setWishlistSchema = z.object({
  pokemonId: z.number().int().positive(),
  slug: z.string().min(1),
  isWishlist: z.boolean(),
});

export async function setWishlist(
  input: z.infer<typeof setWishlistSchema>,
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "You need to be signed in to wishlist a Pokémon.",
    };
  }

  const parsed = setWishlistSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request." };
  }

  try {
    await setUserWishlist(session.user.id, parsed.data.pokemonId, parsed.data.isWishlist);
    revalidatePath(`/p/${parsed.data.slug}`);
    return { success: true, data: null };
  } catch (error) {
    if (error instanceof WishlistAtCapacityError) {
      return { success: false, error: error.message, atCapacity: true };
    }
    return { success: false, error: "Couldn't update your wishlist. Try again." };
  }
}

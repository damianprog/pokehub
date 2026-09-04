"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { ratingValueSchema } from "@/lib/rating";
import { clearUserRating, setUserRating } from "@/lib/user-pokemon";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const setRatingSchema = z.object({
  pokemonId: z.number().int().positive(),
  slug: z.string().min(1),
  rating: ratingValueSchema,
});

const clearRatingSchema = z.object({
  pokemonId: z.number().int().positive(),
  slug: z.string().min(1),
});

export async function setRating(input: z.infer<typeof setRatingSchema>): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You need to be signed in to rate a Pokémon." };
  }

  const parsed = setRatingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid rating." };
  }

  try {
    await setUserRating(session.user.id, parsed.data.pokemonId, parsed.data.rating);
    revalidatePath(`/p/${parsed.data.slug}`);
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Couldn't save your rating. Try again." };
  }
}

export async function clearRating(input: z.infer<typeof clearRatingSchema>): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You need to be signed in to rate a Pokémon." };
  }

  const parsed = clearRatingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request." };
  }

  try {
    await clearUserRating(session.user.id, parsed.data.pokemonId);
    revalidatePath(`/p/${parsed.data.slug}`);
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Couldn't clear your rating. Try again." };
  }
}

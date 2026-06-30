import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getPokemon = cache((slug: string) =>
  prisma.pokemon.findUnique({ where: { slug } }),
);

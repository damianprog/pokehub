import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getUserByUsername = cache((username: string) =>
  prisma.user.findUnique({ where: { username } }),
);

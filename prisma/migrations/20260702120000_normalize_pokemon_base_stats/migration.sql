-- AlterTable: add the six base-stat columns nullable first, backfill from the
-- existing baseStats Json column, then enforce NOT NULL and drop the Json
-- column — safe on a populated table without a placeholder default value.
ALTER TABLE "Pokemon"
  ADD COLUMN "hp" INTEGER,
  ADD COLUMN "attack" INTEGER,
  ADD COLUMN "defense" INTEGER,
  ADD COLUMN "spAttack" INTEGER,
  ADD COLUMN "spDefense" INTEGER,
  ADD COLUMN "speed" INTEGER;

UPDATE "Pokemon" SET
  "hp" = ("baseStats"->>'hp')::INTEGER,
  "attack" = ("baseStats"->>'attack')::INTEGER,
  "defense" = ("baseStats"->>'defense')::INTEGER,
  "spAttack" = ("baseStats"->>'spAttack')::INTEGER,
  "spDefense" = ("baseStats"->>'spDefense')::INTEGER,
  "speed" = ("baseStats"->>'speed')::INTEGER;

ALTER TABLE "Pokemon"
  ALTER COLUMN "hp" SET NOT NULL,
  ALTER COLUMN "attack" SET NOT NULL,
  ALTER COLUMN "defense" SET NOT NULL,
  ALTER COLUMN "spAttack" SET NOT NULL,
  ALTER COLUMN "spDefense" SET NOT NULL,
  ALTER COLUMN "speed" SET NOT NULL,
  DROP COLUMN "baseStats";

import { RatingRow } from "@/components/pokemon/RatingRow";

interface RateRowProps {
  pokemonId: number;
  slug: string;
  pokemonName: string;
  isAuthenticated: boolean;
  initialRating: number | null;
  rank: number;
  typeLabel: string;
  listCount: number;
  likeCount: number;
}

export function RateRow(props: RateRowProps) {
  return <RatingRow {...props} />;
}

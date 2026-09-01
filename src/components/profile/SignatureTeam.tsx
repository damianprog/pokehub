import Image from "next/image";
import Link from "next/link";
import { TYPE_GRADIENTS, FALLBACK_GRADIENT } from "@/lib/type-gradients";

interface SignatureTeamMember {
  id: number;
  slug: string;
  name: string;
  types: string[];
  artworkUrl: string;
  rating: number;
}

interface SignatureTeamProps {
  team: SignatureTeamMember[];
}

export function SignatureTeam({ team }: SignatureTeamProps) {
  return (
    <div className="mt-[34px] px-[16px] md:px-[26px]">
      <div className="mb-[16px] flex items-center gap-[10px]">
        <span className="text-[14px] text-[#ffc88a]">📌</span>
        <h2 className="font-heading m-0 text-[18px] font-bold tracking-[0.02em]">
          Signature Team
        </h2>
        <span className="text-[12px] text-[#7b818c]">· {team.length} pinned</span>
      </div>
      <div className="grid grid-cols-3 gap-[14px] md:grid-cols-6">
        {team.map((member) => {
          const primaryType = member.types[0];
          const gradient = TYPE_GRADIENTS[primaryType] ?? FALLBACK_GRADIENT;
          const typeLabel =
            primaryType.charAt(0).toUpperCase() + primaryType.slice(1);

          return (
            <Link
              key={member.id}
              href={`/p/${member.slug}`}
              className="rounded-[14px] border border-white/[0.07] bg-[#15181e] p-[12px] text-center"
            >
              <div
                className="relative mb-[10px] aspect-square overflow-hidden rounded-[11px]"
                style={{ background: gradient.bg }}
              >
                <Image
                  src={member.artworkUrl}
                  alt={member.name}
                  fill
                  className="object-contain p-[6px]"
                />
              </div>
              <div className="text-[13.5px] font-bold">{member.name}</div>
              <div className="mt-[2px] text-[11px] text-[#7b818c]">
                {typeLabel} · ★ {member.rating}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import Image from "next/image";

const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

interface ListThumbnail {
  pokemonId: number;
  name: string;
  gradient: string;
}

interface ListItem {
  id: string;
  title: string;
  username: string;
  pokemonCount: number;
  thumbnails: ListThumbnail[];
}

interface AppearsInListsProps {
  lists: ListItem[];
}

export function AppearsInLists({ lists }: AppearsInListsProps) {
  return (
    <div className="leading-[normal]">
      <h2 className="font-heading mt-[14px] mb-[13px] text-[17px] font-bold md:mt-[28px] md:mb-[14px] md:text-[19px]">
        Appears in lists
      </h2>
      <div className="-mx-4 flex gap-[11px] overflow-x-auto px-4 pb-[6px] sm:-mx-[26px] sm:px-[26px] md:mx-0 md:grid md:grid-cols-3 md:gap-[13px] md:overflow-visible md:px-0 md:pb-0">
        {lists.map((list) => (
          <div
            key={list.id}
            className="w-[168px] flex-none cursor-pointer rounded-[14px] border border-white/[0.06] bg-[#15181e] p-[12px] md:w-auto md:p-[14px]"
          >
            <div className="mb-[9px] flex gap-[4px] md:mb-[10px]">
              {list.thumbnails.map((thumbnail) => (
                <div
                  key={thumbnail.pokemonId}
                  className="relative aspect-square flex-1 overflow-hidden rounded-[7px]"
                  style={{ background: thumbnail.gradient }}
                >
                  <Image
                    src={`${SPRITE_BASE}/${thumbnail.pokemonId}.png`}
                    alt={thumbnail.name}
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="text-[13px] font-bold md:text-[14px]">{list.title}</div>
            <div className="mt-[2px] text-[11px] text-[#7b818c] md:mt-[3px] md:text-[12px]">
              by {list.username} · {list.pokemonCount} Pokémon
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

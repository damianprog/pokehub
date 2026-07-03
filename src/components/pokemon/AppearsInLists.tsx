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
      <h2 className="font-heading mt-[28px] mb-[14px] text-[19px] font-bold">Appears in lists</h2>
      <div className="grid grid-cols-3 gap-[13px]">
        {lists.map((list) => (
          <div
            key={list.id}
            className="cursor-pointer rounded-[14px] border border-white/[0.06] bg-[#15181e] p-[14px]"
          >
            <div className="mb-[10px] flex gap-[4px]">
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
            <div className="text-[14px] font-bold">{list.title}</div>
            <div className="mt-[3px] text-[12px] text-[#7b818c]">
              by {list.username} · {list.pokemonCount} Pokémon
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

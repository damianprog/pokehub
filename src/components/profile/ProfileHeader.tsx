import Image from "next/image";

interface ProfileHeaderProps {
  name: string | null;
  username: string;
  image: string | null;
  joinedAt: Date;
}

export function ProfileHeader({
  name,
  username,
  image,
  joinedAt,
}: ProfileHeaderProps) {
  const displayName = name ?? username;
  const letter = username.charAt(0).toUpperCase();
  const joined = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(joinedAt);

  return (
    <div>
      <div
        className="relative h-[120px] overflow-hidden rounded-[18px] md:h-[172px]"
        style={{
          background: "linear-gradient(120deg,#3a2a5a,#6a5acd 45%,#c44fe0)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(400px 200px at 85% 120%, rgba(255,122,69,0.5), transparent)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 9px)",
          }}
        />
      </div>

      <div className="relative -mt-[38px] flex flex-wrap items-end gap-[16px] px-[16px] md:-mt-[52px] md:flex-nowrap md:gap-[22px] md:px-[26px]">
        <div
          className="relative flex size-[76px] flex-none items-center justify-center overflow-hidden rounded-[18px] border-4 border-[#0c0e12] font-heading text-[28px] font-extrabold text-white md:size-[108px] md:rounded-[26px] md:text-[40px]"
          style={{ background: "linear-gradient(135deg,#6a5acd,#c44fe0)" }}
        >
          {image ? (
            <Image src={image} alt="" fill sizes="108px" className="object-cover" />
          ) : (
            letter
          )}
        </div>
        <div className="min-w-0 pb-[6px]">
          <h1 className="font-heading truncate text-[22px] font-bold tracking-[-0.02em] md:text-[28px]">
            {displayName}
          </h1>
          <div className="mt-[2px] truncate text-[13px] text-[#8b919e] md:text-[14px]">
            @{username} · joined {joined}
          </div>
        </div>
        <div className="flex w-full flex-none justify-end gap-[9px] md:ml-auto md:w-auto md:justify-normal md:pb-[6px]">
          <button
            type="button"
            className="h-[38px] rounded-[10px] bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-[20px] text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(196,79,224,0.32)]"
          >
            Follow
          </button>
          <button
            type="button"
            aria-label="More options"
            className="size-[38px] rounded-[10px] border border-white/10 bg-white/[0.06] text-[#9aa0ab]"
          >
            ⋯
          </button>
        </div>
      </div>
    </div>
  );
}

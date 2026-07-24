interface ProfileBioStatsProps {
  bio: string | null;
  stats: {
    reviews: number;
    lists: number;
    followers: number;
    following: number;
  };
}

export function ProfileBioStats({ bio, stats }: ProfileBioStatsProps) {
  const items: { label: string; value: number }[] = [
    { label: "Reviews", value: stats.reviews },
    { label: "Lists", value: stats.lists },
    { label: "Followers", value: stats.followers },
    { label: "Following", value: stats.following },
  ];

  return (
    <div className="px-[16px] md:px-[26px]">
      {bio && (
        <p className="mt-[18px] max-w-[580px] text-[14px] leading-[1.55] text-[#cdd2da] md:text-[15px]">
          {bio}
        </p>
      )}
      <div className="mt-[20px] flex flex-wrap gap-x-[24px] gap-y-[10px] md:gap-x-[30px]">
        {items.map((item) => (
          <div key={item.label}>
            <span className="font-heading text-[19px] font-bold md:text-[22px]">
              {item.value.toLocaleString()}
            </span>{" "}
            <span className="text-[12px] text-[#8b919e] md:text-[13px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

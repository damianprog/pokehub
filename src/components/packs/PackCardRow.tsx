import type { PackSlot } from "@/lib/packs";
import { PackCard } from "@/components/packs/PackCard";

// Literal classes (not computed) so Tailwind generates them. The first card
// waits a beat, then each follows ~450 ms after the previous one.
const STAGGER = ["[animation-delay:350ms]", "[animation-delay:800ms]", "[animation-delay:1250ms]"];

interface PackCardRowProps {
  slots: PackSlot[];
  /** Fade and lift the cards in one by one (the fresh reveal). */
  animated: boolean;
}

export function PackCardRow({ slots, animated }: PackCardRowProps) {
  return (
    <div className="flex justify-center gap-[8px] md:gap-[18px]">
      {slots.map((slot, index) => (
        <div
          key={slot.position}
          className={`w-[97px] md:w-[180px] ${animated ? `animate-pack-card-in motion-reduce:animate-none ${STAGGER[index] ?? ""}` : ""}`}
        >
          <PackCard slot={slot} />
          <div className="mt-[7px] text-center text-[11px] leading-[1.3] text-[#7b818c] md:mt-[10px] md:text-[12.5px]">
            {slot.isNew ? (
              <>
                <span className="font-bold text-brand-link">New!</span> added to collection
              </>
            ) : (
              "Duplicate"
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

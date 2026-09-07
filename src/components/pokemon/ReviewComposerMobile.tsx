"use client";

import Image from "next/image";
import type { ReactNode } from "react";

interface ReviewComposerMobileProps {
  pokemonName: string;
  dexNumber: string;
  artworkUrl: string;
  gradient: string;
  starControl: ReactNode;
  ratingCaption: ReactNode;
  textField: ReactNode;
  pickARatingHint: ReactNode;
  canSubmit: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

/** Full-screen sheet variant of the review composer — see `ReviewComposerDesktop` for the centered-modal counterpart. */
export function ReviewComposerMobile({
  pokemonName,
  dexNumber,
  artworkUrl,
  gradient,
  starControl,
  ratingCaption,
  textField,
  pickARatingHint,
  canSubmit,
  onClose,
  onSubmit,
}: ReviewComposerMobileProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Write a review for ${pokemonName}`}
      className="flex h-full w-full flex-col overflow-hidden bg-[#0c0e12] md:hidden"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex flex-none items-center gap-[12px] border-b border-white/[0.06] px-[18px] py-[14px]">
        <button type="button" onClick={onClose} className="text-[14px] font-bold text-[#9aa0ab]">
          Cancel
        </button>
        <div className="font-heading flex-1 text-center text-[16px] font-bold">Review</div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`text-[14px] font-bold ${canSubmit ? "text-[#c9a8dd]" : "text-[#5c636e]"}`}
        >
          Post
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-[20px] overflow-y-auto p-[20px_18px]">
        <div className="flex items-center gap-[13px]">
          <div className="h-[56px] w-[56px] flex-none overflow-hidden rounded-[14px]" style={{ background: gradient }}>
            <Image src={artworkUrl} alt={pokemonName} width={56} height={56} className="h-full w-full object-contain p-[3px]" />
          </div>
          <div>
            <div className="font-heading text-[22px] font-bold tracking-[-0.02em]">{pokemonName}</div>
            <div className="text-[12.5px] text-[#7b818c]">{dexNumber}</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-[8px] rounded-[14px] border border-white/[0.06] bg-[#13161b] py-[18px]">
          {starControl}
          {ratingCaption}
        </div>
        {textField}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`h-[50px] rounded-[13px] text-[15px] font-bold ${
            canSubmit
              ? "bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-white shadow-[0_8px_24px_rgba(196,79,224,0.35)]"
              : "bg-white/[0.05] text-[#6c7280]"
          }`}
        >
          Post review
        </button>
        {pickARatingHint}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import type { ReactNode } from "react";

interface ReviewComposerDesktopProps {
  pokemonName: string;
  dexNumber: string;
  artworkUrl: string;
  gradient: string;
  username: string;
  starControl: ReactNode;
  ratingCaption: ReactNode;
  textField: ReactNode;
  pickARatingHint: ReactNode;
  canSubmit: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

/** Centered-modal variant of the review composer — see `ReviewComposerMobile` for the full-screen-sheet counterpart. */
export function ReviewComposerDesktop({
  pokemonName,
  dexNumber,
  artworkUrl,
  gradient,
  username,
  starControl,
  ratingCaption,
  textField,
  pickARatingHint,
  canSubmit,
  onClose,
  onSubmit,
}: ReviewComposerDesktopProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Write a review for ${pokemonName}`}
      className="animate-modal-in hidden max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[20px] border border-white/10 bg-card md:flex"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-[14px] border-b border-white/[0.06] p-[20px_22px]">
        <div className="h-[48px] w-[48px] flex-none overflow-hidden rounded-[12px]" style={{ background: gradient }}>
          <Image src={artworkUrl} alt={pokemonName} width={48} height={48} className="h-full w-full object-contain p-[3px]" />
        </div>
        <div className="flex-1">
          <div className="text-[12px] font-semibold tracking-[0.06em] text-[#7b818c] uppercase">
            Write a review
          </div>
          <div className="font-heading mt-[2px] text-[21px] font-bold tracking-[-0.01em]">
            {pokemonName} <span className="text-[15px] font-normal text-[#5c636e]">{dexNumber}</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[9px] border border-white/[0.08] bg-white/[0.05] text-[15px] text-[#9aa0ab]"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-[20px] overflow-y-auto p-[22px]">
        <div className="flex flex-col items-center gap-[9px] py-[6px]">
          {starControl}
          {ratingCaption}
        </div>

        {textField}

        <div className="flex items-center gap-[10px]">
          <div className="flex-1 text-[12.5px] text-[#7b818c]">
            Posting as <span className="font-bold text-[#e8eaed]">@{username}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-[42px] rounded-[11px] border border-white/10 bg-white/[0.06] px-[20px] text-[14px] font-bold text-[#cdd2da]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`h-[42px] rounded-[11px] px-[22px] text-[14px] font-bold ${
              canSubmit
                ? "bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-white shadow-[0_6px_22px_rgba(196,79,224,0.35)]"
                : "cursor-not-allowed border border-white/[0.07] bg-white/[0.05] text-[#6c7280]"
            }`}
          >
            Post review
          </button>
        </div>
        {pickARatingHint}
      </div>
    </div>
  );
}

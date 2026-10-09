/** Shown above "Try again" when an open fails. The open is one transaction, so nothing was used up. */
export function PackErrorNotice() {
  return (
    <div
      role="alert"
      className="mb-[12px] flex w-full max-w-[400px] items-start gap-[10px] rounded-[12px] border border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.08)] px-[13px] py-[12px] text-left md:mb-[16px] md:gap-[11px] md:px-[15px] md:py-[13px]"
    >
      <span className="flex size-[20px] flex-none items-center justify-center rounded-full bg-[rgba(255,107,107,0.18)] text-[12px] font-extrabold text-[#ff9b9b] md:size-[22px] md:text-[13px]">
        !
      </span>
      <div>
        <div className="text-[13.5px] font-bold text-[#ffc4c4] md:text-[14px]">
          Couldn&apos;t open the pack, try again.
        </div>
        <div className="mt-[3px] text-[12px] text-[#a8aeb9] md:text-[12.5px]">
          Your pack wasn&apos;t used. It&apos;s still waiting for you.
        </div>
      </div>
    </div>
  );
}

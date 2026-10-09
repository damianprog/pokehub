import type { ReactNode } from "react";

/** The large rounded card every pack state renders inside. */
export function PackStageCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center rounded-[18px] border border-white/[0.07] bg-[#13161b] px-[14px] py-[22px] md:min-h-[440px] md:rounded-[20px] md:px-[40px] md:py-[36px]">
      {children}
    </div>
  );
}

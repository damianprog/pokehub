export function FinalCta() {
  return (
    <section
      className="px-[26px] py-[90px] text-center"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background:
          "radial-gradient(1000px 400px at 50% 0%, rgba(196,79,224,0.07), transparent)",
      }}
    >
      <h2 className="font-heading m-0 mb-[14px] text-[48px] font-extrabold leading-tight tracking-[-0.03em]">
        Your Pokédex.
        <br />
        Your opinions.
      </h2>

      <p
        className="mx-auto mb-[34px] max-w-[420px] text-[18px]"
        style={{ color: "#7b818c" }}
      >
        Free forever. Join 214,000 trainers already tracking their collection.
      </p>

      <div className="mb-5 flex items-center justify-center gap-3">
        <button
          className="h-[52px] cursor-pointer rounded-[13px] border-0 px-[34px] text-[17px] font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #ff7a45, #c44fe0)",
            boxShadow: "0 10px 30px rgba(196,79,224,0.38)",
          }}
        >
          Create free account
        </button>

        <button
          className="inline-flex h-[52px] cursor-pointer items-center rounded-[13px] px-7 text-[16px] font-semibold"
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.05)",
            color: "#e8eaed",
          }}
        >
          Browse as guest
        </button>
      </div>

      <div className="text-[13px]" style={{ color: "#7b818c" }}>
        Already a trainer?{" "}
        <button
          className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold"
          style={{ color: "#c44fe0" }}
        >
          Log in
        </button>
      </div>
    </section>
  );
}

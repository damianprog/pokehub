const links = ["About", "Blog", "API", "Privacy", "Terms"];

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div
        className="mx-auto flex max-w-[1180px] items-center justify-between px-[26px] pt-[28px] pb-[28px]"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "7px",
              background: "linear-gradient(135deg, #ff7a45, #c44fe0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "12px",
              fontFamily: "var(--font-space-grotesk)",
              flexShrink: 0,
            }}
          >
            P
          </div>
          <span
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 600,
              fontSize: "14px",
              color: "#7b818c",
            }}
          >
            PokeHub · 2026
          </span>
        </div>

        <div style={{ display: "flex", gap: "22px", fontSize: "13px", color: "#5c636e" }}>
          {links.map((label) => (
            <a key={label} href="#" style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

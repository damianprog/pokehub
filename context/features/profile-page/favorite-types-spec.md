# Profile Page — Favorite Types Sidebar Spec

## Status

Planning — not started

## Goal

The "Favorite types" stats sidebar on `/u/[username]`, sitting to the right of the "Recent
activity" feed built in [recent-activity-spec.md](./recent-activity-spec.md) — a small stats card
showing the profile owner's top-3 favorite types by share, plus an average rating and collection
progress line.

## Design reference

`PokeHub.dc.html`, `SCREEN 2 · PROFILE` — Recent activity and this sidebar form a single two-column
row (`Recent activity` left, sidebar right, fixed sidebar width). This is the section
`recent-activity-spec.md` explicitly deferred as out of scope.

## Scope

In scope: the "Favorite types" sidebar card — its eyebrow label, the per-type share rows with
progress bars, and the "Avg. rating" / "Collection" footer lines.

Out of scope: any change to the Recent Activity cards' own content — only the surrounding layout
(making room for this sidebar alongside them) is touched.

## Content & copy

- **Eyebrow label** — small uppercase "Favorite types" label, visually distinct from the
  `Recent activity` / `Signature Team` heading style used elsewhere on this page (this one is a
  muted, small-caps stat-block label, not a section `<h2>`).
- **Type rows** — a fixed stack of the profile owner's top 3 favorite types, each row showing:
  - The type name, colored with its accent, and a percentage figure right-aligned on the same
    line.
  - A thin horizontal progress bar below, filled to that percentage in a solid version of the same
    type's accent color.
- **Footer stats** — below a divider: an "Avg. rating" line and a "Collection" line (caught count /
  total Pokémon count), each with a bold label and a muted value.
- **Data source** — this is a per-user aggregate (favorite/rated Pokémon grouped by type, sorted by
  share) that would come from `UserPokemon` once the rate/review/favorite feature exists. It
  doesn't yet (zero real rows), so — same reasoning as `RecentActivity`/`SignatureTeam` — ship with
  the fixed mock values shown in the design (Ghost 38%, Fire 24%, Dragon 18%; Avg. rating 3.8;
  Collection 847 / 1,302) on every profile this iteration, rather than a live aggregation query.

## Layout & components

- This sidebar and `RecentActivity` share one row: a fixed-width sidebar to the right of the
  activity feed, which now becomes the flexible column instead of the sole column it was in
  `recent-activity-spec.md`. Implementing this will mean restructuring how `RecentActivity` is
  wired into `/u/[username]` (its own top-level spacing/wrapper) so both pieces sit inside one
  shared two-column row instead of `RecentActivity` owning the full-width row by itself.
- Server component — no client state needed.
- Type name colors: reuse the existing `TYPE_BADGE_COLORS` map, not a new color set. Note one
  wrinkle to resolve during implementation: the design's progress-bar fill color per type is a
  more saturated solid shade than anything currently in `TYPE_BADGE_COLORS` or `TYPE_GRADIENTS` (it
  doesn't cleanly match either existing map for every type in the design, e.g. Dragon). Pick the
  closest reuse (e.g. a gradient's first color stop) rather than introducing a whole new per-type
  color map for a three-row stat bar.

## Interactions

- Static — no links, no click handlers. Unlike Recent Activity's thumbnail, nothing in this
  sidebar is scoped as clickable in the design.

## Responsive notes

The design shows this as a fixed-width column beside Recent Activity, which only works at wider
viewports. Below the breakpoint where the two-column row would overflow, stack the sidebar below
the Recent Activity feed as a full-width card instead, consistent with how other multi-column
sections on this page (e.g. Signature Team's grid) already collapse for narrow widths.

## Out of scope

- Real per-user type-share aggregation, average rating, or collection progress (all depend on
  features — rate/review/favorite, packs/collection — that don't exist yet).
- Showing more or fewer than 3 type rows, or making the row count dynamic.
- Any interactivity (clicking a type row, linking to a filtered view, etc.) — the design has none.

## Acceptance criteria

- `/u/[username]` shows the "Favorite types" sidebar to the right of Recent Activity at desktop
  widths, with 3 type rows (name, percentage, progress bar) and the Avg. rating / Collection
  footer.
- No layout break from 375px to 1920px; the sidebar stacks below Recent Activity rather than
  overflowing or squeezing at narrow widths.

## History

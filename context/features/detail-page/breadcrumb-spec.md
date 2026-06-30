# Spec — `Breadcrumb` component

> **Status:** spec / pre-implementation
> **Scope:** a generic, reusable breadcrumb component; first usage on `/p/[slug]`.
> **Out of scope:** type-filter links (no `/type/[type]` route yet), mobile truncation, JSON-LD structured data.

---

## 1. Goal & scope

A single reusable `Breadcrumb` component that renders a horizontal trail of navigation items
separated by ` · `. First consumer is the Pokémon detail page (`/p/[slug]`), which shows:

```
Browse · Fire · Charizard
```

The component is generic — it takes an ordered list of items; the page decides what the items are.

---

## 2. Visual spec (from Claude Design)

| Segment   | Colour     | Behaviour                                               |
| --------- | ---------- | ------------------------------------------------------- |
| Browse    | `#7b818c`  | Links to `/discover`, cursor pointer                    |
| Fire      | `#7b818c`  | Plain text — not linked (no type-filter route yet)      |
| Charizard | `#9aa0ab`  | Current page — not linked, slightly brighter            |

- Font size: `13px`
- Separator: ` · ` in the same muted `#7b818c` colour
- `margin-bottom: 18px` applied by the page, not the component
- Active (last) item is distinguishable by colour only — no bold, no underline

---

## 3. Props

Each item has a `label` (string) and an optional `href`. Omitting `href` renders the item as
plain text. The last item should never have `href` — it represents the current page. Any
intermediate item without `href` (e.g. the type segment) is also plain text.

---

## 4. Rendering rules

- Items are separated by ` · ` — the separator appears before every item except the first.
- Items with `href` render as a `<Link>` with a subtle hover colour shift toward `#9aa0ab`.
- Items without `href` render as a `<span>`.
- The last item receives `aria-current="page"` for accessibility.
- Intermediate items without `href` get no role — they are informational, not interactive.

---

## 5. Usage on `/p/[slug]`

The page assembles the items from the `Pokemon` record it already has:

- **Browse** — links to `/discover` (the browse/Pokédex route)
- **Type** — the Pokémon's primary type, capitalised (e.g. `Fire`), no `href` for now
- **Name** — the Pokémon's name (e.g. `Charizard`), no `href`, current page

When a type-filter route is added later, the middle item gains an `href` with no other changes.

---

## 6. File location

```
src/components/ui/Breadcrumb.tsx
```

---

## 7. Deliberate non-goals (this iteration)

- **Type-filter links** — no `/type/[type]` or `/discover?type=` route exists yet.
- **JSON-LD `BreadcrumbList`** — SEO structured data; add once the route tree stabilises.
- **Mobile truncation** — a 3-item trail fits on 375px without ellipsis.
- **shadcn Breadcrumb** — their separator-component pattern doesn't match this flat ` · ` design.

---

## 8. Testing

- `/p/charizard` → renders `Browse · Fire · Charizard`
- "Browse" is a link; "Fire" and "Charizard" are plain text with no pointer cursor
- `/p/mew` → renders `Browse · Psychic · Mew`

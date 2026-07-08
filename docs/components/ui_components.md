# UI Components

All primitive UI components live in `src/components/ui/` and are exported from `src/components/ui/index.ts`. They are used throughout the app for visual consistency.

---

## Button

`src/components/ui/Button.tsx`

A styled button with variant and size props. Extends all native HTML button attributes.

```typescript
<Button variant="primary" size="md">Save</Button>
<Button variant="ghost" size="sm">Cancel</Button>
<Button variant="danger">Delete</Button>
```

Variants: `primary` (blue filled), `ghost` (transparent, slate hover), `surface` (white bordered), `danger` (red filled), `outline` (blue border, transparent fill).

Sizes: `sm` (xs text, compact padding), `md` (sm text, default padding), `lg` (sm text, more padding).

Uses `React.forwardRef` so it can be targeted as a ref (useful for focus management in forms).

---

## Input

`src/components/ui/Input.tsx`

A styled text input. Wraps native input with consistent border, focus ring, and error state styling.

---

## Card

`src/components/ui/Card.tsx`

A white bordered container with rounded corners and a subtle shadow. Used to group related content on pages.

---

## Badge

`src/components/ui/Badge.tsx`

A small inline status indicator. Used for things like `pending` / `paid` status on invoices.

---

## Modal

`src/components/ui/Modal.tsx`

A centered overlay modal. Renders nothing when `show` is `false`. Clicking the backdrop calls `onClose`.

```typescript
<Modal show={isOpen} onClose={() => setIsOpen(false)} title="Add Company" size="md">
  <form>...</form>
</Modal>
```

Sizes: `sm`, `md` (default), `lg`, `xl`. The modal is scrollable internally (`max-h-[90vh]`, overflow-y-auto on the body) so tall forms don't overflow the screen.

---

## SearchableSelect

`src/components/ui/SearchableSelect.tsx`

A custom dropdown with inline text search. Used across all transaction forms where the user needs to pick an item, party, account, etc. from a potentially long list.

```typescript
<SearchableSelect
  label="Party"
  options={parties.map(p => ({ value: p.id, label: p.name }))}
  value={selectedPartyId}
  onChange={(val) => setSelectedPartyId(val)}
  placeholder="Select party..."
  error={errors.party}
/>
```

Props:
- `options` — array of `{ value: string, label: string }`
- `value` — the currently selected value (string ID)
- `onChange` — callback receiving the selected value
- `placeholder` — shown when nothing is selected
- `error` — shows an error message below the field in red
- `label` — uppercase label above the field
- `compact` — smaller padding variant for use inside table rows
- `borderless` — removes border styling, for inline cell editing contexts
- `disabled` — prevents interaction

Supports full keyboard navigation: arrow keys to move highlight, Enter to select, Escape to close, Tab to select and move focus. The currently highlighted item scrolls into view automatically.

The search field is a plain `<input>` — when open it shows a search string; when closed it shows the selected option's label. This makes it feel like a native select but with filtering.

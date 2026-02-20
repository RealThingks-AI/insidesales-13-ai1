
## Fix: Keep Deal Card Width Consistent During Expansion

### Problem
When the info button is pressed, the expanded stage column switches from `minmax(240px, 1fr)` to `minmax(300px, 300px)`, causing the deal cards in that column to change width. The user wants card width to remain the same before and after expansion.

### Solution
Change the expanded stage column definition to use the same sizing as normal columns so it does not grow or shrink when the details panel appears.

### Changes

**File 1: `src/components/KanbanBoard.tsx`** (line 510)
- Change `'minmax(300px, 300px)'` to `'minmax(240px, 1fr)'` so the expanded stage column uses the same sizing as all other stage columns.

**File 2: `src/components/kanban/AnimatedStageHeaders.tsx`** (line 53)
- Change `'minmax(300px, 300px)'` to `'minmax(240px, 1fr)'` so the header grid matches the content grid and stage headers also keep consistent width.

Both files have matching grid definitions that need to stay in sync. After this change, the only new column introduced during expansion is the details panel -- stage columns remain unchanged in width.

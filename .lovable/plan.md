
# Stakeholder Contacts - Multiple Contacts Per Role with Info Button

## Overview
Update the stakeholders section to support multiple contacts per role (Budget Owner, Champion, Influencer, Objector) and add an info (i) button next to each contact for adding role-specific notes. Layout will be a 2x2 grid matching the reference image.

## Database Changes

### 1. New Junction Table: `deal_stakeholders`
Replaces the single-contact foreign key columns with a many-to-many relationship.

```text
deal_stakeholders
-----------------
id              uuid (PK, default gen_random_uuid())
deal_id         uuid (NOT NULL, references deals.id ON DELETE CASCADE)
contact_id      uuid (NOT NULL, references contacts.id ON DELETE CASCADE)
role            text (NOT NULL) -- 'budget_owner', 'champion', 'influencer', 'objector'
note            text (nullable) -- role-specific notes about this contact for this deal
created_at      timestamptz (default now())
created_by      uuid (nullable)

UNIQUE(deal_id, contact_id, role)  -- prevent duplicate assignments
```

### 2. RLS Policies for `deal_stakeholders`
- SELECT: all authenticated users (matches deals visibility)
- INSERT: authenticated users (`created_by = auth.uid()`)
- UPDATE: creator or admin
- DELETE: creator or admin

### 3. Data Migration
Migrate existing data from the 4 single-column fields (`budget_owner_contact_id`, `champion_contact_id`, etc.) into the new junction table so no data is lost.

## Frontend Changes

### File: `src/components/DealExpandedPanel.tsx` - StakeholdersSection

**Current behavior:** Each role shows one contact badge or an "Add" dropdown.

**New behavior:**
- Each role shows a list of selected contacts, each with:
  - Contact name (fills available space)
  - An `i` (Info) icon button that opens a Popover with a textarea to add/edit notes
  - An `x` button to remove the contact
- A "+ Add" button at the end to add more contacts
- 2x2 grid layout: Budget Owner + Champion on row 1, Influencer + Objector on row 2

**Layout per role (matching reference image):**

```text
Budget Owner : Contact 6 (i)    Champion  : Contact 1 (i) Contact 2 (i)
Influencer   : Contact 8 (i)    Objector  : Contact 4 (i) Contact 3 (i)
```

**State management changes:**
- Replace single-value state (`budgetOwner`, `champion`, etc.) with arrays fetched from `deal_stakeholders`
- Add note editing state (popover open per contact, note text)
- Fetch stakeholders via query: `SELECT * FROM deal_stakeholders WHERE deal_id = ?`
- Add/remove contacts via INSERT/DELETE on `deal_stakeholders`
- Save notes via UPDATE on `deal_stakeholders`

### File: `src/types/deal.ts`
No changes needed to the Deal interface -- the old single-contact fields remain in the type for backward compatibility but won't be used in the UI.

### File: `src/integrations/supabase/types.ts`
This file auto-generates from the DB schema -- no manual edits.

## Technical Details

| Step | What | Where |
|------|------|-------|
| 1 | Create `deal_stakeholders` table with RLS | DB migration |
| 2 | Migrate existing FK data to junction table | DB migration |
| 3 | Rewrite `StakeholdersSection` component | `DealExpandedPanel.tsx` lines 178-246 |
| 4 | Use `useQuery` to fetch stakeholders for the deal | Same component |
| 5 | Add contact: INSERT into `deal_stakeholders` | Same component |
| 6 | Remove contact: DELETE from `deal_stakeholders` | Same component |
| 7 | Info button: Popover with Textarea, UPDATE note on blur/save | Same component |

## UI Component Structure

Each stakeholder role renders:
1. Label (e.g., "Budget Owner :") -- fixed width
2. Horizontal flex wrap of contact chips, each chip containing:
   - Contact name text
   - Info icon button (opens note popover)
   - X icon button (removes contact)
3. "+ Add" dropdown button (ContactSearchableDropdown) to add another contact

The note popover will contain:
- A `Textarea` for entering notes
- Auto-saves on blur
- Shows a small indicator if a note exists (filled info icon vs outline)

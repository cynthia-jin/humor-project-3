@AGENTS.md

# Project Context

This is a **prompt chain management tool** for generating AI humor captions from images.

## Core Concepts
- A **humor flavor** is a set of ordered steps that run sequentially to create captions from an input image.
- Each **step** in the chain takes input from the previous step's output and produces new output.
- Example chain: (1) Image -> text description, (2) Description -> funny observations, (3) Observations -> five short captions.

## Required Functionality
- CRUD for humor flavors (create, read, update, delete)
- CRUD for humor flavor steps (create, read, update, delete)
- Reorder humor flavor steps (move step 2 to step 1, etc.)
- Read captions produced by a specific humor flavor
- Test a humor flavor by generating captions using the REST API
- Generate captions using an image test set

## Auth
- App only works for logged-in users where `profiles.is_superadmin == TRUE` or `profiles.is_matrix_admin == TRUE`

## External API
- REST API at `api.almostcrackd.ai` is used to generate captions for a given humor flavor
- Endpoints: presigned upload URL, upload image, register image URL, generate captions

## Tech Stack
- Next.js 16 with App Router, React 19, TypeScript
- Tailwind CSS 4 with dark/light/system theme support
- Supabase (PostgreSQL) with Google OAuth
- Server Actions for mutations, Server Components for data fetching
- Deployed on Vercel (production: humor-project-3-gamma.vercel.app)

## Database Tables
- `humor_flavors` — id, slug, description, created_datetime_utc
- `humor_flavor_steps` — id, humor_flavor_id, order_by, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_temperature, description, llm_system_prompt, llm_user_prompt, created_datetime_utc
- `captions` — id, content, is_public, is_featured, like_count, profile_id, image_id, humor_flavor_id, caption_request_id, llm_prompt_chain_id, created_datetime_utc
- `images` — id, url, is_common_use, created_datetime_utc
- `profiles` — id, is_superadmin, is_matrix_admin

## Completed Work (as of 2026-04-02)

### Bug Fixes
- Migrated `useFormState` (deprecated) to `useActionState` from React 19 across all form components
- Step editor now closes on successful create/update; uses `Date.now()` timestamps instead of boolean `ok` to prevent stale detection on consecutive actions
- All error boxes have dark mode styles (`dark:border-red-800 dark:bg-red-950/30 dark:text-red-200`)
- Login page uses inline error messages instead of `alert()`
- Page title updated from "Create Next App" to "Humor Prompt Chains"

### UX Improvements
- All submit buttons show loading/pending state with disabled + text change (e.g. "Saving...")
- Sidebar highlights active nav link using `usePathname()`
- Dashboard flavor rows are clickable links to edit page
- Raw UTC timestamps formatted with `lib/formatDate.ts` helper across all views
- Cancel button added to create flavor form
- Reset button uses `router.refresh()` instead of full page reload
- Technical details (IDs, raw DB columns) hidden behind collapsibles or removed
- Step form labels use human-friendly names ("Input type" not "llm_input_type_id")

### UI Redesign
- Step add/edit uses modal overlay instead of inline editor below the table
- "+ Add step" is a dashed button inside the steps table
- Full visual polish pass on flavor edit page:
  - Larger bold title, subtle delete button (text link, red on hover)
  - Cards use `rounded-xl` with focus rings on inputs
  - Steps shown as a list with numbered circles, hover-reveal actions
  - Test section uses pill-style tab buttons instead of radio inputs
  - Caption results as individual cards instead of dense table
  - Status pills for "Public"/"Featured" captions
- Sidebar: narrower, icons on nav links, filled active state, streamlined brand
- Content area uses `bg-slate-50` background so white cards float
- Modal backdrop uses `backdrop-blur-[2px]` for depth

## Key Patterns
- Forms use `useActionState` (React 19) with `isPending` for button states
- `StepActionState.ok` is a `number` (timestamp) not boolean — ensures `useEffect` fires on every success
- Shared `StepFormFields` component renders the same fields for both create and edit modals
- `lib/formatDate.ts` — shared date formatter used across all components
- `lib/auth.ts` — `requireSuperadmin()` with retry logic for profile fetch after OAuth

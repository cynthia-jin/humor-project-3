# Project 3 — Test Plan

**App:** Humor Chains (humor-project-3)  
**Flows:** Auth -> Dashboard -> Flavor CRUD -> Prompt-chain steps -> Test generation -> Caption history  
**Stack:** Next.js 16.2.1, React 19, Supabase SSR auth, external API at `api.almostcrackd.ai`

## Pre-flight

| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npm run lint` | pass |
| `npm run build` | pass |
| Signed-out smoke test 3x | pass |

## plan

Clean browser profile, `npm run dev`, open http://localhost:3000 or the next available port. Run 3x with a superadmin or matrix-admin account; use at least one uploaded image and one test-set image.

### Auth

1. Signed-out `/login` -> login card renders with "Continue with Google".
2. Visit `/dashboard`, `/flavors`, `/flavors/new`, or `/flavors/:id` while signed out -> redirects to `/login`.
3. Sign in with a superadmin or matrix-admin Google account -> lands in the app shell with sidebar, email, Dashboard, Humor Flavors, and theme selector.
4. Sign in with a non-admin account -> protected routes redirect back to `/login`.
5. Switch Light / Dark / System theme -> choice persists after refresh.

### Dashboard

6. `/dashboard` loads -> stat tiles render total humor flavors, total flavor steps, total generated captions, and average steps per flavor.
7. Empty or low-data state -> counts do not crash; average renders as `0.00` when there are no flavors.
8. Recent flavors table -> latest 5 flavors render with slug, step count, created date, and updated date.
9. Click a recent flavor row/link -> opens `/flavors/:id`.

### Flavors list

10. `/flavors` with no rows -> "No humor flavors yet" and "Create your first flavor" render.
11. `/flavors` with rows -> latest 200 flavors render with slug, description, created date, Duplicate, and Edit.
12. Hover a flavor row -> row changes to a distinct sky-tinted hover color, different from the table header.
13. Click anywhere on a flavor row -> opens `/flavors/:id`.
14. Keyboard focus row + Enter/Space -> opens `/flavors/:id`.
15. Click Duplicate or Edit inside a row -> action works without also triggering row navigation.

### Create flavor

16. `/flavors/new` loads -> slug and description form renders.
17. Submit with blank slug -> browser required-field validation blocks submit.
18. Submit valid slug/description -> inserts `humor_flavors` row and redirects to `/flavors/:id`.
19. Submit duplicate slug -> server/Supabase error appears and no duplicate row is created.
20. Click Cancel -> returns to `/flavors`.

### Edit, duplicate, delete

21. Valid `/flavors/:id` -> header, details form, prompt-chain steps, test flavor, and caption history render.
22. Invalid/non-numeric `/flavors/:id` -> 404.
23. Edit slug/description -> Save changes persists updates and redirects back to the flavor page.
24. Click Reset -> current server values reload.
25. Click Duplicate -> styled confirmation modal opens; Cancel closes it with no new row.
26. Confirm Duplicate -> creates `{slug}-copy` or next suffix, copies prompt-chain steps, redirects to the copy, and shows "Copy created and saved."
27. Click Delete flavor -> styled confirmation modal opens; Cancel closes it with no delete.
28. Confirm Delete flavor -> deletes the row and redirects to `/flavors`.

### Prompt-chain steps

29. Flavor with no steps -> empty state says no steps yet and Add step is available.
30. Click Add step -> modal opens with description, type/model IDs, temperature, system prompt, and user prompt.
31. Save valid step -> inserts a new `humor_flavor_steps` row, closes modal, refreshes list, and appends next `order_by`.
32. Save step with blank optional IDs -> stores `null` values instead of `"undefined"` or empty strings.
33. Edit step -> modal pre-populates fields; Save changes persists updates.
34. Delete step -> confirmation appears; confirm removes step and list refreshes.
35. Move first step up / last step down -> disabled or no-op.
36. Move middle step up/down -> adjacent steps swap order without duplicate `order_by` errors.

### Test flavor

37. Upload image mode with no file -> Generate captions disabled.
38. Pick unsupported image type -> local error appears before external API calls.
39. Pick PNG/JPEG/GIF/WebP -> Generate captions enables.
40. Generate with uploaded image -> progress advances presign -> upload -> register -> captions; results render newest first.
41. Switch to Test-set image -> latest common-use images load, selected preview appears, Choose image opens picker modal.
42. Search in picker -> matching image IDs filter; no-match state appears when appropriate.
43. Select a test-set image -> modal closes, preview updates, Generate captions enables.
44. Generate with test-set image -> register -> captions; results render with content, timestamp, and IDs details.
45. API failure or expired auth token -> error panel appears and loading state clears.

### Caption history

46. No generated captions -> empty state says to use the test section above.
47. Existing captions -> latest 200 render with content, thumbnail when available, date, likes, Public, and Featured badges.
48. Long caption content -> wraps without layout overflow.
49. Generate new captions -> after refresh/history reload, new captions appear under the same flavor.

### Responsive + accessibility

50. Narrow viewport -> flavor header actions wrap cleanly; table scrolls horizontally instead of overflowing page.
51. Duplicate/Delete modals -> Escape closes when not pending; overlay click closes when not pending; close button is keyboard-focusable.
52. Dark mode -> forms, modals, tables, errors, disabled states, and hover states keep readable contrast.

**Pass criteria:** all 52 green across 3 browser passes, no console errors, no React warnings, no unexpected failed network calls.

## Post-testing summary

- Ran Project 3 pre-flight checks: `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass on the final code.
- Ran signed-out protected-route smoke tests 3x: `/login` returned 200; `/dashboard`, `/flavors`, and `/flavors/new` redirected to `/login`.
- **Bug:** React 19 lint flagged synchronous state resets inside the prompt-step success effect. Fix: defer the modal reset and `router.refresh()` in [app/(app)/flavors/FlavorStepsManager.tsx](app/(app)/flavors/FlavorStepsManager.tsx).
- **Bug/UX:** Duplicate created a saved copy immediately but gave no confirmation, so it felt like an unsaved draft. Fix: added a Duplicate confirmation modal, redirects to the copy with a saved-copy banner, and keeps the label as "Duplicate" in [app/(app)/flavors/FlavorDuplicateButton.tsx](app/(app)/flavors/FlavorDuplicateButton.tsx), [app/(app)/flavors/actions.ts](app/(app)/flavors/actions.ts), and [app/(app)/flavors/[id]/page.tsx](app/(app)/flavors/[id]/page.tsx).
- **UX:** Delete used a native browser confirm while Duplicate used a styled modal. Fix: replaced delete with a matching modal and clearer irreversible-action copy in [app/(app)/flavors/FlavorDeleteButton.tsx](app/(app)/flavors/FlavorDeleteButton.tsx).
- **UX:** Flavors list required clicking the slug only. Fix: made the whole table row clickable and keyboard-accessible while preserving Duplicate/Edit buttons in [app/(app)/flavors/FlavorTable.tsx](app/(app)/flavors/FlavorTable.tsx).
- **UX:** Row hover matched the table header color, making rows feel less interactive. Fix: changed row hover/focus to a distinct sky tint in [app/(app)/flavors/FlavorTable.tsx](app/(app)/flavors/FlavorTable.tsx).
- **Validation:** Upload accepted `image/*`, allowing unsupported formats to fail late. Fix: restricted upload to PNG/JPEG/GIF/WebP and added immediate local errors in [app/(app)/flavors/FlavorTestForm.tsx](app/(app)/flavors/FlavorTestForm.tsx).


# Patient Management Dashboard | UI/UX Design

Version: 2.0 · Date: 2026-11-11 · Status: S01–S06 implemented; desktop/360px, keyboard, and Chromium lifecycle checks passed. This is not a full browser compatibility certification.

Based on [Product Requirements v2.0](product-requirements.md) and [Technical Implementation v2.0](technical-implementation.md). This version prioritizes the core experience and an explainable implementation, replacing the complex workflows and exhaustive artboard acceptance requirements in v1.1.

The existing [Figma design](https://www.figma.com/design/1vM6MjteCBpWHdB65YBWWf/Untitled?node-id=2-2) is a visual reference. During S03 on 2026-11-12, the workspace `2:2`, details `2:2577`, and creation `2:2641` nodes were read without modifying the design. S03–S06 implemented and browser-verified the list, details, creation, search/filtering, pagination, editing, and unsaved-change confirmation. Where the reference conflicts with this version on status counts, sorting, post-save destinations, or exit flows, follow this document; completing every artboard first is unnecessary.

## 1. Page structure

There is one workspace at `/`, with no routing library, fake navigation, or KPI cards. The header reads Patient workspace and displays Demo · Synthetic data.

```text
Patient workspace                         Demo · Synthetic data

Patients                                      [+ Add patient]
Manage patient information.

[Search by name…                                      ×]
[All] [Inquiry] [Onboarding] [Active] [Churned]

Name                 Date of birth       Status       Address
Maya Anne Adams      Jan 15, 1990         Active       Boston, MA  [View]
Noah Bennett         Mar 22, 1988         Inquiry      Denver, CO  [View]

23 results                           [Previous] 1 / 2 [Next]
```

Numbers illustrate the layout and represent the total under current filters. Remove status badge counts, the unfiltered total, and sortable header arrows. Sort by last name, first name, and ID ascending. A short Sorted by last name note is sufficient.

## 2. List and search

- The name is the primary detail action; an end-of-row View details action may supplement it. Avoid complex whole-row click behavior.
- Desktop shows name, DOB, status, and City/ST. Complete addresses and separate name fields appear in details.
- Status uses both text and color. Filter buttons use aria-pressed rather than pretending to be tabs that switch panels.
- Label search Search patients by name, with Search by name… as the placeholder. Use one keyword for substring matching within individual name fields, without multi-token or fuzzy correction hints.
- Query 300ms after typing stops. Search/status changes return to page 1; a status change uses the current search input.
- Show Loading patients… or a lightweight skeleton while debouncing or requesting. Disable pagination and do not present old-filter results as current results. Complex cache animations are unnecessary.
- Disable Previous/Next according to page position. Page size is fixed at 20, with no page-size or sorting selector.
- Without filters, an empty database shows No patients yet and Add patient. With filters, show No matching patients and Clear filters.
- For a page beyond the result range, show No patients on this page and Back to first page. Avoid reversed result ranges or repeated page synchronization.

## 3. Details and forms

Use a right-side panel approximately 560px wide on desktop and the full available width on small screens. A local Sheet wraps Radix Dialog. The body scrolls while the title and actions remain clearly visible.

Details show first, middle, and last names, DOB, status, and the complete address. Missing middle names display Not provided; omit an empty second address line. Long names and addresses wrap rather than relying only on tooltips. Provide Edit patient at the bottom.

Creation and editing share one form grouped into PERSONAL INFORMATION, PATIENT STATUS, and ADDRESS. Show Middle name and address line 2 are optional. at the top. Give every field an independent label rather than relying on placeholders.

| Group | Controls |
|---|---|
| Names | Separate text input rows for First / Middle / Last |
| Date of birth | Native date input supporting direct entry; 1000-01-01 through the current UTC date |
| Status | Select with four statuses; creation defaults to Inquiry |
| Address | Separate line 1 and line 2 rows; City and State may sit together, stacking on mobile |
| ZIP and country | Text input for ZIP; read-only United States for Country |

Do not provide a date picker requiring month-by-month navigation across decades, an age field, address autocomplete, or a multi-step wizard. State uses the existing 50-state and D.C. constants.

Do not show errors on initial opening. Validate on submission and focus the first invalid field; displayed errors update as the user edits. Map backend fieldErrors to the same fields. Place request-level errors above the form, and retain all input after save failure.

## 4. Saving and exiting

| Scenario | Behavior |
|---|---|
| Before saving | Save patient / Save changes, Cancel |
| Saving | Saving…; prevent duplicate submission, field editing, and all exit actions |
| Creation succeeds | Switch to the new patient's details and show Patient added; refresh the list and return to page 1 |
| Editing succeeds | Switch to updated details and show Changes saved; refresh the current list page |
| Save fails | Keep the form and input, show an error, allow correction or retry |
| Save result uncertain | We couldn’t confirm the save. Check the patient list before trying again.; no automatic resubmission |
| Save succeeds but list refresh fails | Keep saved content visible in details; show Patient saved, but the list couldn’t refresh. and Retry list |

Both creation and editing open details immediately after success. No View patient notification button, persistent notification state, or current-filter mismatch detection is needed. Closing details returns to the original search/status conditions. A new record may not appear in those results as a natural consequence of retaining filters.

Cancel, close, and Escape all close the entire panel. Clicking the form backdrop does not close it; the detail backdrop may. Use the same confirmation dialog for all unsaved exits:

- Title: Discard changes? Description: Your unsaved changes will be lost.
- Focus Keep editing by default; return to the form with input retained.
- Discard changes closes the panel and returns to the list.

Do not distinguish cancel-to-details from close-to-list, maintain PendingExit, or implement browser refresh/close warnings. Saving may be disabled when an edit is unchanged; the API must still accept complete, unchanged data.

## 5. Loading, failures, and focus

| Situation | Feedback and recovery |
|---|---|
| List loading | Set aria-busy on the list area and show loading feedback |
| List read failure | Couldn’t load patients. + Retry |
| Details loading | Show Loading patient… in the panel, not an empty form |
| Detail read failure | Couldn’t load this patient. + Retry / Close |
| Missing record | Patient not found. + Close |
| Required/format error | Clear errors below fields, with aria-invalid and associated descriptions |

Focus First name on creation, and the heading or close button for details. Reuse the component library's focus trap and restoration. If the original list row is no longer visible, restore focus to Add patient. Closing confirmation returns focus to the form. Icon-only controls have accessible names; actions must not depend only on color or hover.

## 6. Visual design and responsiveness

Retain a light background, white surfaces, dark text, and teal primary actions. Suggested colors: background #F8FAFC, text #0F172A, secondary text #475569, border #CBD5E1, primary #0F766E, focus #2563EB, and error #B91C1C.

| Status | Background / text |
|---|---|
| Inquiry | #F1F5F9 / #475569 |
| Onboarding | #EFF6FF / #1D4ED8 |
| Active | #ECFDF5 / #047857 |
| Churned | #FFF7ED / #9A3412 |

- Use system sans-serif without external fonts. Body/input text is approximately 16px, helper text 14px, and page headings 28–32px.
- Main content has a maximum width around 1280px, with 24–32px desktop padding and 16px on small screens. Buttons and inputs are approximately 44px high.
- Avoid card shadows on every row. Lightweight panel animation respects prefers-reduced-motion.
- Show the complete table on wide screens. Below 768px, hide DOB and address while retaining name, status, and view actions; details provide all data. Do not create separate PatientCards or mobile sorting logic.
- Mobile forms use one scrollable column. Actions do not cover fields, pagination does not overflow, and long names do not displace the view action.
- Target 4.5:1 contrast for normal text and visible focus. Use accessible library defaults rather than writing a focus trap manually.

## 7. Verification and design tradeoffs

One desktop and 360px browser check covers creation, details, editing, long content, empty fields, no search matches, loading, and failure feedback. Repeat core actions with the keyboard. Verify the actual application; an artboard's existence is not proof of working interactions.

The old D01–D08 items are no longer separate acceptance tasks. Retain unsaved-change confirmation, unobstructed actions, long-content support, and small-screen usability. Remove separate exit destinations, global totals, filter-mismatch artboards, and full-breakpoint screenshot requirements. Reproducing all 26 artboards frame by frame is unnecessary. README can explain necessary differences between the prototype and final implementation.

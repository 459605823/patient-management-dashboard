# Patient Management Dashboard | Product Requirements

Version: 2.0 · Date: 2026-11-11 · Status: S01–S06 implemented; local tests and browser acceptance checks completed on 2026-11-12. See README for verification scope.

This project prioritizes a complete create-and-view workflow, clear UI/UX, and code the candidate can explain. This document replaces the scope and acceptance criteria in v1.0; the accompanying technical design, UI/UX design, and implementation plan also use v2.0. Rules not specified in the original assignment are project assumptions.

## 1. Assignment and delivery scope

The assignment explicitly requires recording first/middle/last names, date of birth, one of four statuses, and an address; viewing the information after entry; a frontend that calls backend APIs; and a database used by the backend for persistence.

| Area | Deliverable |
|---|---|
| Core workflow | Create patients, browse the list, view complete details, and retain data after refresh |
| Practical additions | Edit information and status, simple name search, a single status filter, and server-side pagination with 20 records per page |
| Essential quality | Client/server validation, submission feedback, input retention after failure, basic unsaved-change confirmation, keyboard usability, and small-screen support |
| Delivery materials | Source code, reproducible startup instructions, synthetic examples, key tests, and known limitations |

This is the complete required scope; the old P0 checklist no longer applies. Implement creation and viewing first, then editing and search, and finally polish the experience.

Out of scope: configurable sorting, status count badges, a global patient total, URL synchronization, detail deep links, a separate mobile card system, browser leave warnings, complex cache coordination, concurrent editing conflict handling, and performance benchmark reports. Authentication, multi-tenancy, deletion, appointments, medical records, billing, insurance, uploads, bulk operations, import/export, and AI features are also excluded. Public deployment, automated accessibility scans, and additional browser verification may be considered after required delivery.

## 2. Assumptions

- One clinic and one operator role, using synthetic data only; English UI and development documentation.
- Addresses support the 50 US states and Washington, D.C. Country is fixed to US; no address validation or autocomplete service.
- First name, last name, DOB, status, and primary address fields are required. Middle name and address line 2 are optional.
- The default status is Inquiry. All four statuses can transition freely, with changes saved only through the edit form.
- Patients may share the same name and DOB; an independent ID identifies each patient. Churned does not mean deleted.
- DOB ranges from 1000-01-01 through the current UTC date, matching the supported MySQL DATE range. This is a storage convention, not a medical age rule.
- The application targets a few hundred demonstration records. Pagination does not cap the total database population; large-scale search performance is not guaranteed.
- Concurrent editing conflicts are not handled. The last successful complete-form update overwrites previous values.

## 3. Field rules

| Field | Required | Rules |
|---|---|---|
| First / Last name | Yes | 1–100 Unicode code points after trimming; preserve case, internal spaces, and valid name characters |
| Middle name | No | At most 100 code points; blank or omitted values normalize to null |
| Date of birth | Yes | YYYY-MM-DD, a real calendar date from 1000-01-01 through the current UTC date |
| Status | Yes | Inquiry / Onboarding / Active / Churned |
| Address line 1 | Yes | 1–200 code points after trimming |
| Address line 2 | No | At most 200 code points; blank or omitted values normalize to null |
| City | Yes | 1–100 code points after trimming |
| State / District | Yes | Two-letter code for a US state or D.C. |
| ZIP code | Yes | String containing five digits or ZIP+4; preserve leading zeros such as 02108 |
| Country | Fixed | US |

The backend manages id, createdAt, and updatedAt; clients cannot specify them. DOB is a calendar date, not an instant, and must not shift by a day during display. Names are not restricted to English letters and are not automatically capitalized.

## 4. User workflows

### 4.1 Browse and find patients

1. Open the single workspace. The list shows name, DOB, status, City/ST, and a view action.
2. Sort by last name → first name → ID in ascending order, with no sorting controls.
3. Search requests run 300ms after typing stops. Trim the input and accept at most 100 Unicode code points. Treat the complete input as one keyword and match a case-insensitive substring in any first, middle, or last name field.
4. For example, `mar` can match Mary and `smith` can match Smith. `smith mary` is not guaranteed to match Mary Smith. Do not tokenize, normalize full-width characters, or offer fuzzy corrections.
5. Status filtering offers All and the four statuses, combined with search. Do not show status counts or the unfiltered database total.
6. Use Previous/Next with 20 records per page. Show only the total for the current filters. Search or status changes return to page 1. Search covers the entire database rather than filtering the current page locally.
7. Select a name or View details to open complete patient information.

Show a loading state when query conditions change; do not present results from the previous conditions as new results. Offer Clear filters when there are no matches, or Add patient when there are no filters and no patients. An out-of-range page returns no rows and offers Back to first page. Do not automatically clamp pages on the backend or create a frontend synchronization loop.

### 4.2 Create and edit

- Add patient opens an empty form with Inquiry selected. Edit patient in the detail view reuses the form with existing data.
- Validate on submission in the frontend and independently in the backend. Show errors near fields and retain input.
- Show Saving… during submission; prevent duplicate submissions, field edits, and form closure.
- Both creation and editing submit complete fields; do not calculate a differential PATCH.
- After creation or editing, display the patient details returned by the backend and show Patient added / Changes saved while refreshing the list. Creation returns to page 1; editing preserves the current page.
- Retain search and status conditions after success. Even if the saved patient does not match them, the detail view shows the saved result. Do not add filter-matching logic, special notifications, or a persistent View patient prompt.
- Keep the form after a failed save. Report a failed list refresh separately after a successful save, and retry reads only rather than submitting another write.
- Never retry writes automatically. If a network failure leaves the outcome uncertain, ask the user to check the list first to avoid duplicate creation.

### 4.3 Exit and unsaved changes

Cancel, the close button, and Escape all close the panel and return to the list. Clicking the form backdrop does not close it, reducing accidental dismissal. The detail backdrop may close the panel.

If the form has changes, show Discard changes? before closing. Keep editing retains input; Discard changes closes the panel. There is no need to track different exit destinations. Prevent exit while saving. Draft protection on browser refresh or tab closure is outside this version's commitment.

## 5. Experience requirements

- Desktop is the primary context. Keep the list clear and Add patient prominent; do not add empty menus, KPIs, or decorative business modules.
- Use the same table on small screens, retaining name, status, and view actions. DOB and address columns may be hidden; complete information remains accessible in details. Use a single-column form without separate mobile sorting or card logic.
- Creation, viewing, and editing must work on desktop and at 360px width. Long content wraps and the form scrolls.
- Reuse library-provided dialog semantics, focus trapping, and restoration. Fields have labels, associated errors, and visible focus. Status must not rely on color alone.
- Provide loading, empty results, read failure/retry, save failure, and success feedback. Do not expose technical errors, SQL, stack traces, or secrets to users.

## 6. Acceptance criteria

v2.0 uses A01–A08 in place of AC01–AC16. Previous verification records remain historical evidence, not proof that the new criteria have passed.

| ID | Observable result | Preferred verification |
|---|---|---|
| A01 | Creation shows complete details and persists after refresh; optional fields may be empty, ZIP leading zeros and DOB remain unchanged | Real MySQL API tests + browser lifecycle test |
| A02 | The backend independently validates required fields, enums, dates, and unknown fields; invalid data is not stored | Shared unit tests + API rejection cases |
| A03 | Edited names, address, and status match details and subsequent reads; submitting unchanged values also succeeds | API tests + lifecycle test |
| A04 | Simple name search and status filtering cover the full database, with at most 20 rows per page, fixed ordering, and recoverable empty results | API fixtures spanning multiple pages + UI checks |
| A05 | Saving prevents duplicate submissions; failures retain input; save success and subsequent refresh failure have separate feedback | Targeted form tests or network failure checks |
| A06 | Leaving a modified form requires confirmation; continuing editing preserves content; all exit controls share a destination | Component tests or manual checks |
| A07 | Core workflows work on desktop and at 360px; long content, keyboard controls, labels, and focus are usable | One browser layout and keyboard check |
| A08 | README instructions start the database, initialize tables, seed examples, run the app and tests; builds pass and code contains no credentials | Local reproduction and verification commands |

Do not duplicate every criterion at every testing layer or impose a test-count target. Record the browser actually checked; a complete Chrome/Edge/Safari matrix is not required.

## 7. Demonstration and explanation

Suggested demo: create an Inquiry patient → view complete details → edit to Onboarding → search and filter → refresh to confirm persistence → show a validation error.

Explain core assumptions, data flow, table structure, backend validation, parameterized SQL, date handling, and refresh after saving. Do not promise production features that have not been implemented.

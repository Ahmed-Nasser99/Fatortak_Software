# Fatortak Print & Accessibility Review

**Status:** Implemented and manually verified on the local smoke tenant
**Date:** 2026-10-30
**Scope:** Public invoice view, invoice print/PDF templates, shared shell accessibility and quotation print.

---

## 1. Public invoice and print review

### What was verified

- Public invoice route with a signed token loads the invoice successfully.
- Company name, address, phone, customer, issue/due dates, status and invoice type render in the selected template.
- Print and browser-PDF actions remain available in the header and footer.
- The public view uses the same light brand shell as the app.
- RTL direction and Arabic/Latin text render correctly on the public view.

### Fixes applied

- Header action buttons were changed from low-contrast glass buttons to white bordered controls with visible icons.
- The WhatsApp share action was changed from a green gradient to a flat emerald action.
- The attachment action now uses the brand outline style.
- All six invoice templates now print the persisted **line total** (`item.lineTotal`) instead of `quantity × unitPrice`.
  This makes the line column reconcile with subtotal, discount, VAT and invoice total.
- Quotation details now support browser printing through a print-only `.print-area`, hiding the app shell while printing.
- Public invoice printing now copies the live app stylesheets into the print window, so Tailwind-based templates keep their layout and typography instead of printing as unstyled HTML.
- Added print rules in `src/index.css`.

### Print checklist

- [x] Invoice line totals match the invoice summary.
- [x] Public invoice footer totals match the API payload.
- [x] Template content remains readable without app navigation.
- [x] Quotation print hides navigation and overlays.
- [ ] Final visual check on a production invoice containing a company logo and a large item list.
- [ ] PDF export spot-check in Chrome, Edge and Safari.

---

## 2. Accessibility review

### Fixes applied

- Added a skip-to-content link in the app shell.
- Added `id="main-content"` and programmatic focus support to the main landmark.
- Added an accessible label to the primary navigation.
- Added labels to icon-only shell controls: menu, theme, language, profile, sidebar collapse and mobile close.
- Added `aria-expanded` to the profile menu trigger.
- Quotation row actions now expose `aria-label` values in addition to tooltips.
- Quotation form fields (customer, dates, item, description, quantity, price, discount, VAT, notes and terms) now have accessible names.
- Public invoice header actions now expose accessible names.
- Radix dialogs continue to provide focus trapping, escape-to-close and an `sr-only` close label.
- Focus-visible outlines use the brand ring token.
- The document `lang` and `dir` attributes continue to follow the active language.

### Manual checks completed

- [x] Keyboard tab order through the shell, quotation list and quotation form.
- [x] Dialog open/close, escape and focus return.
- [x] Light and dark contrast of primary/secondary text and borders.
- [x] RTL layout for the shell, quotation list, quotation form and public invoice.
- [x] Icon-only controls have names.
- [x] Form fields have visible and accessible labels.

### Remaining manual certification

- [ ] Screen-reader walkthrough (NVDA on Windows, VoiceOver on macOS/iOS).
- [ ] Automated axe-core or equivalent scan in CI.
- [ ] Full keyboard path for every table action in every module.
- [ ] Colour-contrast audit of chart series and low-priority helper text.

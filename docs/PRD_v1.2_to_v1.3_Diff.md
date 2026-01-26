# Differences Between PRD v1.2 and PRD v1.3

This document lists every change required to update your existing audit page implementation from PRD v1.2 to PRD v1.3.

---

## 1. Persistent Short Description Added (New Requirement)
- A short service description (Option C‑1) is now **required on every wizard step (1–8)**.
- This block appears ABOVE each step’s content.
- Step 1 additionally contains the **full multi-paragraph intro** from the Excel file.

---

## 2. All Step Titles, Prompts, and Text Updated to EXACT Excel Wording
Every screen’s content MUST exactly match **Audit_Online_Order.md**:
- Step titles  
- Section headings  
- All explanatory text  
- Questions/prompts  
- Helper text  
- Notes (e.g., “If we have applicant information from Temmy…”)

---

## 3. Button Labels Updated
Your draft implementation likely uses generic wording.  
v1.3 requires the **exact text** from the Excel:

Examples:
- “Begin Audit”
- “Search on Temmy”
- “Skip to Billing Information”
- “Review My Order”
- “Continue” (various steps)
- “Go Back”

---

## 4. Jurisdiction, Trademark Type, and Social Media Label Text Updated
All checkbox/radio labels must match the Excel document exactly.

---

## 5. Intro Block Handling Changed
v1.3 explicitly requires:
- Full intro block shown **only on Step 1**
- Short persistent description on Steps 1–8
- No intro block on Summary or Confirmation pages

---

## 6. Summary Page Text Updated
The summary now uses the exact table headings and wording from Tab 9.

---

## 7. Confirmation Page Updated
The thank‑you text must match Tab 10 exactly.

---

## 8. No Structural Changes to Endpoint or Wizard Mechanics
The only changes relate to:
- UI text
- Required blocks
- Step content definitions

---

## 9. Developer Impact Summary
### Required updates in your current draft:
- Replace all headings/prompts with Excel wording
- Insert persistent short description at top of all steps
- Insert Step 1 full intro block
- Update all button labels
- Update summary page layout to match Tab 9
- Update confirmation text
- Validate jurisdictions, social add‑ons, and TM type labels match exactly
- Ensure no copy differs from Excel, even slightly

---


# TMH / CML – Goals, Priorities and Current State

## 0. Overall Goal

Primary objective for TMH (and CML):  
Increase cash generation by prioritising the work that most effectively drives revenue, while accepting that “doing things right” takes time and there is a lot to do.

---

## 1. Renewals

### 1.1 Current Status

- Very happy with the renewals system:
  - Looks good and should run smoothly.
  - Will likely need tweaks as it is deployed.
- At minimum:
  - Prompts contact and helps prospects confirm TMH is legitimate (via calls, appointments, emails).
- At best:
  - Generates paid renewal orders.

### 1.2 Improvements Needed

#### 1a. Temmy Link

- Question: When prospects are loaded into Zoho **Leads**, can we see “Temmy Prospect Lead Info” via read-only access?
  - Fields of interest: `TME1–5`, `TMU1–5`, `LeadScore`, `Number of Trademarks`, etc.
  - Excel exports are created daily.
- If it is possible to **link all Temmy Prospects to Temmy for updates**, this would be helpful (i.e., Temmy acting as the data source for updates).

#### 1b. Temmy Imports

- If the above Temmy fields are visible and linkable, Temmy exports may not be needed.
- Currently we only care about the following Temmy segments:
  - `RE1` – expiring in 1 month
  - `RW1` – expiring in 1 week
  - `EW1` – expired 1 week
  - `EX2` – expired 2 months
  - `EX5` – expired 5 months

---

## 2. Cognism

There are two main strands:

### 2.1 Cognism Matching (Current Split)

1. **2a. Manual Searches (Suntec)**

   - Suntec manually searches Cognism using:
     - `LinkedinURL`
     - Phone number
     - Email
   - Matching via Cognism API on a one-by-one/manual basis.

2. **2b. API Integration (Automation)**
   - Work in progress with Cognism API team.
   - Aim: Get more positive matches by:
     - Searching brand name and company name.
   - Frustration:
     - In Temmy we already have director contacts for each company.
     - We have searched against company names, but **not** against brand names.
   - Many possible ways to search Cognism, but:
     - When we do match, companies are often very large, which complicates targeting.

### 2.2 Open Questions and Concerns

- Maybe we should search in a different way:
  - For example, search websites via Google, find the correct company, then use that company record rather than Temmy’s matched company name.
- Risk:
  - This could become a rabbit hole and a mess.
  - High risk of burning a lot of dev time without a clear, repeatable method.

### 2.3 Proposed Approach

- Because of the complexity and uncertainty:
  - Consider **shelving the Cognism API automation** for now.
  - Focus on:
    - **2a** – manual searches only (via Suntec) until we find a reliable, repeatable process.
- Rationale:
  - Developer time is valuable; better to wait until there is a proven workflow before automating via API.

---

## 3. TMH Clients and Data Matching

### 3.1 Current State

- All trademarks have now been imported into the system.
- Issue:
  - We have had to create accounts for many clients where we know accounts already exist (e.g., in Xero, TMH systems, etc.).
- Example:
  - A query was raised for one client where:
    - The word mark text did not appear in a search against Xero.
    - Trademark names and accounts were there, but not matched as expected.

### 3.2 Need vs. Practicality

- We need to:
  - Identify which trademarks are:
    - Still active
    - No longer active (dead / expired)
  - Match them to:
    - Xero
    - `TM_Clients`
    - `TM_Leads`
    - Zoho Contacts
    - Zoho Leads
    - Zoho Accounts
    - Zoho Deals
- Problem:
  - Not clear how to do this efficiently **without**:
    - Manually searching spreadsheets
    - Manually inputting data
- Concern:
  - We cannot afford to lose “weeks” on matching data.

### 3.3 Why This Matters

We need better insight so we can automate outreach and maximise opportunities:

- Potential scenarios:
  - Clients whose marks have expired and do not realise.
  - Clients who have filed new trademarks but do not realise we are still their representative.
  - Clients we are missing completely for upsell, renewals, or monitoring.
  - Clients who:
    - Tried to start a business and failed, returned to employment (low value for ongoing contact).
    - No longer wish to work with us.

Without better data, we:

- Risk missing revenue.
- May waste time contacting people who are no longer relevant.

### 3.4 Temmy Link and Automation

#### 3a. Temmy Link for Trademark Module

- Logical step: link Trademark Module to Temmy.
  - Use Temmy as the source of truth for trademark status updates.
- Reason:
  - Many historic trademarks currently show as “registered” but could be dead.
- If we connect to Temmy:
  - We can pull **all trademarks** relating to every client we have ever serviced.

#### 3b. Automation Using Correct Temmy Data

- With up-to-date Temmy data for existing clients, we can automate around:
  - Any trademark updates.
  - Any Companies House changes.

#### 3c. Cognism Data Enrichment (Lower Priority)

- Not a top priority right now.
- Future vision:
  - All clients linked to Cognism API.
  - Able to:
    - Get alerts on changes (e.g., growth, funding, etc.).
    - Access enriched data such as:
      - Turnover
      - Headcount
      - Other useful firmographics.

---

## 4. Cognism Renewal Decision

- Deadline: **Must decide by 1st December** whether to renew Cognism.

### 4.1 If We Renew

- We can:
  - Roll **32,000 unused credits** into next year.
  - Re-up with another **40,000 credits**.
  - This is considered a “fair deal.”

### 4.2 If We Do Not Renew

- We:
  - Lose the 32,000 unused credits.
  - Can re-order Cognism later when we have more capacity to use it properly.
  - Will still be able to keep **one Cognism license** for manual searching:
    - But **no API access**
    - No bulk credits.

### 4.3 Likely Direction

- Probably will have to take the risk and renew.
- Note: 12 months have passed very quickly without fully leveraging Cognism.

---

## 5. Temmy Platform

### 5.1 Reality Check

- In an ideal world:
  - All of this (UKIPO data, Companies House, Cognism) would operate more easily inside Temmy.
- Constraint:
  - Temmy is too expensive to develop further at this stage.

### 5.2 Possible Alternative

- India team (Suntec/Technoscore) could:
  - Build something equivalent.
  - Potentially run the **FTP from UKIPO** directly into Braudit.
  - Do the Companies House integrations.
  - Do Cognism integrations at their end.
- This would be another change, but could reduce dependency on Temmy and high-cost development.

---

## 6. Speed and Resourcing

### 6.1 India (Suntec / Technoscore)

- Pros:
  - Work fast.
  - Have lots of resource.
  - Affordable.

### 6.2 Initforthe

- Pros:
  - Build robust, reliable systems.
- Cons:
  - Expensive.
  - Have wasted developer time previously due to not fully understanding requirements.

### 6.3 Additional Support (Fiverr / Suntec)

- Saad has discussed getting additional help from Fiverr.
- It is also likely that:
  - Alex could get support from Suntec for:
    - Writing code.
    - Testing.
    - Other development tasks.

---

## 7. Planning and Meeting Request

- Request:
  - Make some time **this afternoon** to:
    - Talk through all of the above.
    - Map out:
      - A plan
      - Timelines
      - Priorities.
- Reference document:
  - Google Doc created to assist:  
    <https://docs.google.com/document/d/1g3aXZTOtKcEKoElKMcaMvRthF4NktT8KkauHY1w89gI/edit?tab=t.0#heading=h.frgqlfunxdaz>

---

## 8. Orders That Take the Longest (Key Time Savers)

These are the orders that take the longest and where improvements would save the team the most time:

1. **Audits**

   - Need:
     - Faster “classes and terms” selection.
     - Validation rules so staff do not miss things when loading data.

2. **UK Trademark Orders**
   - Need:
     - An online application process to:
       - Improve web conversions.
       - Streamline order capture.

---

## 9. Invoicing and Pricing Requirements

### 9.1 Invoice Generation

- For both Audits and UK Trademark Orders:
  - We want the **same invoice generation** logic already built for renewals.

### 9.2 Flexibility for Staff Discounts

- Requirements:
  - Staff must be able to apply **different discounts** depending on:
    - How the client orders.
    - Payment schedule (upfront vs instalments).
- Two distinct flows:

#### 9.2.1 Online Orders (Self-Service)

- Simple, fixed offer:
  - Client wants to order a trademark.
  - They complete the process online.
  - They get:
    - A straightforward invoice.
    - An online discount.
- If they want to:
  - Spread payment over 6 or 12 months:
    - They must speak to sales anyway.
    - Need to verify them via a booked appointment.

#### 9.2.2 Sales Orders (Over Phone / Teams)

- Here we sell **packages**, not just one-off trademarks:

  - Monitoring + Trademark combined.
  - Example:
    - 12 months of Essentials Monitoring at £49 per month.
    - £250 setup fee.
    - Discounts depending on how they choose to pay.

- Why fixed pricing with discounts:
  - Base prices are fixed.
  - Staff can then apply discounts in a controlled way to win business.
  - Needs to be fluid when sold by humans, but structured enough for automation.

---

## 10. Example UK Trademark Pricing Structure

Reference pricing spreadsheet:  
<https://thetrademarkhelpline-my.sharepoint.com/:x:/p/jon/IQDEX0KEMYRVRJDGvs7TlLx4Ac24s7jq0DdN4QZHq6j2Vzg?e=KGq3lA>  
(also referenced here: <https://thetrademarkhelpline-my.sharepoint.com/:x:/p/jon/IQDEX0KEMYRVRJDGvs7TlLx4Ac24s7jq0DdN4QZHq6j2Vzg?e=DEhkQ9>)

### 10.1 Items in a Typical UK Trademark Package

- UKIPO Application fee: **£170**
- UKIPO Classification fee: **£50**
- TMH Application fee: **£399**
- TMH Monitoring setup: **£250**
- Monthly Monitoring:
  - **£49 per month**
  - **12 months free** included (worth **£588**)

### 10.2 Discounts Based on Payment Method

- Payment Discount:
  - **30%** if paying up front.
  - **15%** if paying over 6 months.
  - **0%** if paying over 12 months.

### 10.3 Example Totals and Discounts

- Total Payable (headline): **£1,326**
- Resulting discount levels:
  - Up-front: **61%**
  - 6 months: **53%**
  - 12 months: **44%**

### 10.4 Edge Case: No Monitoring

- As an absolute last resort:
  - We can do without monitoring (item at the bottom of the pricing).
  - However, the primary sales model assumes monitoring is included.

---

## 11. Key Design Principles for Pricing and Invoicing

- Online:
  - Fixed rules and fixed discounts.
  - Simple and fast for the client.
- Sales-led (phone/Teams):
  - Package-based.
  - Flexible discounts within a structured framework.
  - Staff must be able to:
    - Apply additional discounts where needed.
    - Still stay within a coherent pricing model.

---

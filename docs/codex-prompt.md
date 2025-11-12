Let's add the payment polling routine now.

Statuses (lowercase from API)
•	paid
•	pending
•	voided
•	not_found
•	failed

Polling behavior
•	Start polling immediately after opening the checkout tab.
•	Cadence with backoff:
•	0–30s → every 2s
•	30s–2m → every 5s
•	2–10m → every 10s
•	Total timeout: 10 minutes (configurable).
•	Make comparisons case-insensitive.

Mid-flight UX
•	If still pending after 2 minutes, show a non-blocking banner indicating you’re waiting for payment to complete in the other tab and that the page will update automatically.

Terminal-state handling
On each poll, interpret the response and stop polling for terminal states:
1.	paid
•	Immediately navigate to the existing confirmation flow/page for this session.
•	Do not show intermediate banners.
2.	voided
•	Show concise error copy: “This invoice was cancelled.”
•	Present actions:
•	Go back to the offer
•	Contact support
3.	not_found
•	Show concise error copy: “This payment link is no longer available.”
•	Present actions:
•	Go back to the offer
•	Contact support
4.	failed
•	Show concise error copy: “Payment was not completed.”
•	Present actions:
•	Reopen the payment page (same session)
•	“I completed the payment” (trigger a one-time immediate recheck)
•	Contact support

Timeout handling
•	If no terminal status within 10 minutes, stop polling and treat as inconclusive.
•	Show warning: “We didn’t detect a completed payment.”
•	Present the same actions as for failed (reopen payment, one-off recheck, contact support).

One-off recheck action
•	Performs a single immediate status fetch.
•	If paid → proceed to confirmation.
•	If failed/voided/not_found → show the respective terminal message.
•	If still pending → resume polling with the current backoff window (unless already timed out).

Clean-up
•	Ensure timers are cleared on unmount/route change and that multiple polling loops cannot overlap.
•	Avoid redundant requests on rapid state changes.

Acceptance criteria
•	Clear, action-oriented UI for each terminal outcome (paid, voided, not_found, failed, timeout).
•	Polling cadence and timeout exactly as specified.
•	No infinite loops, no orphaned timers, no duplicate requests.
•	Works with existing messaging, navigation, and action mechanisms already present in the codebase.
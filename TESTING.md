# Native verification checklist

**Status: NOT RUN in this workspace.** There is no shell, Metro, simulator, or native screenshot tool here. Source inspection is not a substitute for the checks below. Do not mark this app production-ready based on the source handoff alone.

## Toolchain gate

- [ ] Use an Expo Go client compatible with the project's SDK (see README).
- [ ] `npm install`
- [ ] `npx expo install --fix`
- [ ] `npx expo-doctor` — resolve issues rather than ignoring them.
- [ ] `npm run typecheck`
- [ ] `npm test -- --runInBand`
- [ ] `npx expo start --go --clear`
- [ ] Open on a physical Android phone and iPhone, if available.

Unit tests supplied cover phone normalization, quote totals, coordinate validation, route start/end/clamping, mock OTP verification/expiry and selected pickup preservation. They do not test native navigation, map loading, payments end-to-end, layout or OS sharing. No pass count is claimed.

## Authentication

- [ ] Welcome and Phone work without website assets or a webview.
- [ ] Reject a short/invalid number; accept local and +234 forms.
- [ ] Sending a code displays a loading state and clearly says no SMS was sent.
- [ ] Wrong code shows an error without signing in.
- [ ] `123456` verifies and removes guest screens from the back stack.
- [ ] Resend is disabled during cooldown; it resets the challenge after expiry/reload.
- [ ] Restart after login restores the local session.
- [ ] Sign out returns to Welcome. Other local data is retained as disclosed.

## Customer flow

- [ ] Home shows six service cards and sample-area disclosure.
- [ ] Verify every service including Engine trouble and Car lockout opens its own details.
- [ ] Blank vehicle or pickup label cannot proceed.
- [ ] GPS permission granted updates the pin and marks it as device location.
- [ ] Permission denied/GPS unavailable has a usable error and manual fallback.
- [ ] Manual invalid coordinates are rejected; valid coordinates move the pin.
- [ ] Editing the address alone does not pretend to geocode it.
- [ ] Quote totals equal base + dispatch and are shown in ₦.
- [ ] Cannot confirm dispatch without acknowledging simulation.
- [ ] Rapid repeated confirmation does not create duplicate active requests.
- [ ] Provider moves toward the selected pickup, ETA decreases and labels remain simulated.
- [ ] Do not interpret the route as road routing or the example ETA as elapsed time.
- [ ] Arrival enables demo completion/payment after approximately 65 foreground/online seconds.
- [ ] Back to Home exposes the existing active request rather than losing it.
- [ ] Cancel confirmation changes only the active request and does not create a receipt.
- [ ] Calls without configured test numbers display a safe explanation.
- [ ] With a consenting test number configured, Call opens dialler after confirmation.
- [ ] WhatsApp opens a message addressed to the configured test number, marked TEST.

## Payments, receipts, history

Repeat with a new request for all three methods.
- [ ] Transfer shows a non-bank demo account identifier and no real transfer instructions.
- [ ] Card collects no sensitive data and invokes no payment processor.
- [ ] Cash records only a simulated local confirmation.
- [ ] Payment cannot complete before provider arrival or after request cancellation.
- [ ] Double-tapping does not duplicate payment/completion.
- [ ] Receipt is labelled demo / not proof of payment.
- [ ] Stars and optional feedback save and survive restart.
- [ ] Shared receipt includes the simulation disclaimer, correct request, date and amount.
- [ ] History filters distinguish active, completed and cancelled requests.

## Safety / SOS — use consenting contacts only

- [ ] SOS from Welcome is usable without login.
- [ ] One SOS tap opens the screen, requests fresh permission/location and opens native sharing.
- [ ] Verify the shared coordinate matches the physical phone, NOT the mock Victoria Island pickup.
- [ ] Cancelling the share sheet does not produce a false "sent"/"delivered" message.
- [ ] No contacts saved still permits choosing a recipient in the share sheet.
- [ ] Add/remove a contact; validate +234 formatting and reject duplicate numbers.
- [ ] Text SOS opens that contact's SMS composer with a newly acquired location. Sending stays under user control.
- [ ] Denied permission and disabled GPS display recovery options and never send mock coordinates.
- [ ] Manually entered coordinates are labelled manual in the message.
- [ ] Location-free sharing explicitly says location unavailable.
- [ ] Back out while GPS is resolving: automatic share must not launch from an unmounted SOS screen.
- [ ] Airplane-mode tests distinguish SMS/cellular, online messaging and local GPS availability.
- [ ] No feature claims emergency-service contact or delivery confirmation.

## Provider mode

- [ ] Settings toggle adds/removes Provider tab.
- [ ] Incoming sample jobs can be accepted or declined once.
- [ ] Only accepted jobs can be marked complete.
- [ ] Completion increments illustrative earnings once; no payout is initiated.
- [ ] Reset sample queue is confirmed and restores initial fixtures.
- [ ] Provider actions do not masquerade as updates to the separate customer request stream.

## Weak network / persistence

- [ ] Fresh online Home shows skeletons followed by services.
- [ ] Simulate offline produces the amber banner on all app screens.
- [ ] History, receipts, contact editing and settings remain available offline.
- [ ] Tracking pauses offline and resumes when simulation toggle is off and connectivity returns.
- [ ] Opening the map offline shows coordinates/fallback instead of an endless blank map.
- [ ] Slow map loading shows a retry action without losing the request.
- [ ] Fail-next-request produces an error for booking, payment or provider action; retry succeeds.
- [ ] A failed submission preserves the current screen's field values.
- [ ] Backgrounding pauses tracking; foregrounding resumes it.
- [ ] Restart persists created requests, ratings, contacts and provider job state.
- [ ] Reset confirms data loss, clears user-entered data, restores samples and signs out.
- [ ] Storage write failure is disclosed; saved/paid labels must not be treated as server acknowledgments.

## Visual / accessibility review — actual native screenshots required

Capture **all screens** in light and dark mode on a small phone (~320–360 points wide) and a larger phone. This source has not had a native visual pass.

- [ ] No clipped/overlapping cards, status pills, price labels, stars or contact buttons.
- [ ] Keyboard does not permanently hide a field or CTA; screen scrolls as expected.
- [ ] Status bars, notches, gesture bars and bottom navigation are respected.
- [ ] Android dark map and iOS dark map remain legible with emerald/amber markers.
- [ ] Primary emerald, amber accent, off-white background; red restricted to SOS/errors.
- [ ] VoiceOver/TalkBack labels for buttons, OTP, form inputs, payment radios, rating stars and SOS.
- [ ] Verify larger text/font scaling and readable contrast.
- [ ] Compare to user-provided reference screenshots when they become available. Behance was inaccessible (403), so fidelity is currently unverified.

Record device, OS, Expo Go/SDK version, logs, screenshots and any failed steps. Fix issues and repeat before distribution.

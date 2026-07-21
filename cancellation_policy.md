# NBA Cancellation & Refund Policy Reference

This document outlines the standard cancellation policy, refund calculations, and the Lifetime Deposits credit rules for Nothing But Adventures (NBA) bookings.

---

## 1. Core Definitions

* **Total Paid**: The sum of all completed cash transactions (PayPal/Credit Card) PLUS the credit applied from any redeemed **Lifetime Deposits** at checkout.
* **Tour Exemption**: If a tour is configured with `exemptFromLifetimeDeposit: true`, no Lifetime Deposit will be issued upon cancellation; all held deposits are treated as non-refundable.
* **Minimum Booking Deposit (Required Deposit)**: The minimum payment needed to secure the booking. It is calculated per traveler:
  * For **Amount** booking types: `tour.price.bookingAmount * numberOfTravelers`
  * For **Percentage** booking types: `(tour.price.amount * (tour.price.bookingPercentage || 20) / 100) * numberOfTravelers`
* **Held Deposit**: The portion of the Total Paid that goes towards the booking deposit (`Math.min(Total Paid, Required Deposit)`).
* **Remainder**: Any payment amount beyond the required deposit (`Total Paid - Held Deposit`).

---

## 2. Cancellation Timelines & Refunds

When a booking is cancelled, the refund policy applies to the **Remainder** of the payments:

| Time of Cancellation | Policy Breakdown |
| :--- | :--- |
| **Scenario A (60+ days before departure)** | **100% of the Remainder** is refunded. The Held Deposit is locked as a new Lifetime Deposit. |
| **Scenario B (30–59 days before departure)** | **50% of the Remainder** is refunded. The remaining 50% is forfeited. The Held Deposit is locked as a new Lifetime Deposit. |
| **Scenario C (< 30 days before departure)** | **0% of the Remainder** is refunded (fully forfeited). The Held Deposit is locked as a new Lifetime Deposit. |

---

## 3. Lifetime Deposits & Return-to-Voucher Edge Cases

To prevent cash exploitation of Lifetime Deposits (e.g., trying to redeem a voucher to get a cash refund upon cancellation):

1. **Voucher Re-issuance**:
   * The **Held Deposit** is always issued as a brand-new Lifetime Deposit voucher (divided equally among the booking's travelers).
2. **Capping Cash Refunds**:
   * Cash refunds are strictly capped at the actual cash paid via Credit Card or PayPal.
3. **Remainder Credit Recovery**:
   * If a traveler paid part of the tour using a Lifetime Deposit credit, any eligible refund on that credit portion is returned as an additional Lifetime Deposit voucher rather than cash.
   * **Formula**: `Voucher Refund = Refund Amount - Cash Refund` (where `Cash Refund = Math.min(Refund Amount, Actual Cash Paid)`).
   * **Result**: The traveler gets their applied Lifetime Deposit back as a voucher, and their cash portion back in cash.

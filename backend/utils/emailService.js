/**
 * Email Service using Gmail (Nodemailer)
 *
 * Requires these environment variables:
 *   GMAIL_EMAIL       – Your Gmail address
 *   GMAIL_APP_PASSWORD – Gmail App Password (not your regular password)
 *   SITE_NAME         – e.g. "NothingButAdventures" (optional, defaults provided)
 */

const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const SITE_NAME = process.env.SITE_NAME || "NothingButAdventures";
const FROM_EMAIL = process.env.GMAIL_EMAIL;

// ─── Helper ────────────────────────────────────────────────────────────────────
const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ─── Email Templates ───────────────────────────────────────────────────────────

/**
 * Send installment confirmation email (when a subscription is activated)
 */
const sendInstallmentActivatedEmail = async (to, data) => {
  const { bookingReference, tourName, totalAmount, upfrontAmount, numberOfInstallments, installmentAmount, schedule, currency } = data;

  const scheduleRows = schedule
    .map(
      (s) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${s.type === "upfront" ? "Upfront (25%)" : `Installment #${s.installmentNumber}`}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${formatCurrency(s.amount, currency)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${formatDate(s.dueDate)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
            <span style="padding:2px 8px;border-radius:12px;font-size:12px;${s.status === "paid" ? "background:#dcfce7;color:#166534;" : "background:#fef3c7;color:#92400e;"}">${s.status}</span>
          </td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Pay-in-Parts Activated ✅</h1>
        <p style="color:#e0d4fc;margin:8px 0 0;font-size:14px;">Booking Ref: ${bookingReference}</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;font-size:16px;">Hi there,</p>
        <p style="color:#374151;">Your installment plan for <strong>${tourName}</strong> has been activated! Here's your payment schedule:</p>
        
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;">Total Amount</span>
            <strong style="color:#111827;">${formatCurrency(totalAmount, currency)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;">Upfront Payment (25%)</span>
            <strong style="color:#059669;">${formatCurrency(upfrontAmount, currency)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#6b7280;">Monthly Installments</span>
            <strong style="color:#111827;">${numberOfInstallments} × ${formatCurrency(installmentAmount, currency)}</strong>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:10px 12px;text-align:left;color:#374151;">Payment</th>
              <th style="padding:10px 12px;text-align:left;color:#374151;">Amount</th>
              <th style="padding:10px 12px;text-align:left;color:#374151;">Due Date</th>
              <th style="padding:10px 12px;text-align:left;color:#374151;">Status</th>
            </tr>
          </thead>
          <tbody>${scheduleRows}</tbody>
        </table>

        <p style="color:#6b7280;font-size:13px;margin-top:16px;">
          💡 PayPal will automatically charge your account on each due date. You can view your installment status anytime in your profile.
        </p>
        <p style="color:#6b7280;font-size:13px;">
          ⚠️ All payments must be completed 90 days before tour departure. Failure to complete payments will result in booking cancellation and the paid amount being credited to your wallet.
        </p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `✅ Installment Plan Activated — ${tourName} (${bookingReference})`,
      html,
    });
    console.log(`📧 Installment activation email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send installment activation email:", err.message);
  }
};

/**
 * Send installment payment confirmation email
 */
const sendInstallmentPaymentEmail = async (to, data) => {
  const { bookingReference, tourName, installmentNumber, amount, totalPaid, totalAmount, remainingAmount, currency } = data;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#059669,#10b981);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Payment Received 💰</h1>
        <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;">Installment #${installmentNumber} — ${bookingReference}</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;">Your installment payment for <strong>${tourName}</strong> has been processed.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
          <p style="color:#166534;font-size:24px;font-weight:bold;margin:0;">${formatCurrency(amount, currency)}</p>
          <p style="color:#15803d;font-size:13px;margin:4px 0 0;">Installment #${installmentNumber} paid</p>
        </div>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;">Total Paid So Far</span>
            <strong style="color:#059669;">${formatCurrency(totalPaid, currency)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#6b7280;">Remaining</span>
            <strong style="color:#111827;">${formatCurrency(remainingAmount, currency)}</strong>
          </div>
          <div style="margin-top:12px;background:#e5e7eb;border-radius:99px;height:8px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,#059669,#10b981);height:100%;border-radius:99px;width:${Math.round((totalPaid / totalAmount) * 100)}%;"></div>
          </div>
          <p style="text-align:center;color:#6b7280;font-size:12px;margin-top:6px;">${Math.round((totalPaid / totalAmount) * 100)}% complete</p>
        </div>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">${SITE_NAME}</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `💰 Installment #${installmentNumber} Received — ${tourName}`,
      html,
    });
    console.log(`📧 Payment confirmation email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send payment confirmation email:", err.message);
  }
};

/**
 * Send installment reminder email (sent a few days before due date)
 */
const sendInstallmentReminderEmail = async (to, data) => {
  const { bookingReference, tourName, installmentNumber, amount, dueDate, currency } = data;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Payment Reminder ⏰</h1>
        <p style="color:#fef3c7;margin:8px 0 0;font-size:14px;">${bookingReference}</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;">Your upcoming installment for <strong>${tourName}</strong> is due soon.</p>
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
          <p style="color:#92400e;font-size:14px;margin:0 0 4px;">Installment #${installmentNumber}</p>
          <p style="color:#78350f;font-size:28px;font-weight:bold;margin:0;">${formatCurrency(amount, currency)}</p>
          <p style="color:#92400e;font-size:14px;margin:8px 0 0;">Due: ${formatDate(dueDate)}</p>
        </div>
        <p style="color:#6b7280;font-size:13px;">PayPal will automatically process this payment on the due date. Please ensure your PayPal account has sufficient funds.</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">${SITE_NAME}</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `⏰ Payment Reminder — Installment #${installmentNumber} due ${formatDate(dueDate)}`,
      html,
    });
    console.log(`📧 Reminder email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send reminder email:", err.message);
  }
};

/**
 * Send booking cancellation email due to missed installments
 */
const sendInstallmentCancellationEmail = async (to, data) => {
  const { bookingReference, tourName, totalPaid, walletCredit, currency } = data;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Booking Cancelled ❌</h1>
        <p style="color:#fecaca;margin:8px 0 0;font-size:14px;">${bookingReference}</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;">We're sorry, but your booking for <strong>${tourName}</strong> has been cancelled because installment payments were not completed before the 90-day deadline.</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="color:#991b1b;font-size:14px;margin:0 0 8px;"><strong>What happens to your payments?</strong></p>
          <p style="color:#7f1d1d;font-size:14px;margin:0;">
            Your total paid amount of <strong>${formatCurrency(totalPaid, currency)}</strong> has been credited to your wallet as <strong>${formatCurrency(walletCredit, currency)}</strong>.
          </p>
        </div>
        <p style="color:#6b7280;font-size:13px;">You can use your wallet balance towards a future booking with full payment. Visit your profile to check your wallet balance.</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">${SITE_NAME}</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `❌ Booking Cancelled — ${tourName} (${bookingReference})`,
      html,
    });
    console.log(`📧 Cancellation email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send cancellation email:", err.message);
  }
};

module.exports = {
  sendInstallmentActivatedEmail,
  sendInstallmentPaymentEmail,
  sendInstallmentReminderEmail,
  sendInstallmentCancellationEmail,
};

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

/**
 * Send booking cancellation email with refund information
 */
const sendCancellationSuccessEmail = async (to, data) => {
  const { bookingReference, tourName, refundAmount, currency, policyApplied } = data;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Booking Cancelled ❌</h1>
        <p style="color:#fee2e2;margin:8px 0 0;font-size:14px;">Booking Ref: ${bookingReference}</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;font-size:16px;">Hi there,</p>
        <p style="color:#374151;">Your cancellation request for <strong>${tourName}</strong> has been processed successfully.</p>
        
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #e5e7eb;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="color:#6b7280;font-size:14px;">Policy Applied:</span>
            <strong style="color:#111827;font-size:14px;">Participant Cancellation</strong>
          </div>
          <div style="color:#4b5563;font-size:13px;line-height:1.4;margin-bottom:12px;padding:8px;background:#fff;border-radius:6px;border-left:4px solid #ef4444;">
            ${policyApplied}
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #e5e7eb;">
            <span style="color:#6b7280;font-size:14px;">Refund Amount (Cash/Credit Card):</span>
            <strong style="color:#059669;font-size:16px;">${formatCurrency(refundAmount, currency)}</strong>
          </div>
        </div>

        <p style="color:#6b7280;font-size:13px;">
          Note: If a cash refund is payable, it will be processed back to your original payment method. Depending on your bank, it may take 5–10 business days to appear on your statement.
        </p>
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
      subject: `❌ Cancellation Processed — ${tourName} (${bookingReference})`,
      html,
    });
    console.log(`📧 Cancellation confirmation email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send cancellation email:", err.message);
  }
};

/**
 * Send email when a Lifetime Deposit is issued to a user
 */
const sendLifetimeDepositIssuedEmail = async (to, data) => {
  const { travelerName, code, amount, currency, tourName } = data;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">Lifetime Deposit Issued 🎫</h1>
        <p style="color:#e9d5ff;margin:8px 0 0;font-size:14px;">For traveler: ${travelerName}</p>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;font-size:16px;">Hi there,</p>
        <p style="color:#374151;">We have issued a <strong>Lifetime Deposit</strong> matching the deposit value of your cancelled booking for <strong>${tourName}</strong>.</p>
        
        <div style="background:#f5f3ff;border:1.5px dashed #7c3aed;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
          <p style="color:#6b7280;font-size:13px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Lifetime Deposit Code</p>
          <p style="color:#7c3aed;font-size:28px;font-weight:bold;margin:0 0 16px;font-family:monospace;letter-spacing:2px;">${code}</p>
          <p style="color:#111827;font-size:18px;margin:0;">Value: <strong>${formatCurrency(amount, currency)}</strong></p>
        </div>

        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;border:1px solid #e5e7eb;">
          <p style="color:#111827;font-size:14px;margin:0 0 8px;font-weight:bold;">Important Policy Rules:</p>
          <ul style="color:#4b5563;font-size:13px;line-height:1.5;margin:0;padding-left:20px;">
            <li>Lifetime Deposits are valid for life (no expiration date).</li>
            <li>Limited to one Lifetime Deposit code applied per traveler per booking.</li>
            <li>Use this code at checkout to book your next trip with **no cash down**!</li>
            <li>Lifetime Deposits are non-refundable in cash.</li>
          </ul>
        </div>

        <p style="color:#374151;margin-top:20px;">
          Simply copy and apply this code during checkout on your next adventure with NBA.
        </p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">${SITE_NAME}</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `🎫 Your Lifetime Deposit is Ready — ${formatCurrency(amount, currency)}`,
      html,
    });
    console.log(`📧 Lifetime Deposit email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send Lifetime Deposit email:", err.message);
  }
};

/**
 * Send email verification email
 */
const sendVerificationEmail = async (to, data) => {
  const { name, verificationUrl } = data;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#3F3F42;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;">Nothing But Adventures</h1>
        <p style="color:#a1a1aa;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Verify Your Email Address</p>
      </div>
      <div style="padding:24px;color:#3F3F42;line-height:1.6;">
        <p style="font-size:16px;font-weight:600;margin-top:0;color:#111827;">Hello ${name},</p>
        <p style="font-size:15px;margin:16px 0;">Welcome to Nothing But Adventures! We are excited to have you join us. Before you can start booking and managing your journeys, please verify your email address by clicking the button below:</p>
        
        <div style="text-align:center;margin:30px 0;">
          <a href="${verificationUrl}" style="background-color:#2563eb;color:#fff;padding:12px 30px;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;display:inline-block;">Verify Email Address</a>
        </div>
        
        <p style="font-size:13px;color:#6b7280;margin:24px 0 0;">If the button above does not work, copy and paste this link into your browser:</p>
        <p style="font-size:12px;color:#2563eb;word-break:break-all;margin:6px 0 0;font-family:monospace;">${verificationUrl}</p>
        
        <p style="font-size:13px;color:#9ca3af;margin:24px 0 0;border-top:1px solid #f3f4f6;padding-top:16px;">This link will expire in 24 hours. If you did not sign up for an account, please ignore this email.</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `✉️ Verify Your Email — ${SITE_NAME}`,
      html,
    });
    console.log(`📧 Verification email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send verification email:", err.message);
    throw err;
  }
};

/**
 * Send welcome email on successful email verification
 */
const sendWelcomeEmail = async (to, data) => {
  const { name, loginUrl } = data;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#3F3F42;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;">Nothing But Adventures</h1>
        <p style="color:#a1a1aa;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Welcome to the Club 🌍</p>
      </div>
      <div style="padding:24px;color:#3F3F42;line-height:1.6;">
        <p style="font-size:16px;font-weight:600;margin-top:0;color:#111827;">Welcome aboard, ${name}!</p>
        <p style="font-size:15px;margin:16px 0;">Your email address has been successfully verified, and your account is now active. We are absolutely thrilled to welcome you to <strong>Nothing But Adventures</strong>!</p>
        
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;border:1px solid #f3f4f6;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#111827;font-weight:600;">What's next?</h4>
          <ul style="margin:0;padding-left:20px;font-size:13px;color:#4b5563;line-height:1.5;">
            <li><strong>Find Your Next Adventure:</strong> Explore small group tours all over the world.</li>
            <li><strong>Complete Your Profile:</strong> Tell us about your preferences and interests.</li>
            <li><strong>Manage Bookings:</strong> Access your dashboard to view payment plans, lifetime deposits, and more.</li>
          </ul>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${loginUrl}" style="background-color:#2563eb;color:#fff;padding:12px 30px;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;display:inline-block;">Go to Dashboard</a>
        </div>
        
        <p style="font-size:13px;color:#6b7280;margin:24px 0 0;">If you have any questions or need support, please feel free to reply to this email.</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `🎉 Welcome to Nothing But Adventures!`,
      html,
    });
    console.log(`📧 Welcome email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send welcome email:", err.message);
  }
};

/**
 * Send email when hold space is created
 */
const sendHoldSpaceCreatedEmail = async (to, data) => {
  const { name, tourName, holdReference, numberOfSpots, startDate, price, expiresAt } = data;
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/profile`;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#3F3F42;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;">Nothing But Adventures</h1>
        <p style="color:#fcd34d;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">🔒 Space Held Successfully</p>
      </div>
      <div style="padding:24px;color:#3F3F42;line-height:1.6;">
        <p style="font-size:16px;font-weight:600;margin-top:0;color:#111827;">Hi ${name},</p>
        <p style="font-size:15px;margin:16px 0;">Great news! We have successfully put spots on hold for you on the following adventure. You have locked in the spots and price for the next 48 hours with no payment required.</p>
        
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0;">
          <h3 style="margin:0 0 12px;font-size:15px;color:#92400e;font-weight:600;">Hold Details:</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Tour Name:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${tourName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Departure Date:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${formatDate(startDate)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Spots Held:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${numberOfSpots}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Locked-in Price:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${formatCurrency(price.amount, price.currency)} / person</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Hold Reference:</td>
              <td style="padding:4px 0;color:#111827;font-family:monospace;font-weight:600;">${holdReference}</td>
            </tr>
            <tr>
              <td style="padding:12px 0 4px;color:#b45309;font-weight:600;">Expires On:</td>
              <td style="padding:12px 0 4px;color:#b45309;font-weight:600;">${new Date(expiresAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td>
            </tr>
          </table>
        </div>

        <p style="font-size:14px;color:#6b7280;margin:20px 0;">To complete your booking and secure these spots permanently, click the button below to view your hold space dashboard and proceed to checkout.</p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${loginUrl}" style="background-color:#2563eb;color:#fff;padding:12px 30px;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;display:inline-block;">Complete Your Booking</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `🔒 Space Hold Confirmed: ${tourName} (${holdReference})`,
      html,
    });
    console.log(`📧 Hold space created email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send hold space created email:", err.message);
  }
};

/**
 * Send email verification reminder after 24 hours of hold space
 */
const sendHoldSpace24hReminderEmail = async (to, data) => {
  const { name, tourName, holdReference, expiresAt } = data;
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/profile`;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#3F3F42;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;">Nothing But Adventures</h1>
        <p style="color:#f59e0b;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">⏱️ 24 Hours Remaining on Hold</p>
      </div>
      <div style="padding:24px;color:#3F3F42;line-height:1.6;">
        <p style="font-size:16px;font-weight:600;margin-top:0;color:#111827;">Hi ${name},</p>
        <p style="font-size:15px;margin:16px 0;">This is a friendly reminder that you have <strong>24 hours remaining</strong> to secure your spots on <strong>${tourName}</strong>.</p>
        
        <p style="font-size:15px;margin:16px 0;">If you don't complete your booking, your hold will automatically expire, and these spots will be released back to other travelers. Your locked-in price will also be lost.</p>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
          <p style="color:#b45309;font-size:14px;margin:0;">Hold Reference: <strong>${holdReference}</strong></p>
          <p style="color:#92400e;font-size:16px;font-weight:600;margin:6px 0 0;">Expires: ${new Date(expiresAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${loginUrl}" style="background-color:#2563eb;color:#fff;padding:12px 30px;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;display:inline-block;">Book Now to Confirm</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `⏰ 24h Left: Complete Your Booking for ${tourName}`,
      html,
    });
    console.log(`📧 Hold space 24h reminder email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send hold space 24h reminder email:", err.message);
  }
};

/**
 * Send email verification reminder 2 hours before expiry (46 hours of hold space)
 */
const sendHoldSpace46hReminderEmail = async (to, data) => {
  const { name, tourName, holdReference, expiresAt } = data;
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/profile`;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#3F3F42;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;">Nothing But Adventures</h1>
        <p style="color:#ef4444;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">⚠️ 2 Hours Left — Hold Expiring Soon</p>
      </div>
      <div style="padding:24px;color:#3F3F42;line-height:1.6;">
        <p style="font-size:16px;font-weight:600;margin-top:0;color:#111827;">Hi ${name},</p>
        <p style="font-size:15px;margin:16px 0;">This is your final warning: your hold for <strong>${tourName}</strong> is expiring in <strong>2 hours</strong>.</p>
        
        <p style="font-size:15px;margin:16px 0;">To prevent losing your held spots and current pricing, please complete your checkout immediately.</p>

        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
          <p style="color:#b91c1c;font-size:14px;margin:0;">Hold Reference: <strong>${holdReference}</strong></p>
          <p style="color:#991b1b;font-size:18px;font-weight:600;margin:6px 0 0;">Expiring at: ${new Date(expiresAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${loginUrl}" style="background-color:#2563eb;color:#fff;padding:12px 30px;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;display:inline-block;">Secure My Spots Now</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `⚠️ FINAL REMINDER: 2 Hours Left for Hold ${holdReference}`,
      html,
    });
    console.log(`📧 Hold space 46h reminder email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send hold space 46h reminder email:", err.message);
  }
};

/**
 * Send email when hold space expires
 */
const sendHoldSpaceExpiredEmail = async (to, data) => {
  const { name, tourName, holdReference } = data;
  const loginUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/search`;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#3F3F42;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;">Nothing But Adventures</h1>
        <p style="color:#ef4444;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">❌ Hold Space Expired</p>
      </div>
      <div style="padding:24px;color:#3F3F42;line-height:1.6;">
        <p style="font-size:16px;font-weight:600;margin-top:0;color:#111827;">Hi ${name},</p>
        <p style="font-size:15px;margin:16px 0;">This email is to notify you that your hold for <strong>${tourName}</strong> (Ref: ${holdReference}) has expired, and the spots have been released.</p>
        
        <p style="font-size:15px;margin:16px 0;">If you still wish to participate, you can search for new dates or place another hold if availability permits. Please note that group sizes are small and spots fill up quickly!</p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${loginUrl}" style="background-color:#2563eb;color:#fff;padding:12px 30px;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;display:inline-block;">Explore Available Trips</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `❌ Hold Expired: ${tourName} (${holdReference})`,
      html,
    });
    console.log(`📧 Hold space expired email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send hold space expired email:", err.message);
  }
};

/**
 * Send email when hold space is manually released/cancelled
 */
const sendHoldSpaceReleasedEmail = async (to, data) => {
  const { name, tourName, holdReference } = data;
  const searchUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/search`;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#3F3F42;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;">Nothing But Adventures</h1>
        <p style="color:#a1a1aa;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">↩️ Hold Space Released</p>
      </div>
      <div style="padding:24px;color:#3F3F42;line-height:1.6;">
        <p style="font-size:16px;font-weight:600;margin-top:0;color:#111827;">Hi ${name},</p>
        <p style="font-size:15px;margin:16px 0;">This email confirms that your hold for <strong>${tourName}</strong> (Ref: <strong>${holdReference}</strong>) has been successfully released/cancelled as requested.</p>
        
        <p style="font-size:15px;margin:16px 0;">The spots have been returned to public inventory. If this was done in error, or you would like to browse other adventures, click the button below to see what else is available.</p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${searchUrl}" style="background-color:#2563eb;color:#fff;padding:12px 30px;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;display:inline-block;">Explore Other Trips</a>
        </div>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `↩️ Space Hold Released: ${tourName} (${holdReference})`,
      html,
    });
    console.log(`📧 Hold space released email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send hold space released email:", err.message);
  }
};

/**
 * Send email when booking is successfully confirmed
 */
const sendBookingConfirmationEmail = async (to, data) => {
  const { name, tourName, bookingReference, startDate, numberOfTravelers, totalPrice, currency, paymentStatus, paymentMethod } = data;
  const dashboardUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/profile`;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#3F3F42;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;">Nothing But Adventures</h1>
        <p style="color:#10b981;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">🎉 Booking Confirmed!</p>
      </div>
      <div style="padding:24px;color:#3F3F42;line-height:1.6;">
        <p style="font-size:16px;font-weight:600;margin-top:0;color:#111827;">Dear ${name},</p>
        <p style="font-size:15px;margin:16px 0;">Pack your bags! Your booking for <strong>${tourName}</strong> has been successfully confirmed. We are thrilled to guide you on this upcoming adventure.</p>
        
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
          <h3 style="margin:0 0 12px;font-size:15px;color:#166534;font-weight:600;">Booking Details:</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Booking Reference:</td>
              <td style="padding:4px 0;color:#111827;font-family:monospace;font-weight:600;">${bookingReference}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Tour Name:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${tourName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Departure Date:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${formatDate(startDate)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Number of Travelers:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${numberOfTravelers}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Amount Paid:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${formatCurrency(totalPrice, currency)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Payment Status:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;text-transform:capitalize;">${paymentStatus.replace('_', ' ')}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#6b7280;">Payment Method:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;text-transform:capitalize;">${paymentMethod.replace('_', ' ')}</td>
            </tr>
          </table>
        </div>

        <p style="font-size:14px;color:#6b7280;margin:20px 0;">You can view your booking details, invoice, and track trip details in your profile dashboard at any time.</p>

        <div style="text-align:center;margin:30px 0;">
          <a href="${dashboardUrl}" style="background-color:#2563eb;color:#fff;padding:12px 30px;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;display:inline-block;">View Booking Dashboard</a>
        </div>

        <p style="font-size:13px;color:#9ca3af;margin:24px 0 0;border-top:1px solid #f3f4f6;padding-top:16px;">Need to adjust details or have questions? Contact support referencing your Booking ID.</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `🎉 Booking Confirmed: ${tourName} (${bookingReference})`,
      html,
    });
    console.log(`📧 Booking confirmation email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send booking confirmation email:", err.message);
  }
};

/**
 * Send email for abandoned checkout (cart recovery)
 */
const sendAbandonedCheckoutEmail = async (to, data) => {
  const { name, tourName, duration, price, currency, startDate, checkoutUrl } = data;

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#3F3F42;padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:600;">Nothing But Adventures</h1>
        <p style="color:#fcd34d;margin:8px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">🎒 Ready to Adventure?</p>
      </div>
      <div style="padding:24px;color:#3F3F42;line-height:1.6;">
        <p style="font-size:16px;font-weight:600;margin-top:0;color:#111827;">Hi ${name},</p>
        <p style="font-size:15px;margin:16px 0;">We noticed you were checking out details for our small group adventure <strong>${tourName}</strong> starting on <strong>${formatDate(startDate)}</strong>, but you didn't finish booking yet.</p>
        
        <p style="font-size:15px;margin:16px 0;">Spots for this tour are small and limited, and dates fill up quickly. We've saved your progress and locked-in price so you can jump right back in where you left off!</p>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
          <h4 style="margin:0 0 8px;font-size:14px;color:#111827;">Your Selected Trip:</h4>
          <table style="width:100%;font-size:13px;border-collapse:collapse;color:#4b5563;">
            <tr>
              <td style="padding:4px 0;">Tour Name:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${tourName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;">Duration:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${duration} Days</td>
            </tr>
            <tr>
              <td style="padding:4px 0;">Price:</td>
              <td style="padding:4px 0;color:#111827;font-weight:600;">${formatCurrency(price, currency)} / person</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${checkoutUrl}" style="background-color:#2563eb;color:#fff;padding:12px 30px;text-decoration:none;border-radius:9999px;font-weight:600;font-size:15px;display:inline-block;">Complete Your Checkout</a>
        </div>

        <p style="font-size:13px;color:#9ca3af;margin:24px 0 0;text-align:center;">Have questions about the trip itinerary, hotel upgrades, or payment plans? Just reply to this email, and our team will help you out!</p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ${SITE_NAME} — Adventure Awaits</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `🎒 Don't miss out on ${tourName}! Complete your adventure booking`,
      html,
    });
    console.log(`📧 Abandoned checkout recovery email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send abandoned checkout recovery email:", err.message);
  }
};

// ─── Affiliate Email Templates ─────────────────────────────────────────────────

/**
 * Send affiliate application received confirmation email
 */
const sendAffiliateApplicationReceivedEmail = async (to, data) => {
  const { name, type, companyName } = data;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1A1A1A 0%, #333333 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Application Received! 🎉</h1>
        <p style="color: #ffffff; opacity: 0.8; margin-top: 10px; font-size: 14px;">Nothing But Adventures Affiliate Program</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">
          Thank you for applying to the <strong>Nothing But Adventures ${type === "affiliate" ? "Affiliate" : "Rep"} Program</strong>${companyName ? ` on behalf of <strong>${companyName}</strong>` : ""}!
        </p>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1A1A1A; margin-top: 0;">What happens next?</h3>
          <ol style="color: #3F3F42; font-size: 14px; line-height: 1.8; padding-left: 20px;">
            <li>Our team will review your application within <strong>2-3 business days</strong></li>
            <li>You'll receive an email with your approval status</li>
            <li>Once approved, you'll get your unique affiliate code and tracking link</li>
            <li>Start sharing and earning commissions!</li>
          </ol>
        </div>
        <p style="color: #3F3F42; font-size: 14px; line-height: 1.6;">
          Questions? Reach out to us at <a href="mailto:affiliate@nothingbutadventures.com" style="color: #2563eb;">affiliate@nothingbutadventures.com</a>
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="color: #737373; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `✅ Affiliate Application Received — ${SITE_NAME}`,
      html,
    });
    console.log(`📧 Affiliate application received email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send affiliate application email:", err.message);
  }
};

/**
 * Send affiliate approved email with affiliate code
 */
const sendAffiliateApprovedEmail = async (to, data) => {
  const { name, affiliateCode, commissionRate, type } = data;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">You're Approved! 🎊</h1>
        <p style="color: #ffffff; opacity: 0.9; margin-top: 10px; font-size: 14px;">Welcome to the ${SITE_NAME} Affiliate Family</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">
          Great news! Your application to become a <strong>${SITE_NAME} ${type === "affiliate" ? "Affiliate" : "Rep"}</strong> has been approved!
        </p>
        <div style="background: linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
          <p style="color: #ffffff; opacity: 0.7; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Your Affiliate Code</p>
          <p style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: 3px;">${affiliateCode}</p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
            <p style="color: #10b981; font-size: 18px; font-weight: 600; margin: 0;">Commission Rate: ${commissionRate}%</p>
          </div>
        </div>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #bbf7d0;">
          <h3 style="color: #059669; margin-top: 0;">🚀 Getting Started</h3>
          <ol style="color: #3F3F42; font-size: 14px; line-height: 2; padding-left: 20px;">
            <li>Log in to your <strong>Affiliate Dashboard</strong> on our website</li>
            <li>Copy your unique referral link</li>
            <li>Share it on social media, your website, or with your audience</li>
            <li>Track your clicks, conversions, and commissions in real-time</li>
            <li>Earn <strong>${commissionRate}%</strong> on every successful booking!</li>
          </ol>
        </div>
        <p style="color: #3F3F42; font-size: 14px; line-height: 1.6;">
          Your referral link format: <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 13px;">nothingbutadventures.com/?ref=${affiliateCode}</code>
        </p>
        <p style="color: #3F3F42; font-size: 14px; line-height: 1.6;">
          We're excited to have you on board! Contact us at <a href="mailto:affiliate@nothingbutadventures.com" style="color: #2563eb;">affiliate@nothingbutadventures.com</a> anytime.
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="color: #737373; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `🎉 Welcome to the ${SITE_NAME} Affiliate Program!`,
      html,
    });
    console.log(`📧 Affiliate approved email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send affiliate approved email:", err.message);
  }
};

/**
 * Send affiliate rejected email
 */
const sendAffiliateRejectedEmail = async (to, data) => {
  const { name, reason } = data;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #1A1A1A 0%, #333333 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Application Update</h1>
        <p style="color: #ffffff; opacity: 0.8; margin-top: 10px; font-size: 14px;">${SITE_NAME} Affiliate Program</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">
          Thank you for your interest in the ${SITE_NAME} Affiliate Program. After careful review, we're unable to approve your application at this time.
        </p>
        ${reason ? `
          <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #fecaca;">
            <p style="color: #991b1b; font-size: 14px; margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
        ` : ""}
        <p style="color: #3F3F42; font-size: 14px; line-height: 1.6;">
          This doesn't mean the door is closed — we encourage you to build your audience and reapply in the future. If you have questions, please contact us at <a href="mailto:affiliate@nothingbutadventures.com" style="color: #2563eb;">affiliate@nothingbutadventures.com</a>.
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="color: #737373; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `Affiliate Application Update — ${SITE_NAME}`,
      html,
    });
    console.log(`📧 Affiliate rejected email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send affiliate rejected email:", err.message);
  }
};

/**
 * Send commission earned notification email
 */
const sendAffiliateCommissionEarnedEmail = async (to, data) => {
  const { name, commissionAmount, bookingReference, tourName, totalEarned, pendingPayout } = data;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Commission Earned! 💰</h1>
        <p style="color: #ffffff; opacity: 0.9; margin-top: 10px; font-size: 14px;">A referral just booked a trip</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">
          Great news! Someone you referred just booked a trip, and you've earned a commission!
        </p>
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #bae6fd;">
          <div style="text-align: center; margin-bottom: 15px;">
            <p style="color: #0369a1; font-size: 14px; margin: 0 0 5px 0;">Commission Earned</p>
            <p style="color: #0c4a6e; font-size: 36px; font-weight: 800; margin: 0;">${formatCurrency(commissionAmount)}</p>
          </div>
          <div style="border-top: 1px solid #bae6fd; padding-top: 15px;">
            <table style="width: 100%; font-size: 14px; color: #3F3F42;">
              <tr><td style="padding: 5px 0;">Tour</td><td style="text-align: right; font-weight: 600;">${tourName}</td></tr>
              <tr><td style="padding: 5px 0;">Booking Ref</td><td style="text-align: right; font-weight: 600;">${bookingReference}</td></tr>
              <tr><td style="padding: 5px 0;">Total Earned (All Time)</td><td style="text-align: right; font-weight: 600;">${formatCurrency(totalEarned)}</td></tr>
              <tr><td style="padding: 5px 0;">Pending Payout</td><td style="text-align: right; font-weight: 600; color: #059669;">${formatCurrency(pendingPayout)}</td></tr>
            </table>
          </div>
        </div>
        <p style="color: #3F3F42; font-size: 14px; line-height: 1.6;">
          Keep sharing your referral link to earn more! Check your affiliate dashboard for detailed analytics.
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="color: #737373; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `💰 You earned ${formatCurrency(commissionAmount)} in commission — ${SITE_NAME}`,
      html,
    });
    console.log(`📧 Commission earned email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send commission earned email:", err.message);
  }
};

/**
 * Send payout processed email
 */
const sendAffiliatePayoutProcessedEmail = async (to, data) => {
  const { name, amount, method, transactionId, remainingBalance } = data;

  const methodLabels = {
    bank_transfer: "Bank Transfer",
    paypal: "PayPal",
    stripe: "Stripe",
    manual: "Manual Transfer",
  };

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Payout Processed! 🏦</h1>
        <p style="color: #ffffff; opacity: 0.9; margin-top: 10px; font-size: 14px;">Your commission has been paid</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        <p style="color: #3F3F42; font-size: 16px; line-height: 1.6;">Your affiliate payout has been processed!</p>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid #bbf7d0; text-align: center;">
          <p style="color: #059669; font-size: 14px; margin: 0 0 5px 0;">Amount Paid</p>
          <p style="color: #065f46; font-size: 36px; font-weight: 800; margin: 0;">${formatCurrency(amount)}</p>
          <div style="border-top: 1px solid #bbf7d0; margin-top: 15px; padding-top: 15px;">
            <table style="width: 100%; font-size: 14px; color: #3F3F42;">
              <tr><td style="padding: 5px 0;">Payment Method</td><td style="text-align: right; font-weight: 600;">${methodLabels[method] || method}</td></tr>
              <tr><td style="padding: 5px 0;">Transaction ID</td><td style="text-align: right; font-weight: 600;">${transactionId}</td></tr>
              <tr><td style="padding: 5px 0;">Remaining Balance</td><td style="text-align: right; font-weight: 600;">${formatCurrency(remainingBalance)}</td></tr>
            </table>
          </div>
        </div>
        <p style="color: #3F3F42; font-size: 14px; line-height: 1.6;">
          If you have any questions about this payout, please contact <a href="mailto:affiliate@nothingbutadventures.com" style="color: #2563eb;">affiliate@nothingbutadventures.com</a>.
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="color: #737373; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: `💵 Payout of ${formatCurrency(amount)} processed — ${SITE_NAME}`,
      html,
    });
    console.log(`📧 Payout processed email sent to ${to}`);
  } catch (err) {
    console.error("Failed to send payout processed email:", err.message);
  }
};

module.exports = {
  sendInstallmentActivatedEmail,
  sendInstallmentPaymentEmail,
  sendInstallmentReminderEmail,
  sendInstallmentCancellationEmail,
  sendCancellationSuccessEmail,
  sendLifetimeDepositIssuedEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendHoldSpaceCreatedEmail,
  sendHoldSpace24hReminderEmail,
  sendHoldSpace46hReminderEmail,
  sendHoldSpaceExpiredEmail,
  sendHoldSpaceReleasedEmail,
  sendBookingConfirmationEmail,
  sendAbandonedCheckoutEmail,
  sendAffiliateApplicationReceivedEmail,
  sendAffiliateApprovedEmail,
  sendAffiliateRejectedEmail,
  sendAffiliateCommissionEarnedEmail,
  sendAffiliatePayoutProcessedEmail,
};

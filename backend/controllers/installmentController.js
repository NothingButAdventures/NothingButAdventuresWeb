const Booking = require("../models/Booking");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { calculateInstallmentPlan } = require("../utils/installmentCalculator");
const {
  sendInstallmentActivatedEmail,
  sendInstallmentPaymentEmail,
  sendInstallmentReminderEmail,
  sendInstallmentCancellationEmail,
} = require("../utils/emailService");

// PayPal API base URL
const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ─── Helper: get PayPal access token ───────────────────────────────────────────
const getPayPalAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("PayPal auth error:", text);
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await res.json();
  return data.access_token;
};

// ─── Helper: ensure PayPal product exists ──────────────────────────────────────
let cachedProductId = null;

const ensurePayPalProduct = async (accessToken) => {
  if (cachedProductId) return cachedProductId;

  // Check if product already exists
  const listRes = await fetch(`${PAYPAL_BASE}/v1/catalogs/products?page_size=20`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (listRes.ok) {
    const listData = await listRes.json();
    const existing = (listData.products || []).find(
      (p) => p.name === "NothingButAdventures Tour Installment"
    );
    if (existing) {
      cachedProductId = existing.id;
      return cachedProductId;
    }
  }

  // Create new product
  const createRes = await fetch(`${PAYPAL_BASE}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      name: "NothingButAdventures Tour Installment",
      description: "Tour booking installment plan",
      type: "SERVICE",
      category: "TRAVEL",
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    console.error("PayPal product creation error:", text);
    throw new Error("Failed to create PayPal product");
  }

  const productData = await createRes.json();
  cachedProductId = productData.id;
  return cachedProductId;
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER: Create installment plan + PayPal billing plan
// ═══════════════════════════════════════════════════════════════════════════════

const createInstallmentPlan = catchAsync(async (req, res, next) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId).populate("tour", "name price");
  if (!booking) return next(new AppError("Booking not found", 404));

  if (
    req.user.role !== "admin" &&
    booking.user.toString() !== req.user.id
  ) {
    return next(new AppError("Not authorized", 403));
  }

  // If the booking already has a plan that hasn't been activated, re-use it
  if (booking.installmentPlan?.planId && !booking.installmentPlan?.isActive) {
    console.log("♻️ Re-using existing installment plan:", booking.installmentPlan.planId);
    return res.status(200).json({
      status: "success",
      data: {
        planId: booking.installmentPlan.planId,
        installmentPlan: {
          totalAmount: booking.installmentPlan.totalAmount,
          upfrontAmount: booking.installmentPlan.upfrontAmount,
          remainingAmount: booking.installmentPlan.remainingAmount,
          numberOfInstallments: booking.installmentPlan.numberOfInstallments,
          installmentAmount: booking.installmentPlan.installmentAmount,
          deadline: booking.installmentPlan.deadline,
          schedule: booking.installmentPlan.schedule,
        },
      },
    });
  }

  // Calculate installment plan
  const plan = calculateInstallmentPlan(
    booking.price.totalPrice,
    booking.startDate,
    booking.price.currency,
    booking.tour?.price?.bookingPercentage || 20
  );

  if (!plan) {
    return next(
      new AppError(
        "Installment plan not available — tour must be at least 90 days away with enough time for 2+ monthly payments",
        400
      )
    );
  }

  // Get PayPal access token
  const accessToken = await getPayPalAccessToken();

  // Ensure product exists
  const productId = await ensurePayPalProduct(accessToken);

  // Create a PayPal billing plan
  const planPayload = {
    product_id: productId,
    name: `Installment Plan — ${booking.bookingReference}`,
    description: `${plan.numberOfInstallments} monthly installments for ${booking.tour?.name || "Tour"} booking`,
    billing_cycles: [
      {
        frequency: { interval_unit: "MONTH", interval_count: 1 },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: plan.numberOfInstallments,
        pricing_scheme: {
          fixed_price: {
            value: plan.installmentAmount.toFixed(2),
            currency_code: plan.currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: {
        value: plan.upfrontAmount.toFixed(2),
        currency_code: plan.currency,
      },
      setup_fee_failure_action: "CANCEL",
      payment_failure_threshold: 3,
    },
  };

  console.log("📦 Creating PayPal billing plan with payload:", JSON.stringify(planPayload, null, 2));

  const planRes = await fetch(`${PAYPAL_BASE}/v1/billing/plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(planPayload),
  });

  if (!planRes.ok) {
    const errText = await planRes.text();
    console.error("❌ PayPal plan creation error:", errText);
    return next(new AppError(`Failed to create PayPal installment plan: ${errText}`, 500));
  }

  const paypalPlan = await planRes.json();
  console.log("✅ PayPal billing plan created:", paypalPlan.id, "status:", paypalPlan.status);

  // Save installment plan to booking
  booking.installmentPlan = {
    isActive: false, // Becomes true after subscription activation
    planId: paypalPlan.id,
    totalAmount: plan.totalAmount,
    upfrontAmount: plan.upfrontAmount,
    remainingAmount: plan.remainingAmount,
    numberOfInstallments: plan.numberOfInstallments,
    installmentAmount: plan.installmentAmount,
    deadline: plan.deadline,
    schedule: plan.schedule,
  };

  await booking.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      planId: paypalPlan.id,
      installmentPlan: plan,
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER: Activate subscription after user approves on PayPal
// ═══════════════════════════════════════════════════════════════════════════════

const activateInstallmentSubscription = catchAsync(async (req, res, next) => {
  const { bookingId, subscriptionId } = req.body;

  if (!subscriptionId) {
    return next(new AppError("Please provide a PayPal subscription ID", 400));
  }

  const booking = await Booking.findById(bookingId)
    .populate("tour", "name slug")
    .populate("user", "name email");

  if (!booking) return next(new AppError("Booking not found", 404));

  if (
    req.user.role !== "admin" &&
    booking.user._id.toString() !== req.user.id
  ) {
    return next(new AppError("Not authorized", 403));
  }

  // Verify subscription with PayPal
  const accessToken = await getPayPalAccessToken();
  const subRes = await fetch(
    `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!subRes.ok) {
    return next(new AppError("Failed to verify PayPal subscription", 400));
  }

  const subData = await subRes.json();

  // Update booking
  booking.installmentPlan.isActive = true;
  booking.installmentPlan.subscriptionId = subscriptionId;

  // Mark upfront payment as paid (setup_fee is charged on activation)
  const upfrontEntry = booking.installmentPlan.schedule.find(
    (s) => s.type === "upfront"
  );
  if (upfrontEntry) {
    upfrontEntry.status = "paid";
    upfrontEntry.paidAt = new Date();
    upfrontEntry.transactionId = `sub_setup_${subscriptionId}`;
  }

  // Update payment info
  booking.payment = {
    method: "paypal",
    status: "partially_paid",
    transactions: [
      ...(booking.payment.transactions || []),
      {
        transactionId: `sub_setup_${subscriptionId}`,
        amount: booking.installmentPlan.upfrontAmount,
        currency: booking.price.currency,
        status: "completed",
        paymentDate: new Date(),
        gateway: "paypal_subscription",
        gatewayResponse: { subscriptionId, type: "setup_fee" },
      },
    ],
    lifetimeDepositApplied: booking.payment.lifetimeDepositApplied || 0,
    lifetimeDepositCodes: booking.payment.lifetimeDepositCodes || [],
  };

  booking.status = "confirmed";
  await booking.save({ validateBeforeSave: false });

  // Send booking confirmation email (regardless of payment plan)
  booking.sendConfirmationEmail();

  // Mark abandoned checkout as completed
  try {
    const AbandonedCheckout = require('../models/AbandonedCheckout');
    await AbandonedCheckout.updateMany(
      { 
        user: booking.user._id || booking.user, 
        tour: booking.tour._id || booking.tour, 
        startDate: booking.startDate, 
        status: 'pending' 
      },
      { status: 'completed' }
    );
  } catch (err) {
    console.error('Failed to update abandoned checkout status:', err.message);
  }

  // Send activation email
  if (booking.user?.email) {
    sendInstallmentActivatedEmail(booking.user.email, {
      bookingReference: booking.bookingReference,
      tourName: booking.tour?.name || "Tour",
      totalAmount: booking.installmentPlan.totalAmount,
      upfrontAmount: booking.installmentPlan.upfrontAmount,
      numberOfInstallments: booking.installmentPlan.numberOfInstallments,
      installmentAmount: booking.installmentPlan.installmentAmount,
      schedule: booking.installmentPlan.schedule,
      currency: booking.price.currency,
    });
  }

  res.status(200).json({
    status: "success",
    data: { booking },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER: Sync installment status from PayPal (poll-based for reliability)
// ═══════════════════════════════════════════════════════════════════════════════

const syncInstallmentStatus = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.bookingId)
    .populate("tour", "name slug")
    .populate("user", "name email");

  if (!booking) return next(new AppError("Booking not found", 404));

  if (
    req.user.role !== "admin" &&
    booking.user._id.toString() !== req.user.id
  ) {
    return next(new AppError("Not authorized", 403));
  }

  if (
    !booking.installmentPlan?.isActive ||
    !booking.installmentPlan?.subscriptionId
  ) {
    return res.status(200).json({
      status: "success",
      data: { booking, synced: false, message: "No active installment plan" },
    });
  }

  const accessToken = await getPayPalAccessToken();
  const subscriptionId = booking.installmentPlan.subscriptionId;

  // Fetch transactions for this subscription from PayPal
  const txnRes = await fetch(
    `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}/transactions?start_time=${new Date(booking.createdAt).toISOString()}&end_time=${new Date().toISOString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!txnRes.ok) {
    // Don't fail — just return current state
    return res.status(200).json({
      status: "success",
      data: { booking, synced: false, message: "Could not reach PayPal" },
    });
  }

  const txnData = await txnRes.json();
  const transactions = txnData.transactions || [];

  // Count completed billing payments (not setup fees)
  const billingPayments = transactions.filter(
    (t) => t.status === "COMPLETED" && t.amount_with_breakdown
  );

  // Update installment schedule based on PayPal transactions
  let updated = false;
  for (let i = 0; i < billingPayments.length; i++) {
    const payment = billingPayments[i];
    const installmentIndex = i + 1; // installment #1 corresponds to first billing cycle

    const scheduleEntry = booking.installmentPlan.schedule.find(
      (s) => s.installmentNumber === installmentIndex && s.status !== "paid"
    );

    if (scheduleEntry) {
      scheduleEntry.status = "paid";
      scheduleEntry.paidAt = new Date(payment.time);
      scheduleEntry.transactionId = payment.id;

      // Add to booking transactions
      const alreadyRecorded = booking.payment.transactions.some(
        (t) => t.transactionId === payment.id
      );

      if (!alreadyRecorded) {
        booking.payment.transactions.push({
          transactionId: payment.id,
          amount: parseFloat(
            payment.amount_with_breakdown?.gross_amount?.value || 0
          ),
          currency: booking.price.currency,
          status: "completed",
          paymentDate: new Date(payment.time),
          gateway: "paypal_subscription",
          gatewayResponse: payment,
        });

        // Send payment email
        if (booking.user?.email) {
          const totalPaid = booking.payment.transactions.reduce(
            (sum, t) => sum + (t.status === "completed" ? t.amount : 0),
            0
          );
          sendInstallmentPaymentEmail(booking.user.email, {
            bookingReference: booking.bookingReference,
            tourName: booking.tour?.name || "Tour",
            installmentNumber: installmentIndex,
            amount: parseFloat(
              payment.amount_with_breakdown?.gross_amount?.value || 0
            ),
            totalPaid,
            totalAmount: booking.installmentPlan.totalAmount,
            remainingAmount: booking.installmentPlan.totalAmount - totalPaid,
            currency: booking.price.currency,
          });
        }
      }

      updated = true;
    }
  }

  // Check if all installments are paid
  const allPaid = booking.installmentPlan.schedule.every(
    (s) => s.status === "paid"
  );
  if (allPaid) {
    booking.payment.status = "paid";
    booking.installmentPlan.isActive = false; // Plan completed
  }

  if (updated || allPaid) {
    await booking.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: "success",
    data: { booking, synced: true },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER: PayPal Webhook handler
// ═══════════════════════════════════════════════════════════════════════════════

const handlePayPalWebhook = catchAsync(async (req, res) => {
  const event = req.body;
  console.log("📩 PayPal Webhook Event:", event.event_type);

  if (event.event_type === "PAYMENT.SALE.COMPLETED") {
    const sale = event.resource;
    const subscriptionId = sale.billing_agreement_id;

    if (!subscriptionId) {
      return res.status(200).json({ received: true });
    }

    // Find booking by subscription ID
    const booking = await Booking.findOne({
      "installmentPlan.subscriptionId": subscriptionId,
    })
      .populate("tour", "name")
      .populate("user", "name email");

    if (!booking) {
      console.log("No booking found for subscription:", subscriptionId);
      return res.status(200).json({ received: true });
    }

    // Find the next unpaid installment
    const nextUnpaid = booking.installmentPlan.schedule.find(
      (s) => s.type === "installment" && s.status !== "paid"
    );

    if (nextUnpaid) {
      nextUnpaid.status = "paid";
      nextUnpaid.paidAt = new Date();
      nextUnpaid.transactionId = sale.id;

      booking.payment.transactions.push({
        transactionId: sale.id,
        amount: parseFloat(sale.amount.total),
        currency: sale.amount.currency,
        status: "completed",
        paymentDate: new Date(),
        gateway: "paypal_subscription",
        gatewayResponse: sale,
      });

      // Check if all paid
      const allPaid = booking.installmentPlan.schedule.every(
        (s) => s.status === "paid"
      );
      if (allPaid) {
        booking.payment.status = "paid";
        booking.installmentPlan.isActive = false;
      }

      await booking.save({ validateBeforeSave: false });

      // Send email
      if (booking.user?.email) {
        const totalPaid = booking.payment.transactions.reduce(
          (sum, t) => sum + (t.status === "completed" ? t.amount : 0),
          0
        );
        sendInstallmentPaymentEmail(booking.user.email, {
          bookingReference: booking.bookingReference,
          tourName: booking.tour?.name || "Tour",
          installmentNumber: nextUnpaid.installmentNumber,
          amount: parseFloat(sale.amount.total),
          totalPaid,
          totalAmount: booking.installmentPlan.totalAmount,
          remainingAmount: booking.installmentPlan.totalAmount - totalPaid,
          currency: booking.price.currency,
        });
      }
    }
  }

  res.status(200).json({ received: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CRON: Check deadlines and handle overdue installments
// ═══════════════════════════════════════════════════════════════════════════════

const checkInstallmentDeadlines = async () => {
  console.log("🔍 Running installment deadline check...");

  const now = new Date();

  // Find bookings with active installment plans whose deadline has passed
  const overdueBookings = await Booking.find({
    "installmentPlan.isActive": true,
    "installmentPlan.deadline": { $lte: now },
    "payment.status": { $ne: "paid" },
    status: { $ne: "cancelled" },
  })
    .populate("tour", "name")
    .populate("user", "name email walletBalance");

  for (const booking of overdueBookings) {
    console.log(
      `⚠️ Deadline passed for booking ${booking.bookingReference}`
    );

    // Check if fully paid (edge case: webhook arrived late)
    const allPaid = booking.installmentPlan.schedule.every(
      (s) => s.status === "paid"
    );

    if (allPaid) {
      booking.payment.status = "paid";
      booking.installmentPlan.isActive = false;
      await booking.save({ validateBeforeSave: false });
      continue;
    }

    // Not fully paid → cancel booking, credit wallet
    const totalPaid = booking.payment.transactions.reduce(
      (sum, t) => sum + (t.status === "completed" ? t.amount : 0),
      0
    );

    // Cancel PayPal subscription
    try {
      const accessToken = await getPayPalAccessToken();
      await fetch(
        `${PAYPAL_BASE}/v1/billing/subscriptions/${booking.installmentPlan.subscriptionId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ reason: "Installment deadline passed" }),
        }
      );
    } catch (err) {
      console.error("Failed to cancel PayPal subscription:", err.message);
    }

    // Credit paid amount to user's wallet
    const user = await User.findById(booking.user._id || booking.user);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + totalPaid;
      // Set wallet expiry to 1 year from now
      user.walletExpiresAt = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      );
      await user.save({ validateBeforeSave: false });
    }

    // Cancel booking
    booking.status = "cancelled";
    booking.installmentPlan.isActive = false;
    booking.cancellation = {
      isCancelled: true,
      cancelledAt: new Date(),
      reason: "Installment payments not completed before 90-day deadline",
      refundAmount: totalPaid,
      refundStatus: "processed", // Credited to wallet
    };
    await booking.save({ validateBeforeSave: false });

    // Send cancellation email
    const userEmail =
      booking.user?.email ||
      (user ? user.email : null);
    if (userEmail) {
      sendInstallmentCancellationEmail(userEmail, {
        bookingReference: booking.bookingReference,
        tourName: booking.tour?.name || "Tour",
        totalPaid,
        walletCredit: totalPaid,
        currency: booking.price.currency,
      });
    }

    console.log(
      `❌ Booking ${booking.bookingReference} cancelled. $${totalPaid} credited to wallet.`
    );
  }

  // Send reminders for upcoming installments (3 days before due date)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const bookingsWithUpcoming = await Booking.find({
    "installmentPlan.isActive": true,
    "installmentPlan.schedule": {
      $elemMatch: {
        status: "pending",
        type: "installment",
        dueDate: { $lte: threeDaysFromNow, $gte: now },
      },
    },
    status: { $ne: "cancelled" },
  })
    .populate("tour", "name")
    .populate("user", "name email");

  for (const booking of bookingsWithUpcoming) {
    const upcomingInstallment = booking.installmentPlan.schedule.find(
      (s) =>
        s.status === "pending" &&
        s.type === "installment" &&
        new Date(s.dueDate) <= threeDaysFromNow &&
        new Date(s.dueDate) >= now
    );

    if (upcomingInstallment && booking.user?.email) {
      sendInstallmentReminderEmail(booking.user.email, {
        bookingReference: booking.bookingReference,
        tourName: booking.tour?.name || "Tour",
        installmentNumber: upcomingInstallment.installmentNumber,
        amount: upcomingInstallment.amount,
        dueDate: upcomingInstallment.dueDate,
        currency: booking.price.currency,
      });
    }
  }

  console.log("✅ Installment deadline check complete.");
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER: Get installment preview (for checkout page)
// ═══════════════════════════════════════════════════════════════════════════════

const getInstallmentPreview = catchAsync(async (req, res) => {
  const { totalAmount, tourStartDate, currency } = req.query;

  if (!totalAmount || !tourStartDate) {
    return res.status(400).json({
      status: "fail",
      message: "totalAmount and tourStartDate are required",
    });
  }

  const plan = calculateInstallmentPlan(
    parseFloat(totalAmount),
    tourStartDate,
    currency || "USD",
    req.query.bookingPercentage ? parseFloat(req.query.bookingPercentage) : 20
  );

  res.status(200).json({
    status: "success",
    data: { plan }, // null if not available
  });
});

module.exports = {
  createInstallmentPlan,
  activateInstallmentSubscription,
  syncInstallmentStatus,
  handlePayPalWebhook,
  checkInstallmentDeadlines,
  getInstallmentPreview,
};

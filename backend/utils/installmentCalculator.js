/**
 * Installment Calculator for Pay-in-Parts feature
 *
 * Rules:
 * - First payment: 25% of total amount (upfront, charged immediately)
 * - Remaining 75%: divided into equal monthly installments
 * - All payments must complete by (tourDate - 90 days)
 * - Minimum 2 months available for installments to be offered
 * - Maximum 12 installments
 * - Rounding differences are absorbed into the upfront amount
 */

const calculateInstallmentPlan = (
  totalAmount,
  tourStartDate,
  currency = "USD"
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tourDate = new Date(tourStartDate);
  tourDate.setHours(0, 0, 0, 0);

  // Deadline: 90 days before tour
  const deadline = new Date(tourDate);
  deadline.setDate(deadline.getDate() - 90);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilDeadline = Math.floor((deadline.getTime() - today.getTime()) / msPerDay);

  // Need at least 60 days (≈2 months) for installments to make sense
  if (daysUntilDeadline < 60) {
    return null;
  }

  // Calculate number of monthly installments from the available time
  const availableMonths = Math.floor(daysUntilDeadline / 30);
  const numberOfInstallments = Math.min(Math.max(availableMonths, 2), 12);

  // Calculate installment amount (floor to avoid overcharging)
  const rawRemaining = totalAmount * 0.75;
  const installmentAmount =
    Math.floor((rawRemaining / numberOfInstallments) * 100) / 100;

  // Total from installments
  const totalFromInstallments = Math.round(installmentAmount * numberOfInstallments * 100) / 100;

  // Upfront absorbs the rounding difference so exact total is maintained
  const upfrontAmount = Math.round((totalAmount - totalFromInstallments) * 100) / 100;

  // Generate the payment schedule
  const schedule = [];

  // Entry 0: Upfront payment (today)
  schedule.push({
    installmentNumber: 0,
    amount: upfrontAmount,
    dueDate: new Date(today),
    type: "upfront",
    status: "pending",
  });

  // Entries 1..N: Monthly installments
  for (let i = 0; i < numberOfInstallments; i++) {
    const dueDate = new Date(today);
    dueDate.setMonth(dueDate.getMonth() + i + 1);

    // Ensure due date doesn't exceed the deadline
    if (dueDate > deadline) {
      dueDate.setTime(deadline.getTime() - msPerDay);
    }

    schedule.push({
      installmentNumber: i + 1,
      amount: installmentAmount,
      dueDate,
      type: "installment",
      status: "pending",
    });
  }

  return {
    totalAmount,
    upfrontAmount,
    remainingAmount: totalFromInstallments,
    numberOfInstallments,
    installmentAmount,
    deadline,
    currency,
    schedule,
  };
};

module.exports = { calculateInstallmentPlan };

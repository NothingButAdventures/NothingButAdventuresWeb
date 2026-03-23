const Booking = require('../models/Booking');
const User = require('../models/User');

exports.checkWalletExpiration = async (userId) => {
    const user = await User.findById(userId);
    if (!user || !user.walletExpiresAt) return;

    if (new Date() > user.walletExpiresAt && user.walletBalance > 0) {
        console.log(`Wallet expired for user ${user.email}. Resetting balance.`);
        user.walletBalance = 0;
        user.walletExpiresAt = undefined;
        await user.save({ validateBeforeSave: false });
        return { expired: true };
    }
    return { expired: false };
};

exports.checkAndApplyWalletRewards = async (userId) => {
    // 1. Count COMPLETED bookings for this user
    const completedCount = await Booking.countDocuments({
        user: userId,
        status: 'completed',
    });

    console.log(`User ${userId} has ${completedCount} completed bookings.`);

    let targetBalance = 0;

    // Rule:
    // 4-9 tours: $100
    // 10-14 tours: $150
    // 15+ tours: $250
    if (completedCount >= 15) {
        targetBalance = 250;
    } else if (completedCount >= 10) {
        targetBalance = 150;
    } else if (completedCount >= 4) {
        targetBalance = 100;
    }

    if (targetBalance > 0) {
        const user = await User.findById(userId);
        if (!user) return;

        // Top-up logic: specifically requested to "top up ... to reach a total".
        // This implies if current is 50, and target is 150, we add 100 to make it 150.
        // Effectively: user.walletBalance = Math.max(user.walletBalance, targetBalance).
        // EXCEPT "Credits cannot be stacked" implies you shouldn't just get free money if you didn't use the previous one?
        // "if a customer ... has $50 ... topped up ... to reach a total of $150".
        // This confirms the logic: NewBalance = TargetBalance (if Target > Current).

        if (user.walletBalance < targetBalance) {
            console.log(
                `Topping up wallet for user ${user.email}. Current: ${user.walletBalance}, Target: ${targetBalance}`
            );
            user.walletBalance = targetBalance;

            // Update expiry to 12 months from now
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            user.walletExpiresAt = nextYear;

            await user.save({ validateBeforeSave: false });
            return { updated: true, newBalance: user.walletBalance };
        }
    }

    return { updated: false };
};

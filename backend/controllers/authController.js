const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { createSendToken } = require("../middleware/auth");
const { checkWalletExpiration } = require("../utils/walletUtils");

const register = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    passwordConfirm,
    phone,
    dateOfBirth,
    nationality,
    role,
  } = req.body;

  // Validate role - only allow user and partner for public registration
  const allowedRoles = ["user", "partner"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    phone,
    dateOfBirth,
    nationality,
    role: userRole,
    isEmailVerified: true, // Skip email verification for now
  });

  createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password +isActive");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Check if user account is active
  if (!user.isActive) {
    return next(
      new AppError(
        "Your account has been deactivated. Please contact support.",
        401,
      ),
    );
  }

  // Send token to client
  createSendToken(user, 200, res);
});

const logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // TODO: Send reset password email
    // await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      status: "success",
      message: "Password reset link sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500,
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Update changedPasswordAt property for the user (done in pre-save middleware)

  // Log the user in, send JWT
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is incorrect.", 401));
  }

  // If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Log user in, send JWT
  createSendToken(user, 200, res);
});

const verifyEmail = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // Verify the user's email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Email verified successfully!",
  });
});

const resendVerificationEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("No user found with that email address", 404));
  }

  if (user.isEmailVerified) {
    return next(new AppError("Email is already verified", 400));
  }

  // Generate new verification token
  const verifyToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verifyToken);

    res.status(200).json({
      status: "success",
      message: "Verification email sent!",
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500,
    );
  }
});

const getMe = catchAsync(async (req, res, next) => {
  // Check for wallet expiration
  await checkWalletExpiration(req.user.id);

  // Re-fetch user to get updated data if needed (though checkWalletExpiration updates the DB, 
  // req.user might be stale if it was attached by protect middleware before this check)
  // However, for simplicity, we can just return the user embedded in req.user if we assume protect attached it freshly.
  // BUT, to be safe, if we just modified it, we might want to return the modified version.
  // Let's just re-fetch to be 100% sure we send the latest state.
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const googleLogin = catchAsync(async (req, res, next) => {
  const { code, redirectUri } = req.body;

  if (!code) {
    return next(new AppError("Please provide an authorization code", 400));
  }

  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri || "http://localhost:3000/auth/callback"
  );

  let payload;
  try {
    // Exchange authorization code for tokens
    const { tokens } = await client.getToken(code);

    // Verify the id_token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    return next(new AppError("Invalid or expired authorization code", 401));
  }

  const { email, name, picture } = payload;

  if (!email) {
    return next(new AppError("Email not provided by Google", 400));
  }

  // Check if user exists
  let user = await User.findOne({ email }).select("+isActive");

  if (!user) {
    // Create user if they don't exist
    const randomPassword = crypto.randomBytes(32).toString("hex");
    user = await User.create({
      name: name || "Google User",
      email,
      password: randomPassword,
      passwordConfirm: randomPassword,
      role: "user",
      isEmailVerified: true,
    });
  } else if (!user.isActive) {
    return next(
      new AppError(
        "Your account has been deactivated. Please contact support.",
        401,
      ),
    );
  }

  // Send token
  createSendToken(user, 200, res);
});

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerificationEmail,
  getMe,
  googleLogin,
};

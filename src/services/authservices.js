import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async ({ name, email, password }) => {
  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) throw new Error("User already exists");

  // Validate password strength
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  // Return user without password
  const userObject = user.toObject();
  delete userObject.password;

  return userObject;
};

export const loginUser = async ({ email, password }) => {
  // Find user and explicitly select password
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) throw new Error("Invalid credentials");

  // Check if account is active
  if (user.accountStatus !== "active") {
    throw new Error("Account is suspended or inactive");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  // Return user without password
  const userObject = user.toObject();
  delete userObject.password;

  return { user: userObject, token };
};
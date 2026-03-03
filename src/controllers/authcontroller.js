import { registerUser, loginUser } from "../services/authservices.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user }
    });
  } catch (error) {
    const statusCode = error.message.includes("already exists") ? 409 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);
    
    // Set HTTP-only cookie for token
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "strict"
    });
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, token }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProfile = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: req.user
  });
};
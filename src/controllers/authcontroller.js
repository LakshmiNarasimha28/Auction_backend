import { registerUser, loginUser } from "../services/authservices.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
    try {
        const { user, token } = await loginUser(req.body);
        res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 60 * 60 * 1000 });
        res.status(200).json({
          success: true,
          message: "Login successful",
          data: user
        });
      } catch (error) {
        res.status(401).json({
          success: false,
          message: error.message
        });
      }
};

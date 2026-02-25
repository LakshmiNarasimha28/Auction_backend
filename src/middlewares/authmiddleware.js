import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
    let token;
    
    // Check for token in cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    // Check for token in Authorization header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

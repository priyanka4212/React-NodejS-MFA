import { Router } from "express";
import passport from "passport";
import { register, login, authStatus, logout , setup2FA, verify2FA, reset2FA  } from "../controllers/authControllers.js";
const router = Router();


// Register route
router.post("/register", register);
// Login route
router.post("/login", passport.authenticate("local")  ,login);
// Auth Status route
router.get("/status", authStatus  );
// Logout route
router.post("/logout", logout);

// 2FA SETUP
router.post("/2fa/setup",(req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
    return res.status(401).json({ message: "Unauthorized user" });
} ,setup2FA);
// 2FA VERIFY
router.post("/2fa/verify", verify2FA);
// reset 2FA
router.post("/2fa/reset", reset2FA);

export default router;


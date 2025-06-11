import bcrypt from "bcryptjs";
import User from "../models/user.js";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import passport from "passport";
import jwt from "jsonwebtoken";

export const register= async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashPassword,
            isMfaActive: false,
        });
        console.log("New user: ", newUser);
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
        
    } catch (error) {
        res.status(500).json({ error : "Error registering user", message:error });
        
    }
};
export const login= async (req, res) => {
    console.log("The authenticated user is: ", req.user);
    res.status(200).json({ message: "User logged in successfully",
         username: req.user.username,
         isMfaActive: req.user.isMfaActive,

     });
};
export const logout= async (req, res) => {
    if(!req.user) return res.status(401).json({ message: "Unauthorized user" });
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "user not logged in" });
        }
        res.status(200).json({ message: "User logged out successfully" });
    });
    
    
};
export const authStatus= async (req, res) => {
    if(req.user){
        res.status(200).json({ message: "User logged in successfully",
            username: req.user.username,
            isMfaActive: req.user.isMfaActive, 
        });
    } else{
        res.status(401).json({ message: "unathorized user" });
    }
};
export const setup2FA= async (req, res) => {
    try {
        console.log("the req.user is: ", req.user);
        const user = req.user;
        var secret = speakeasy.generateSecret();
        console.log("The secret is: ", secret);
        user.twoFactorSecret = secret.base32;
        user.isMfaActive = true;
        await user.save();
        const url = speakeasy.otpauthURL({
            secret: secret.base32,
            label: `${req.user.username}`,
            issuer: "www.priyanka.com",
            encoding: "base32",
        });
        const qrImageUrl = await qrCode.toDataURL(url);
        // console.log("The qr code url is: ", qrImageUrl);
        res.status(200).json({
            
            secret: secret.base32,
           
            qrCode : qrImageUrl,
        });
        
    } catch (error) {
        res.status(500).json({ error : "Error seting up 2FA", message:error });
}
    };
export const verify2FA= async (req, res) => {
    // const { token } = req.body;
    // const user = req.user;

    // const verified = speakeasy.totp.verify({
    //     secret: user.twoFactorSecret,
    //     encoding: "base32",
    //     token,
    //     window: 2,
    // });

    try {
        const { token, username } = req.body;

        const user = await User.findOne({ username });

        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ message: "User or 2FA not configured" });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 2,
        });
    

    if(verified) {
        const jwtToken = jwt.sign(
            {
               
                username: user.username,
               
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({ message: "2FA verified successfully", token: jwtToken });
    } else{
        res.status(401).json({ message: "Invalid token" });
    }
} catch (error) {
    res.status(500).json({ error: "Error verifying 2FA", message: error.message });
}
};
export const reset2FA= async (req, res) => {
    try {
        const user = req.user;
        user.twoFactorSecret = "";
        user.isMfaActive = false;
        await user.save();
        res.status(200).json({ message: "2FA reset successfully" });
       
    } catch (error) {
        res.status(500).json({ error : "Error resetting 2FA", message:error });
        
    }
};

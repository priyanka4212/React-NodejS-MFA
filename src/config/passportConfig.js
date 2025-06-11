import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/user.js";

passport.use(new LocalStrategy(async(username, password, done)=> {
    try {
        const user = await User.findOne({ username});
        if (!user) {
            return done(null, false, { message: "user not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if(isMatch) {
            return done(null, user);
        }
        else return done(null, false, { message: "incorrect password" });    
        
    } catch (error) {
        return done(error);
        
    }


      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));

passport.serializeUser((user, done) => {
    done(null, user._id);   
}
);
passport.deserializeUser(async (_id, done) => {
    try {
        const user = await User.findById(_id);
        done(null, user);
    } catch (error) {
        done(error);
    }
}
);
  
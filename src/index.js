import express, { urlencoded }  from 'express';
import  { json } from 'express';

import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import cors from 'cors';
import dbConnect from './config/db.connect.js';
import authRoutes from './routes/authRoutes.js';
import  './config/passportConfig.js';

dotenv.config();
dbConnect();

const app = express();

// Middleware

const corsOptions = {
    origin : ["http://localhost:3001"],
    credentials : true,
};
app.use(cors(corsOptions));
app.use(json({limit:"100mb"}));
app.use(urlencoded({extended:true,  limit:"100mb"}));
app.use(session({
   secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 600*60,
    }

}));

app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use('/api/auth', authRoutes);

//listen app

const PORT = process.env.PORT || 7002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
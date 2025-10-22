/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
app.use(session({ secret: "azora_secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "demo",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo",
    callbackURL: "http://localhost:5100/auth/google/callback"
  },
  (accessToken, refreshToken, profile, cb) => cb(null, profile)
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Send user profile (in production, issue JWT, etc)
    res.send(`<script>
      window.opener.postMessage(${JSON.stringify(req.user)}, "*");
      window.close();
    </script>`);
  }
);

app.listen(5100, () => console.log("[federated-identity] running on 5100"));

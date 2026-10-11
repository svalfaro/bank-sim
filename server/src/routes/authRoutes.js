import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email']})
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login'}),
    (req, res) => {
    res.redirect('/dashboard'); //if verified -> logged in success -> access to main dashboard
    }
);

/*
 * req.logout() is built into Passport
 * it clears the session and logs the user out
 */

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

export default router;
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';

passport.use(
    new GoogleStrategy(
        {
            clientID: env.google.clientId,
            clientSecret: env.google.clientSecret,
            callbackURL: env.google.callbackUrl,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(null, false, { message: 'No se pudo obtener el email de Google' });
                }

                return done(null, { email });
            } catch (error) {
                console.error('Error en la estrategia de Google:', error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
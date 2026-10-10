import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';

if (env.google.clientId && env.google.clientSecret) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: env.google.clientId,
                clientSecret: env.google.clientSecret,
                callbackURL: env.google.callbackUrl,
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const googleEmail = profile.emails?.find(({ verified }) => verified) || profile.emails?.[0];
                    const email = googleEmail?.value;

                    if (!email) {
                        return done(null, false, { message: 'No se pudo obtener el email de Google' });
                    }

                    return done(null, {
                        email,
                        emailVerified: googleEmail.verified === true,
                        displayName: profile.displayName,
                        givenName: profile.name?.givenName,
                        familyName: profile.name?.familyName,
                    });
                } catch (error) {
                    console.error('Error en la estrategia de Google:', error);
                    return done(error, null);
                }
            }
        )
    );
} else {
    console.warn('[AUTH] Google OAuth no está configurado (falta GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). Inicio de sesión con Google deshabilitado.');
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

// Configurar estrategia de Google OAuth
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                // Extraer email del perfil de Google
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(null, false, { message: 'No se pudo obtener el email de Google' });
                }

                // Pasar el email al callback
                return done(null, { email });
            } catch (error) {
                console.error('Error en la estrategia de Google:', error);
                return done(error, null);
            }
        }
    )
);

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserializar usuario de la sesión
passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;

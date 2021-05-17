const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const FacebookTokenStrategy = require('passport-facebook-token');
//const GoogleStrategy = require('passport-google-oauth20').Strategy;

const config = require('./config.js')

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }, 
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);

/* function extractProfile(profile) {
    let imageUrl = '';
    if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos[0].value;
    }
    return {
    id: profile.id,
    displayName: profile.displayName,
    image: imageUrl,
    };
}

exports.googlePassport = passport.use(
    new GoogleStrategy(
        {
            clientID: config.clientId,
            clientSecret: config.secret,
            callbackURL: config.callback,
            accessType: 'offline',
            userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
        },
        (accessToken, refreshToken, profile, cb) => {
               cb(null, extractProfile(profile));
        }));
        passport.serializeUser((user, cb) => {
                  cb(null, user);
        });
        passport.deserializeUser((obj, cb) => {
                  cb(null, obj);
        }
); */

    
//#3 Set up Passport:
const session       = require('express-session');
const passport      = require('passport');

//#4 Serialization of a User Object:
const ObjectID      = require('mongodb').ObjectID;

//#6 Authentication Strategies:
const LocalStrategy = require('passport-local');

//#12 Hashing your Passwords:
const bcrypt         = require('bcrypt');

module.exports = function(app, db) {

	//#3 Set up Passport:
	app.use(session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
	}));

	//#3 Set up Passport:
	app.use(passport.initialize());
	app.use(passport.session());

	//#4 Serialization of a User Object:
	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	//#4 Serialization of a User Object:
	passport.deserializeUser((id, done) => {
		db.collection('users').findOne({
				_id: new ObjectID(id)
			},
			(err, doc) => {
				done(null, doc);
			}
		);
	});

	//#6 Authentication Strategies:
	passport.use(new LocalStrategy(
		function(username, password, done) {
			db.collection('users').findOne({
				username: username
			}, function(err, user) {
				console.log('User ' + username + ' attempted to log in.');
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false);
				}
				if (!bcrypt.compareSync(password, user.password)) { //#12 Hashing your Passwords.
					return done(null, false);
				}
				return done(null, user);
			});
		}
	));
}
'use strict';

const express = require('express');
const bodyParser = require('body-parser');

//#3 Set up Passport:
const session = require('express-session');
const passport = require('passport');

//#6 Authentication Strategies:
const LocalStrategy = require('passport-local');

//#5 Implement the Serialization of a Passport User:
const mongo = require('mongodb').MongoClient;

//#4 Serialization of a User Object:
const ObjectID = require('mongodb').ObjectID;

const fccTesting = require('./freeCodeCamp/fcctesting.js');

const app = express();

fccTesting(app); //For FCC testing purposes

app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//#3 Set up Passport:
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
}));

//#3 Set up Passport:
app.use(passport.initialize());
app.use(passport.session());

//#1 Set up a Template Engine:
app.set('view engine', 'pug')

//#5 Implement the Serialization of a Passport User:
mongo.connect(process.env.DATABASE, (err, db) => {
	if (err) {
		console.log('Database error: ' + err);
	} else {
		console.log('Successful database connection');

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
					if (password !== user.password) {
						return done(null, false);
					}
					return done(null, user);
				});
			}
		));

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

		//#8: Create New Middleware:
		function ensureAuthenticated(req, res, next) {
			if (req.isAuthenticated()) {
				return next();
			}
			res.redirect('/');
		};

		app.route('/')
			.get((req, res) => {
				res.render(process.cwd() + '/views/pug/index', {
					title: 'Home Page',
					message: 'Please login',
					showLogin: true
				}); //#1 Set up a Template Engine, #2 Use a Template Engine's Powers
			});

		//7: How to use Passport Strategies:
		app.route('/login')
			.post(passport.authenticate('local', {
				failureRedirect: '/' //Redirects back to the signup page if there's an error.
			}), (req, res) => {
				res.redirect('/profile');
			});

		app.route('/profile')
			.get(ensureAuthenticated, (req, res) => { //#8: Create New Middleware.
				res.render(process.cwd() + '/views/pug/profile');
			});

		app.listen(process.env.PORT || 3000, () => {
			console.log("Listening on port " + process.env.PORT);
		});
	}
});
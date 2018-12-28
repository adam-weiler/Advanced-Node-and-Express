//#3 Set up Passport:
const passport      = require('passport');
  
//#12 Hashing your Passwords:
const bcrypt         = require('bcrypt');

module.exports = function(app, db) {
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
				showLogin: true,
				showRegistration: true //#11 Registration of New Users.
			}); //#1 Set up a Template Engine, #2 Use a Template Engine's Powers.
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
			res.render(process.cwd() + '/views/pug/profile', {
				username: req.user.username
			}); //#9 How to Put a Profile Together.
		});

	//#11 Registration of New Users:
	app.route('/register')
		.post((req, res, next) => {
				var hash = bcrypt.hashSync(req.body.password, 12); //#12 Hashing your Passwords.
				db.collection('users').findOne({
					username: req.body.username
				}, function(err, user) {
					if (err) {
						next(err);
					} else if (user) {
						res.redirect('/');
					} else {
						db.collection('users').insertOne({
								username: req.body.username,
								password: hash
							}, //#12 Hashing your Passwords.
							(err, doc) => {
								if (err) {
									res.redirect('/');
								} else {
									next(null, user);
								}
							}
						)
					}
				})
			},
			passport.authenticate('local', {
				failureRedirect: '/'
			}),
			(req, res, next) => {
				res.redirect('/profile');
			}
		);

	//#10 Logging a User Out:
	app.route('/logout')
		.get((req, res) => {
			req.logout();
			res.redirect('/');
		});

	//#10 Logging a User Out:
	app.use((req, res, next) => {
		res.status(404)
			.type('text')
			.send('Not Found');
	});
}
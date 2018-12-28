'use strict';

const express       = require('express');
const bodyParser    = require('body-parser');
const fccTesting    = require('./freeCodeCamp/fcctesting.js');

//#5 Implement the Serialization of a Passport User:
const mongo         = require('mongodb').MongoClient;

//#13: Clean up your Project with Modules:
const routes = require('./routes.js');
const auth = require('./auth.js');

const app = express();

fccTesting(app); //For FCC testing purposes

app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

//#1 Set up a Template Engine:
app.set('view engine', 'pug')

//#5 Implement the Serialization of a Passport User:
mongo.connect(process.env.DATABASE, (err, db) => {
	if (err) {
		console.log('Database error: ' + err);
	} else {
		console.log('Successful database connection');

		//#13: Clean up your Project with Modules:
		auth(app, db);
		routes(app, db);

		app.listen(process.env.PORT || 3000, () => {
			console.log("Listening on port " + process.env.PORT);
		});
	}
});
'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');

//#3 Set up Passport:
const session  = require('express-session');
const passport  = require('passport');

const app = express();



//#4 Serialization of a User Object:
const ObjectID = require('mongodb').ObjectID;
//new ObjectID(id);

//#5 Implement the Serialization of a Passport User:
const mongo = require('mongodb').MongoClient;



fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//#1 Set up a Template Engine:
app.set('view engine', 'pug')

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






//#5 Implement the Serialization of a Passport User:
mongo.connect(process.env.DATABASE, (err, db) => {
    if(err) {
        console.log('Database error: ' + err);
    } else {
        console.log('Successful database connection');

        //serialization and app.listen
        //#4 Serialization of a User Object:
        passport.deserializeUser((id, done) => {
                db.collection('users').findOne(
                    {_id: new ObjectID(id)},
                    (err, doc) => {
                        done(null, doc);
                    }
                );
            });
}});




app.route('/')
  .get((req, res) => {
    res.render(process.cwd() + '/views/pug/index', {title: 'Hello', message: 'Please login'}); //#1 Set up a Template Engine, #2 Use a Template Engine's Powers
  });

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});

/*********************************************************************************************************
*	App.js : gateway of the application, handles requirements, tools and resources that need to be used.
*   Author: Constant Pagoui.
*	Date: 03-01-2023
*	Copyright: MosalaPro TM
*
**********************************************************************************************************/

//------------------REQUIREMENTS & TOOLS ------------------------------//

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const UserModel = require(__dirname+"/models/user");

const compression = require("compression");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const MongoStore = require('connect-mongo');

// const emailValidator = required("email-validator");

//------------------DATABASE CONNECTION ------------------------------//
dbConnected = false;
const connectDB = async(DBURI) => { 
	await mongoose.connect(DBURI, {
		useNewUrlParser:true,
		useUnifiedTopology: true,
		family:4
	}).then(success=>{
		dbConnected = true;
		console.log("APP:: Successfully connected to the database.");
		return true;
	}).catch(err=>{console.log("APP:: Error occured while connecting to the database.\n"+err);
		return false;
	});
};

//------------------GENERAL CONFIGURATION ------------------------------//


const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook");

const app = express();

mongoose.set('strictQuery', false);

app.use(express.static("public"));
app.use(express.json());
app.use(compression());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use("/photo", express.static("uploads"));
app.use("/files", express.static("postAttachements"));

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		maxAge: 1000 * 3600 * 24 * 365
	},
	store: MongoStore.create({
		mongoUrl: process.env.DBURI,
		autoRemove: 'interval',
		autoRemoveInterval: 10, // In minutes. Default
		crypto: {
			secret: process.env.SESSION_SECRET,
		  },
		
	  })
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(UserModel.authenticate()));

passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());
//passport.use(UserModel.createStrategy()); 

// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   UserModel.findById(id, function(err, user) {
//     done(err, user);
//   });
// });

passport.use(new GoogleStrategy ({
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	callbackURL: process.env.GOOGLE_CALLBACK_URL,
	userProfileURL: process.env.GOOGLE_PROFILE_URL
},
	function(accessToken, refreshToken, profile, cb){
		console.log(profile);

		UserModel.findOne({google_id: profile.id}, function(err, existingUser){
			if(existingUser){
				return cb(err, existingUser);
			}else{
				var newUser = new UserModel({
					google_id : profile.id,
					photo : profile.photos[0].value,
					email : profile.email,
					display_name : profile.displayName,
					username: profile.email,
					firstName: profile._json.given_name,
					lastName: profile._json.family_name,
					createdAt: new Date(),
					lastUpdate: new Date()
				}).save(function(err,newUser){
					if(err) throw err;
					return cb(err, newUser);
				});
			}
		});

	})

);

passport.use(new FacebookStrategy({
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL,
	profileFields: ['id', 'displayName', 'link', 'name', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
	  console.log(profile);
	UserModel.findOne({facebook_id: profile.id}, function(err, existingUser){
		if(existingUser){
			return cb(err, existingUser);
		}else{
			var newUser = new UserModel({
				facebook_id : profile.id,
				photo : profile.photos[0].value,
				email : profile.email,
				display_name : profile.displayName,
				username: profile.email,
				firstName: profile._json.first_name,
				lastName: profile._json.last_name,
				facebookProfileLink:  "https://www.facebook.com/profile.php?"+profile.id,
				createdAt: new Date(),
				lastUpdate: new Date()
			}).save(function(err,newUser){
				if(err) throw err;
				return cb(err, newUser);
			});
		}
	});
   
  }
));


app.get("/auth/google",
	passport.authenticate("google", {scope: ["profile"]}));
	
app.get("/auth/google/mosalapro", 
	passport.authenticate("google", {failureRedirect: "/"}), function(req, res){
		if(!req.user.email)
			res.redirect('/profile');
		else res.redirect('/');
	});
	
app.get("/auth/facebook",
  passport.authenticate("facebook"));

app.get('/auth/facebook/mosalapro',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
	console.log("successful FB");
	if(!req.user.email)
    	res.redirect('/profile');
	else res.redirect('/');
});

require('./api-routes/routes')(app);


//------------------STARTING UP SERVER------------------------------//

const start = async () => {
    try {
        await connectDB(process.env.DBURI).then(async function (success) {
			app.listen(process.env.PORT || 3000, function() {
			console.log("APP:: Server successfully started online and locally on port 3000");
			});
		}).catch(function (error) {console.log("APP:: Error"+error);});
		
	}catch(error) {console.log("APP:: Error occured while connecting to the db: "+error);}
};

start();


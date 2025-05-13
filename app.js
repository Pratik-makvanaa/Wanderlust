if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}
const Listing = require('./models/listing')
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")

const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js");
const { showListing } = require('./controllers/listing.js');
const { error } = require('console');

// const dbUrl = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

mongoose.connect('mongodb+srv://pratik-project:sgEdhO3YRezcdiwG@cluster0.uopzkeq.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas");
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err.message);
    });


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}
app.get("/", (req, res) => {
    res.redirect("/listings");
});


app.use(session(sessionOptions))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next()
})

app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter)


// app.get('/listings', async(req,res) => {
//     const searchQuery = req.query.query;
//     try{
//         const results = await Listing.find({
//             title: {$regex: searchQuery, $options: 'i'}
//     });
//     res.render('listings', {results, searchQuery})
//     }catch(err) {
//         console.error(err);
//         res.status(500).send("someting went wrong")
//     }
// });

app.listen(8080, () => {
    console.log("server running on port 8080");
})


// app.all("*", (req,res,next) => {
//     next(new ExpressError(404, "Page not found"))
// });

// app.use((err, req, res, next) => {
//     let { statusCode = 500, message = "Something went Wrong!"} = err;
//     res.status(statusCode).render("error.ejs", {message})
// })


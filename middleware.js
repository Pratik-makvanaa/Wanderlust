const Listing = require("./models/listing")
const Review = require("./models/review")
const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema  } = require("./schema.js");

module.exports.isLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl
        req.flash("error", "you must be logged in. ")
        return res.redirect("/login")
    }
    next()
}

module.exports.saveRedirectUrl = (req,res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next()
}

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id)
    if(!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to edit")
        res.redirect(`/listings/${id}`)
    }
    next()
}

// Validate Listing Middleware
module.exports.validateListing = async (req, res, next) => {
    let { error } = listingSchema.validate(req.body); // Validate directly against schema
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // Throwing a custom error if validation fails
    } else {
        next(); // Proceed to the next middleware if validation passes
    }
};


//validate review middleware
module.exports.validateReview = async (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}; 

//for review authorization 
module.exports.isReviewAuthor = async (req,res,next) => {
    let {id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to edit")
        return res.redirect(`/listings/${id}`)
    }
    next()                              
}
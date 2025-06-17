const Listing = require('./models/listing.js');
const ExpressError = require('./utils/ExpressError.js');
const { reviewSchema, listingSchema } = require("./schema.js");
const Review = require('./models/review.js');

//check if user not logged in then redirect to the login page(authentication).
module.exports.isLoggedIn = (req, res, next) =>{
  // console.log(req.path);
  if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect('/login');
  }
  next();
};  

//redirect the page where you are
module.exports.saveRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
    // console.log(res.locals.redirectUrl);
  }
  next();
};

//check logged in user and listing owner
module.exports.isOwner = async (req, res, next) =>{
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash('error', "You are not the owner of this listing.");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

// Backend( Server Side ) Validation for Listings.
module.exports.validateListing = (req, res, next) =>{
  let { error } = listingSchema.validate(req.body);
  
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); 
  } else {
    next();
  }
}

// Backend( Server Side ) Validation for review.
module.exports.validateReview = (req, res, next) =>{
  let { error } = reviewSchema.validate(req.body);
  
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); 
  } else {
    next();
  }
};

//authorization for reviews
module.exports.isReviewAuthor = async (req, res, next) =>{
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if(!review.author.equals(res.locals.currUser._id)){
    req.flash('error', "You are not the Author of this review.");
    return res.redirect(`/listings/${id}`);
  }
  next();
}
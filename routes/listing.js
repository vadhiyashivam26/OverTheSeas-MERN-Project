const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");  
const {isLoggedIn, isOwner, validateListing} = require('../middleware.js');
const multer = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({storage});


const listingController = require('../controllers/listing.js');

//Listing model.

//allListing , createListing routes.
router.route("/")
    .get( validateListing, wrapAsync(listingController.index))
    .post( isLoggedIn, validateListing, upload.single('listing[image]'), wrapAsync( listingController.createListing ))
    
// search listings    
router.get("/search", wrapAsync(listingController.searchListing));

//New route ( New Listing )
router.get("/new", validateListing, isLoggedIn, listingController.renderNewForm);

//show, update, delete routes.    
router.route('/:id')
    .get(wrapAsync( listingController.showListings ))    
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync( listingController.updateListing ))
    .delete(isLoggedIn, isOwner, wrapAsync( listingController.destroyListing ));

//Edit route
router.get("/:id/edit", validateListing, isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
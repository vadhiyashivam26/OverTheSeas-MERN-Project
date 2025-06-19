const Listing = require('../models/listing');

module.exports.index = async (req, res) =>{
  let allListings = await Listing.find({});
  allListings = allListings.map(listing => {
    const listingObj = listing.toObject(); // convert mongoose doc to plain object
    listingObj.priceWithTax = Math.round(listing.price * 1.18); // 18% GST
    return listingObj;
  });
  res.render("listings/index.ejs", { allListings });
};

module.exports.searchListing = async (req, res) => {
  const { search } = req.query;

  let listings = await Listing.find({
    $or:[
      {title: { $regex: search, $options: "i" }},
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ]
  });

  // Add priceWithTax to each listing
  listings = listings.map((listing) => {
    const price = listing.price || 0;
    const tax = 0.18 * price;
    const listings = listing.toObject();
    listings.priceWithTax = Math.round(price + tax);
    return listings;
  });

  res.render("listings/index.ejs", { allListings: listings });
};


module.exports.renderNewForm =  (req, res) =>{
  res.render("listings/new.ejs");
};



module.exports.showListings = async (req, res) =>{
  let { id } = req.params;
  const listing = await Listing.findById(id).populate( { path: "reviews", populate: { path: 'author' } }).populate('owner'); 
  if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};


module.exports.createListing = async (req, res) =>{
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  
  newListing.owner = req.user._id;
  newListing.image = {url, filename};
  
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) =>{
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash('error', "You don't have permission to edit");
    return res.redirect(`/listings/${id}`);
  }
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  
  if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = {url, filename};

    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) =>{
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
 
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
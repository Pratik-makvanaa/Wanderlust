const Listing = require("../models/listing.js") 

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}; 


module.exports.renderNewForm = async (req,res) => {
    res.render("listings/new.ejs")
}


module.exports.showListing = async (req, res) => {
        try {
            let { id } = req.params;
            const listing = await Listing.findByIdAndUpdate(req.params.id)
            .populate({path: "reviews", populate: {
                path: "author",
            }
        })
            .populate("owner");
            if(!listing) {
                req.flash("error", "Listing your requested does not exist!")
                res.redirect("/listings")
            }
            console.log(listing);
            res.render("listings/show.ejs", { listing });
        } catch (err) {
            console.error("Error fetching listing:", err);
            res.status(500).send("Internal Server Error");
        }
    }



module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing); 
    newListing.owner = req.user._id;
    newListing.image = {url, filename}
    await newListing.save();
    req.flash("success", "New listing created")
    res.redirect(`/listings`);
}


module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing your requested does not exist!")
        res.redirect("/listings")
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if (typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "listing Updated")
    res.redirect(`/listings/${id}`);
}


module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing)
    req.flash("success", "Listing Deleted")
    if (!deletedListing) return res.status(404).send("Listing not found");
    res.redirect("/listings");
}
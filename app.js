require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");

const MONGO_URL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wanderlust";
const PORT = process.env.PORT || 8080;

async function connectWithRetry() {
    let retries = 5;
    while (retries > 0) {
        try {
            await mongoose.connect(MONGO_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 30000,
            });
            console.log("Connected to MongoDB");
            return;
        } catch (err) {
            retries -= 1;
            console.log(`MongoDB Connection Error: ${err}. Retries left: ${retries}`);
            if (retries === 0) {
                console.log("Exhausted retries. Exiting...");
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.redirect("/listings");
});
//index route
app.get("/listings", async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings})
})

//new route
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs")
})

//show route
app.get("/listings/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing})
})

//create Route
app.post("/listings", async (req,res) => {
    const newListings = new Listing(req.body.listing)
    await newListings.save()
    res.redirect("/listings")
})

//Edit route
app.get("/listings/:id/edit", async (req,res) => {
    let { id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing})
})

//update route
app.put("/listings/:id", async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing})
    res.redirect("/listings")
})

//delete
app.delete("/listings/:id",async (req,res) => {
    let {id} = req.params
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing)
    res.redirect("/listings")
})

//Reviews
//POST Route
// app.post("/listigs/:id/reviews", async (req,res) => {
//     let listing = await Listing.findById(req.params.id)
//     let newReview = new Review(req.body.review)
//     listing.reviews.push(newReview)
//     await newReview.save();
//     await listing.save()

//     console.log("new review saved"); 
//     res.send("new review saved")
// })

// app.get('/listings', (req, res) => {
//     res.render('listings', { sampleListings });
// });


// Test route to insert a sample listing
// app.get("/testlisting", async (req,  res) => {
//     try {
//         let sampleListing = new Listing({
//             title: "Rock Villa",
//             description: "Near the beach",
//             price: 1500,
//             location: "Goa",
//             country: "India",
//         });
//         await sampleListing.save();
//         console.log("Sample listing saved!");
//         res.send("Sample listing saved successfully!");
//     } catch (error) {
//         console.error("Error saving listing:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });

// Start the server
app.listen(8080, () => {
    console.log("Server running on http://localhost:8080");
});

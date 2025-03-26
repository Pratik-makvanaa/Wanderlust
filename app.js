const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");

require("dotenv").config();

// const PORT = process.env.PORT || 8080;  // Use default 8080 if PORT is undefined
const PORT = process.env.PORT || 10000; 
const dbUrl = process.env.ATLASDB_URL;

async function connectDB() {
    try {
        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 30000, // 30s timeout
            bufferCommands: false, // Disable buffering
        });
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Stop the app if DB connection fails
    }
}

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Ensure database connection before fetching listings
app.get("/listings", async (req, res) => {
    try {
        await mongoose.connection.asPromise();  // Ensure DB is connected
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Internal Server Error");
    }
});

// New listing form
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Show a specific listing
app.get("/listings/:id", async (req, res) => {
    try {
        await mongoose.connection.asPromise();
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) return res.status(404).send("Listing not found");
        res.render("listings/show.ejs", { listing });
    } catch (err) {
        console.error("Error fetching listing:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Create a new listing
app.post("/listings", async (req, res) => {
    try {
        await mongoose.connection.asPromise();
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    } catch (err) {
        console.error("Error creating listing:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Edit listing form
app.get("/listings/:id/edit", async (req, res) => {
    try {
        await mongoose.connection.asPromise();
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) return res.status(404).send("Listing not found");
        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        console.error("Error fetching listing for edit:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Update a listing
app.put("/listings/:id", async (req, res) => {
    try {
        await mongoose.connection.asPromise();
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect("/listings");
    } catch (err) {
        console.error("Error updating listing:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Delete a listing
app.delete("/listings/:id", async (req, res) => {
    try {
        await mongoose.connection.asPromise();
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        if (!deletedListing) return res.status(404).send("Listing not found");
        console.log("Deleted:", deletedListing);
        res.redirect("/listings");
    } catch (err) {
        console.error("Error deleting listing:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Start the server
const server =app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
server.keepAliveTimeout = 120000; // 120 seconds
server.headersTimeout = 120000; // 120 seconds


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

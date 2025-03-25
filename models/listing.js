const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        alt: String
    },
    price: Number,
    country: [String],
    location: String,   
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

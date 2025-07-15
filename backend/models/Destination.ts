import mongoose from "mongoose";

const DestinationSchema = new mongoose.Schema({
    title: String,
    location: String,
    rooms: Number,
    bathrooms: Number,
    price: Number,
    description: String,
    image: String,
    place_images: [String],
    rating: Number,
    coordinates: {
        latitude: Number,
        longitude: Number,
    },
    pool: Boolean,
});

const Destination = mongoose.model("Destination", DestinationSchema);

export default Destination;

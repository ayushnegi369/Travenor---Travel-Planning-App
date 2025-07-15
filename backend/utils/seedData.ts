import mongoose from "mongoose";
import Destination from "../models/Destination";

const DESTINATIONS = [
    {
        id: "1",
        title: "The Villa",
        location: "Educt Street, Yogyakarta, Central Java",
        rooms: 4,
        bathrooms: 4,
        price: 350,
        description:
            "The Villa offers a luxurious stay with panoramic rice field views, contemporary interiors, and a private pool. Perfect for families or groups seeking peace, relaxation, and comfort in the heart of Yogyakarta.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        place_images: [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            "https://images.unsplash.com/photo-1613977257363-707ba9348226",
            "https://images.unsplash.com/photo-1600585153972-21c1c265dfd7",
        ],
        rating: 4.8,
        coordinates: {
            latitude: -7.7956,
            longitude: 110.3695,
        },
        pool: true,
    },
    {
        id: "2",
        title: "The Britania",
        location: "Sunset Blvd, Bali, Indonesia",
        rooms: 3,
        bathrooms: 2,
        price: 275,
        description:
            "The Britania combines Balinese charm with modern design. Located close to famous beaches and restaurants, this villa features tropical gardens, a sun deck, and a relaxing plunge pool.",
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
        place_images: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b000",
            "https://images.unsplash.com/photo-1580587771525-78b9dba3c123",
        ],
        rating: 4.5,
        coordinates: {
            latitude: -8.68,
            longitude: 115.165,
        },
        pool: true,
    },
    {
        id: "3",
        title: "Platinum House",
        location: "Kuta Street, Bali",
        rooms: 5,
        bathrooms: 3,
        price: 420,
        description:
            "Platinum House offers a premium stay for large groups. With elegant furnishings, spacious bedrooms, and a gourmet kitchen, it’s an ideal location near Kuta’s vibrant nightlife.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
        place_images: [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            "https://images.unsplash.com/photo-1502673530728-f79b4cab31b1",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
        ],
        rating: 4.9,
        coordinates: {
            latitude: -8.709,
            longitude: 115.167,
        },
        pool: true,
    },
    {
        id: "4",
        title: "Seaside Escape",
        location: "Lombok Beach, West Nusa Tenggara",
        rooms: 3,
        bathrooms: 2,
        price: 310,
        description:
            "Overlooking the pristine beach of Lombok, Seaside Escape provides a quiet and rejuvenating retreat. The villa is equipped with a beachfront pool and wooden decks for stunning sunset views.",
        image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
        place_images: [
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775cd",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ee",
        ],
        rating: 4.7,
        coordinates: {
            latitude: -8.65,
            longitude: 116.3249,
        },
        pool: true,
    },
    {
        id: "5",
        title: "Jungle Retreat",
        location: "Ubud Forest, Bali",
        rooms: 2,
        bathrooms: 1,
        price: 225,
        description:
            "Nestled in the lush forests of Ubud, Jungle Retreat is perfect for nature lovers. Featuring eco-friendly design and breathtaking greenery, this villa promotes serenity and mindfulness.",
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
        place_images: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
            "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6",
            "https://images.unsplash.com/photo-1560343090-f0409e92791a",
        ],
        rating: 4.6,
        coordinates: {
            latitude: -8.5069,
            longitude: 115.2625,
        },
        pool: false,
    },
    {
        id: "6",
        title: "Skyline Loft",
        location: "Jakarta City Center",
        rooms: 2,
        bathrooms: 2,
        price: 290,
        description:
            "Skyline Loft is a modern city escape located in Jakarta’s business district. Perfect for business travelers or couples, it features skyline views, a rooftop pool, and 24/7 service.",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
        place_images: [
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            "https://images.unsplash.com/photo-1600585154432-4323a9c9c9ff",
        ],
        rating: 4.3,
        coordinates: {
            latitude: -6.2088,
            longitude: 106.8456,
        },
        pool: true,
    },
    {
        id: "7",
        title: "Cliffside Haven",
        location: "Nusa Penida, Bali",
        rooms: 3,
        bathrooms: 2,
        price: 330,
        description:
            "Perched on the cliffs of Nusa Penida, Cliffside Haven features awe-inspiring ocean views, minimalist interiors, and private terraces. A peaceful escape from the bustling mainland.",
        image: "https://images.unsplash.com/photo-1505691723518-36a1f1e72305",
        place_images: [
            "https://images.unsplash.com/photo-1505691723518-36a1f1e72305",
            "https://images.unsplash.com/photo-1505691723518-36a1f1e72300",
            "https://images.unsplash.com/photo-1505691723518-36a1f1e72309",
        ],
        rating: 4.8,
        coordinates: {
            latitude: -8.727,
            longitude: 115.5444,
        },
        pool: true,
    },
    {
        id: "8",
        title: "Heritage House",
        location: "Malang, East Java",
        rooms: 4,
        bathrooms: 3,
        price: 265,
        description:
            "Blending colonial architecture with modern comforts, Heritage House provides a unique stay in historic Malang. Ideal for cultural explorers and families alike.",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        place_images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c751",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c752",
        ],
        rating: 4.4,
        coordinates: {
            latitude: -7.9839,
            longitude: 112.6214,
        },
        pool: false,
    },
    {
        id: "9",
        title: "Island Nook",
        location: "Gili Trawangan",
        rooms: 1,
        bathrooms: 1,
        price: 180,
        description:
            "A cozy private bungalow on the stunning island of Gili Trawangan. Ideal for solo travelers or couples. White sands, turquoise water, and total relaxation await.",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
        place_images: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c000",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c111",
        ],
        rating: 4.2,
        coordinates: {
            latitude: -8.3518,
            longitude: 116.0383,
        },
        pool: false,
    },
    {
        id: "10",
        title: "Infinity Blue",
        location: "Jimbaran Bay, Bali",
        rooms: 5,
        bathrooms: 4,
        price: 500,
        description:
            "Infinity Blue redefines luxury with its stunning infinity pool overlooking Jimbaran Bay. Perfect for special occasions, it offers unmatched privacy, elegance, and high-end amenities.",
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156",
        place_images: [
            "https://images.unsplash.com/photo-1494526585095-c41746248156",
            "https://images.unsplash.com/photo-1494526585095-c41746248157",
            "https://images.unsplash.com/photo-1494526585095-c41746248158",
        ],
        rating: 5.0,
        coordinates: {
            latitude: -8.7924,
            longitude: 115.1608,
        },
        pool: true,
    },
];

export default async function seed() {
    try {
        // await mongoose.connect(MONGO_URI);
        await Destination.insertMany(DESTINATIONS);
        console.log("✅ Destinations seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding data:", err);
        process.exit(1);
    }
}

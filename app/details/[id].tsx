import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
// import useUserStore from "../../store/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DESTINATIONS } from "../tabs/DESTINATIONS";
import { WebView } from "react-native-webview";

const images = [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1598928506311-7a5f5c471b6d?auto=format&fit=crop&w=800&q=60",
];

// Define the Destination type
interface Destination {
    _id: string;
    title: string;
    location: string;
    rooms: number;
    bathrooms: number;
    price: number;
    description: string;
    image: string;
    place_images: string[];
    rating?: number;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    pool?: boolean;
}

// =========================
// Destination Details Screen
// - Displays detailed information about a selected destination
// - Fetches destination data by ID
// - Supports navigation back to previous screen
// =========================

const DetailsScreen = () => {
    const [jwtToken, setJwtToken] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("userData");
                const user = jsonValue != null ? JSON.parse(jsonValue) : null;
                const token = user?.jwtToken;
                setJwtToken(token);
                setUsername(user?.username || "");
                setEmail(user?.email || "");
                if (!token) {
                    router.push("/auth/signin");
                }
            } catch (e) {
                console.error("Error reading user data", e);
                router.push("/auth/signin");
            }
        };

        checkAuth();
    }, [jwtToken]);

    const { id } = useLocalSearchParams();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [page, setPage] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchDestination = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `http://10.0.2.2:3000/destination/${id}`
                );
                if (!res.ok) throw new Error("Not found");
                const data: Destination = await res.json();
                setDestination(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDestination();
    }, [id]);

    const handleLike = async () => {
        if (!email || !destination?.title) return;
        try {
            const res = await fetch("http://10.0.2.2:3000/user/favorite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, title: destination.title }),
            });
            const data = await res.json();
            if (res.ok) {
                setLiked(true);
            } else {
                // Optionally show error
                alert(data.error || "Failed to add to favorites");
            }
        } catch (err) {
            alert("Failed to add to favorites");
        }
    };

    if (loading)
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator size="large" color="#007bff" />
            </SafeAreaView>
        );
    if (error || !destination)
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>{error || "Not found"}</Text>
            </SafeAreaView>
        );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconCircle}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={20} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detail Places</Text>
                <TouchableOpacity
                    style={styles.iconCircle}
                    onPress={handleLike}
                >
                    <Ionicons
                        name={liked ? "heart" : "heart-outline"}
                        size={20}
                        color={liked ? "red" : "black"}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Image Carousel */}
                <PagerView
                    style={styles.pagerView}
                    initialPage={0}
                    onPageSelected={(e) => setPage(e.nativeEvent.position)}
                >
                    {destination.place_images &&
                    destination.place_images.length > 0 ? (
                        destination.place_images.map(
                            (img: string, idx: number) => (
                                <View key={idx} style={styles.imageWrapper}>
                                    <Image
                                        source={{ uri: img }}
                                        style={styles.image}
                                    />
                                    <View style={styles.pagination}>
                                        {destination.place_images.map(
                                            (_: string, i: number) => (
                                                <View
                                                    key={i}
                                                    style={[
                                                        styles.dot,
                                                        i === page &&
                                                            styles.activeDot,
                                                    ]}
                                                />
                                            )
                                        )}
                                    </View>
                                </View>
                            )
                        )
                    ) : (
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: destination.image }}
                                style={styles.image}
                            />
                        </View>
                    )}
                </PagerView>

                {/* Title & Rating */}
                <View style={styles.titleContainer}>
                    <View>
                        <Text style={styles.placeTitle}>
                            {destination.title}
                        </Text>
                        <Text style={styles.placeLocation}>
                            {destination.location}
                        </Text>
                    </View>
                    <View style={styles.ratingPill}>
                        <Ionicons name="star" color="gold" size={14} />
                        <Text style={styles.ratingText}>
                            {destination.rating || "4.9"}
                        </Text>
                    </View>
                </View>

                {/* Info Pills */}
                <View style={styles.infoPillsContainer}>
                    <View style={styles.infoPill}>
                        <Ionicons name="bed-outline" size={14} color="#000" />
                        <Text style={styles.infoPillText}>
                            {destination.rooms} Rooms
                        </Text>
                    </View>
                    <View style={styles.infoPill}>
                        <Ionicons name="water-outline" size={14} color="#000" />
                        <Text style={styles.infoPillText}>
                            {destination.bathrooms} Bathrooms
                        </Text>
                    </View>
                    {destination.pool && (
                        <View style={styles.infoPill}>
                            <Ionicons
                                name="layers-outline"
                                size={14}
                                color="#000"
                            />
                            <Text style={styles.infoPillText}>Pool</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>
                        {destination.description}
                    </Text>
                </View>

                {/* Map and Status */}
                <View style={styles.viewPlaceContainer}>
                    <Text style={styles.sectionTitle}>View Place</Text>
                    <Text style={styles.openNow}>Open Now</Text>
                </View>
                <View
                    style={[styles.mapCard, { overflow: "hidden", padding: 0 }]}
                >
                    <WebView
                        style={{
                            width: "100%",
                            height: "100%",
                            minHeight: 180,
                        }}
                        originWhitelist={["*"]}
                        source={{
                            html: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
                                <style>html, body, #map { height: 100%; margin: 0; padding: 0; } #map { height: 100%; width: 100vw; }</style>
                            </head>
                            <body>
                                <div id="map"></div>
                                <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
                                <script>
                                    var lat = ${
                                        destination.coordinates?.latitude || 0
                                    };
                                    var lng = ${
                                        destination.coordinates?.longitude || 0
                                    };
                                    var map = L.map('map').setView([lat, lng], 15);
                                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                        maxZoom: 19,
                                    }).addTo(map);
                                    var marker = L.marker([lat, lng]).addTo(map);
                                </script>
                            </body>
                            </html>
                        `,
                        }}
                    />
                </View>
            </ScrollView>

            {/* Fixed Bottom Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.priceBlock}>
                    <Text style={styles.priceLabel}>Price</Text>
                    <View
                        style={{ flexDirection: "row", alignItems: "baseline" }}
                    >
                        <Text style={styles.priceText}>
                            ${destination.price}{" "}
                        </Text>
                        <Text style={styles.nightText}>/night</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => router.push(`/schedule/${destination._id}`)}
                >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default DetailsScreen;

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    iconCircle: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        padding: 8,
    },
    headerTitle: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#000",
    },
    pagerView: {
        height: 250,
    },
    imageWrapper: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 250,
    },
    pagination: {
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#ccc",
        margin: 4,
    },
    activeDot: {
        backgroundColor: "#fff",
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    placeTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    placeLocation: {
        fontSize: 12,
        color: "gray",
    },
    ratingPill: {
        backgroundColor: "#f0f0f0",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    ratingText: {
        marginLeft: 4,
        fontWeight: "bold",
        fontSize: 14,
    },
    infoPillsContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 12,
    },
    infoPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    infoPillText: {
        fontWeight: "bold",
        marginLeft: 4,
    },
    descriptionSection: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#eee",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 6,
    },
    descriptionText: {
        fontSize: 14,
        color: "gray",
    },
    viewPlaceContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    openNow: {
        color: "#007bff",
        fontWeight: "bold",
    },
    mapCard: {
        height: 180,
        backgroundColor: "#e0e0e0",
        marginHorizontal: 16,
        borderRadius: 10,
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderTopWidth: 1,
        borderColor: "#eee",
    },
    priceBlock: {},
    priceLabel: {
        color: "gray",
        fontSize: 12,
    },
    priceText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },
    nightText: {
        color: "gray",
        fontSize: 12,
    },
    bookButton: {
        backgroundColor: "#007bff",
        paddingVertical: 12,
        paddingHorizontal: 54,
        borderRadius: 30,
    },
    bookButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});

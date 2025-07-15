import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import useUserStore from "../../store/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { WebView } from "react-native-webview";
// @ts-ignore
import RazorpayCheckout from "react-native-razorpay";

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
    place_images?: string[];
    rating?: number;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    pool?: boolean;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const RAZORPAY_KEY_ID = "rzp_test_mkEE4UHeY1n5nN";

const ScheduleScreen = () => {
    const { id } = useLocalSearchParams();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [email, setEmail] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Fetch destination details by id
        const fetchDestination = async () => {
            try {
                const res = await fetch(
                    `http://10.0.2.2:3000/destination/by-id/${id}`
                );
                const data = await res.json();
                console.log(data);
                setDestination(data);
            } catch (err) {
                setDestination(null);
            }
        };
        fetchDestination();

        // Get user email
        const getUser = async () => {
            const jsonValue = await AsyncStorage.getItem("userData");
            const user = jsonValue ? JSON.parse(jsonValue) : null;
            setEmail(user?.email || "");
        };
        getUser();
    }, [id]);

    const onBook = async () => {
        if (!destination) return;

        // Fetch user details from AsyncStorage
        let userName = "";
        let userEmail = "";
        let userContact = "";
        try {
            const userData = await AsyncStorage.getItem("userData");
            if (userData) {
                const user = JSON.parse(userData);
                console.log("Parsed user object:", user);
                userName = user.name || "";
                userEmail = user.email || "";
                userContact = user.contact || "";
            }
        } catch (e) {
            // fallback to empty strings
        }

        if (!userEmail) {
            Alert.alert("Error", "User email not found. Please sign in again.");
            return;
        }

        // 1. Prepare Razorpay options
        const options = {
            description: `Booking for ${destination.title}`,
            image: destination.image || "https://i.imgur.com/3g7nmJC.png",
            currency: "INR",
            key: RAZORPAY_KEY_ID,
            amount: (destination.price * 100).toString(), // Razorpay expects paise
            name: "Travenor",
            prefill: {
                email: userEmail,
                contact: userContact,
                name: userName,
            },
            theme: { color: "#007bff" },
        };

        // 2. Open Razorpay payment modal
        RazorpayCheckout.open(options)
            .then(async (data: any) => {
                // Payment Success
                // 3. Store booking in DB
                const bookingPayload = {
                    email: userEmail,
                    destinationId: destination._id,
                    title: destination.title,
                    coordinates: destination.coordinates,
                    date: date.toISOString().split("T")[0], // YYYY-MM-DD
                    paymentId: data.razorpay_payment_id, // Store payment id
                };
                console.log("Booking payload:", bookingPayload);
                try {
                    const res = await fetch("http://10.0.2.2:3000/user/book", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(bookingPayload),
                    });
                    if (res.ok) {
                        Alert.alert("Success", "Booking confirmed!", [
                            {
                                text: "OK",
                                onPress: () => router.replace("/tabs/booked"),
                            },
                        ]);
                    } else {
                        Alert.alert("Error", "Failed to book. Try again.");
                    }
                } catch (err) {
                    Alert.alert("Error", "Failed to book. Try again.");
                }
            })
            .catch((error: any) => {
                // Payment Failed or Cancelled
                Alert.alert(
                    "Payment Failed",
                    "Your payment was not completed."
                );
            });
    };

    if (!destination) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.iconButton}
                >
                    <Ionicons name="chevron-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Book {destination.title}</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Image Carousel */}
                {destination.place_images &&
                destination.place_images.length > 0 ? (
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageCarousel}
                    >
                        {destination.place_images.map((img, idx) => (
                            <Image
                                key={idx}
                                source={{ uri: img }}
                                style={[
                                    styles.carouselImage,
                                    { width: SCREEN_WIDTH },
                                ]}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <Image
                        source={{ uri: destination.image }}
                        style={[styles.carouselImage, { width: SCREEN_WIDTH }]}
                    />
                )}
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
                <View style={styles.infoRow}>
                    <View style={styles.infoPill}>
                        <Ionicons
                            name="bed-outline"
                            size={16}
                            color="#007bff"
                        />
                        <Text style={styles.infoPillText}>
                            {destination.rooms} Rooms
                        </Text>
                    </View>
                    <View style={styles.infoPill}>
                        <Ionicons
                            name="water-outline"
                            size={16}
                            color="#007bff"
                        />
                        <Text style={styles.infoPillText}>
                            {destination.bathrooms} Bathrooms
                        </Text>
                    </View>
                    <View style={styles.infoPill}>
                        <Ionicons
                            name="pricetag-outline"
                            size={16}
                            color="#007bff"
                        />
                        <Text style={styles.infoPillText}>
                            ${destination.price}/night
                        </Text>
                    </View>
                    {destination.pool && (
                        <View style={styles.infoPill}>
                            <Ionicons
                                name="layers-outline"
                                size={16}
                                color="#007bff"
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
                {/* Map Preview */}
                {destination.coordinates && (
                    <View style={styles.mapCard}>
                        <WebView
                            style={{
                                width: "100%",
                                height: 180,
                                borderRadius: 10,
                            }}
                            originWhitelist={["*"]}
                            source={{
                                html: `
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
                                    <style>html, body, #map { height: 100%; margin: 0; padding: 0; } #map { height: 100%; width: 100vw; border-radius: 10px; }</style>
                                </head>
                                <body>
                                    <div id="map"></div>
                                    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
                                    <script>
                                        var lat = ${destination.coordinates.latitude};
                                        var lng = ${destination.coordinates.longitude};
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
                )}
                {/* Booking Section */}
                <View style={styles.bookingSection}>
                    <Text style={styles.label}>Pick a date:</Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={styles.dateText}>
                            {date.toDateString()}
                        </Text>
                    </TouchableOpacity>
                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={(_event: any, selectedDate?: Date) => {
                                setShowPicker(false);
                                if (selectedDate) setDate(selectedDate);
                            }}
                            minimumDate={new Date()}
                        />
                    )}
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={onBook}
                    >
                        <Text style={styles.bookButtonText}>
                            Confirm Booking
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
    },
    iconButton: {
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        padding: 8,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
        textAlign: "center",
    },
    content: { flex: 1, alignItems: "center", justifyContent: "center" },
    label: { fontSize: 16, marginBottom: 10 },
    dateButton: {
        borderWidth: 1,
        borderColor: "#007bff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
    },
    dateText: { fontSize: 18, color: "#007bff" },
    bookButton: {
        backgroundColor: "#007bff",
        padding: 16,
        borderRadius: 8,
        marginTop: 20,
        width: "90%",
        alignSelf: "center",
    },
    bookButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center",
    },
    imageCarousel: {
        width: "100%",
        height: 200,
    },
    carouselImage: {
        height: 200,
        borderRadius: 16,
        marginTop: 16,
        alignSelf: "center",
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    placeTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#222",
    },
    placeLocation: {
        fontSize: 14,
        color: "gray",
        marginTop: 2,
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
    infoRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 8,
        flexWrap: "wrap",
        gap: 8,
    },
    infoPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f4ff",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        marginBottom: 4,
    },
    infoPillText: {
        fontWeight: "bold",
        marginLeft: 4,
        color: "#007bff",
    },
    descriptionSection: {
        paddingHorizontal: 20,
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
    mapCard: {
        height: 180,
        backgroundColor: "#e0e0e0",
        marginHorizontal: 16,
        borderRadius: 10,
        marginBottom: 16,
        marginTop: 8,
        overflow: "hidden",
    },
    bookingSection: {
        marginTop: 24,
        alignItems: "center",
        backgroundColor: "#f8faff",
        borderRadius: 16,
        marginHorizontal: 16,
        padding: 20,
        shadowColor: "#007bff",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
});

export default ScheduleScreen;

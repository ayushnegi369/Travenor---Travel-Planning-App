import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useUserStore from "../../store/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DESTINATIONS } from "./DESTINATIONS";

const dummyFavorites = [
    {
        id: "1",
        image: "https://i.imgur.com/3G2E5QH.jpeg",
        title: "Tropical Villa",
        location: "Bali, Indonesia",
        rooms: 3,
        bathrooms: 2,
        price: 120,
    },
    {
        id: "2",
        image: "https://i.imgur.com/yhJhoB0.jpeg",
        title: "Mountain Cabin",
        location: "Swiss Alps",
        rooms: 2,
        bathrooms: 1,
        price: 150,
    },
    {
        id: "3",
        image: "https://i.imgur.com/8Km9tLL.jpeg",
        title: "Beach House",
        location: "Malibu, USA",
        rooms: 4,
        bathrooms: 3,
        price: 250,
    },
];

// Add this above Favorites component
const RemoveIcon = () => (
    <View
        style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 2,
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 4,
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        }}
    >
        <MaterialIcons name="close" size={20} color="#ff4444" />
    </View>
);

const Favorites = () => {
    const router = useRouter();
    const [jwtToken, setJwtToken] = useState(null);
    const [email, setEmail] = useState("");
    const [favoriteTitles, setFavoriteTitles] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("userData");
                const user = jsonValue != null ? JSON.parse(jsonValue) : null;
                const token = user?.jwtToken;
                setJwtToken(token);
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

    // Fetch favorite titles from backend
    useEffect(() => {
        const fetchFavorites = async () => {
            if (!email) return;
            setLoading(true);
            try {
                const res = await fetch(`http://10.0.2.2:3000/user/favorites?email=${encodeURIComponent(email)}`);
                const data = await res.json();
                if (res.ok && Array.isArray(data.favoritePlaces)) {
                    setFavoriteTitles(data.favoritePlaces);
                } else {
                    setFavoriteTitles([]);
                }
            } catch (err) {
                setFavoriteTitles([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFavorites();
    }, [email]);

    // Fetch favorite destinations from backend
    useEffect(() => {
        const fetchFavoriteDestinations = async () => {
            if (!favoriteTitles.length) {
                setFavorites([]);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch("http://10.0.2.2:3000/destinations/by-titles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ titles: favoriteTitles }),
                });
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setFavorites(data);
                } else {
                    setFavorites([]);
                }
            } catch (err) {
                setFavorites([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFavoriteDestinations();
    }, [favoriteTitles]);

    const handleRemove = async (title: string) => {
        if (!email) return;
        try {
            const res = await fetch("http://10.0.2.2:3000/user/favorite", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, title }),
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data.favoritePlaces)) {
                setFavoriteTitles(data.favoritePlaces);
            }
        } catch (err) {
            // Optionally show error
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => router.push(`/details/${item.title}`)}>
            <View style={styles.card}>
                <TouchableOpacity style={styles.floatingRemoveIcon} onPress={() => handleRemove(item.title)}>
                    <MaterialIcons name="close" size={22} color="#fff" />
                </TouchableOpacity>
                <Image
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardLocation}>{item.location}</Text>
                    <View style={styles.cardInfoRow}>
                        <View style={styles.cardInfoLeft}>
                            <View style={styles.iconText}>
                                <Ionicons
                                    name="bed-outline"
                                    size={14}
                                    color="#000"
                                />
                                <Text style={styles.iconTextLabel}>
                                    {item.rooms} rooms
                                </Text>
                            </View>
                            <View style={styles.iconText}>
                                <MaterialIcons
                                    name="bathtub"
                                    size={14}
                                    color="#000"
                                />
                                <Text style={styles.iconTextLabel}>
                                    {item.bathrooms} bathrooms
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.cardPrice}>
                            ${item.price}
                            <Text style={styles.cardNight}> /night</Text>
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Favourite Places</Text>
                <View style={{ width: 40 }} />
            </View>
            <Text style={styles.subheading}>Favourite Places</Text>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Loading...</Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text>No favorites found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

export default Favorites;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    backButton: {
        backgroundColor: "#f0f0f0",
        padding: 8,
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "600",
        color: "#222",
        flex: 1,
    },
    subheading: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        paddingHorizontal: 16,
        marginTop: 10,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 18,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardImage: {
        width: "100%",
        height: 160,
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#000",
    },
    cardLocation: {
        fontSize: 14,
        color: "gray",
        marginBottom: 10,
    },
    cardInfoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    cardInfoLeft: {
        flexDirection: "row",
    },
    iconText: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },
    iconTextLabel: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: "bold",
        color: "#000",
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#000",
    },
    cardNight: {
        fontSize: 12,
        color: "gray",
        fontWeight: "normal",
    },
    cardWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 18,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    removeIcon: {
        padding: 8,
        backgroundColor: "#fff",
        borderRadius: 16,
        marginRight: 8,
    },
    floatingRemoveIcon: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: "#ff4444",
        borderRadius: 16,
        padding: 4,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
});

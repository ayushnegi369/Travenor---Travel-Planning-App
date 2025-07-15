import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    FlatList,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import useUserStore from "../../store/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================
// Notifications Screen
// - Displays notifications for the user
// - Fetches notification data from server or local state
// =========================

// Dummy Data
const notifications = [
    {
        id: "1",
        title: "Super Offer",
        subtitle: "Get 60% off in our first booking",
        time: "Sun,12:40pm",
        avatar: "https://i.imgur.com/VlQv9Hq.png",
        type: "recent",
    },
    {
        id: "2",
        title: "Super Offer",
        subtitle: "Get 60% off in our first booking",
        time: "Mon,11:50pm",
        avatar: "https://i.imgur.com/ZU8wwbP.png",
        type: "recent",
    },
    {
        id: "3",
        title: "Super Offer",
        subtitle: "Get 60% off in our first booking",
        time: "Tue,10:56pm",
        avatar: "https://i.imgur.com/XD9tZns.png",
        type: "earlier",
    },
    {
        id: "4",
        title: "Super Offer",
        subtitle: "Get 60% off in our first booking",
        time: "Wed,12:40pm",
        avatar: "https://i.imgur.com/efH5mTH.png",
        type: "earlier",
    },
    {
        id: "5",
        title: "Super Offer",
        subtitle: "Get 60% off in our first booking",
        time: "Fri,11:50pm",
        avatar: "https://i.imgur.com/rTUC0gZ.png",
        type: "archived",
    },
    {
        id: "6",
        title: "Super Offer",
        subtitle: "Get 60% off in our first booking",
        time: "Sat,10:56pm",
        avatar: "https://i.imgur.com/58LrkGu.png",
        type: "archived",
    },
];

const tabs = ["Recent", "Earlier", "Archived"];

const Notification = () => {
    const [jwtToken, setJwtToken] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("userData");
                const user = jsonValue != null ? JSON.parse(jsonValue) : null;
                const token = user?.jwtToken;

                setJwtToken(token);

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

    const [activeTab, setActiveTab] = useState("Recent");
    const router = useRouter();

    const filteredNotifications = notifications.filter(
        (item) => item.type.toLowerCase() === activeTab.toLowerCase()
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconWrapper}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>Notification</Text>
                <TouchableOpacity>
                    <Text style={styles.clearText}>Clear all</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText,
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <FlatList
                data={filteredNotifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.notificationCard,
                            activeTab === "Recent" && styles.recentHighlight,
                        ]}
                    >
                        <Image
                            source={{ uri: item.avatar }}
                            style={styles.avatar}
                        />
                        <View style={styles.notificationText}>
                            <Text style={styles.notificationTitle}>
                                {item.title}
                            </Text>
                            <Text style={styles.notificationSubtitle}>
                                {item.subtitle}
                            </Text>
                        </View>
                        <Text style={styles.time}>{item.time}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default Notification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
    },
    iconWrapper: {
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        padding: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    clearText: {
        color: "#007bff",
        fontSize: 14,
    },
    tabRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 8,
    },
    tabText: {
        fontSize: 14,
        color: "gray",
    },
    activeTabText: {
        color: "#000",
        fontWeight: "bold",
        borderBottomWidth: 2,
        borderBottomColor: "#007bff",
        paddingBottom: 4,
    },
    notificationCard: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        backgroundColor: "#fff",
        marginBottom: 8,
    },
    recentHighlight: {
        backgroundColor: "#f0f8ff",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    notificationText: {
        flex: 1,
    },
    notificationTitle: {
        fontWeight: "bold",
        fontSize: 14,
    },
    notificationSubtitle: {
        color: "gray",
        fontSize: 12,
    },
    time: {
        fontSize: 10,
        color: "gray",
    },
});

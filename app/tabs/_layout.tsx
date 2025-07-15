import { Tabs } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

// =========================
// Tab Layout Component
// - Defines the main tab navigation structure for the app
// - Renders tab screens
// =========================

const TabLayout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#1E90FF",
                tabBarInactiveTintColor: "gray",
                tabBarLabelStyle: { fontSize: 12 },
            }}
        >
            {/* Home Tab */}
            <Tabs.Screen
                name="index"
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            {/* Booked Tab */}
            <Tabs.Screen
                name="booked"
                options={{
                    tabBarLabel: "Booked",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="confirmation-number"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            {/* Favourites Tab */}
            <Tabs.Screen
                name="favourites"
                options={{
                    tabBarLabel: "Favourites",
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="heart" size={size} color={color} />
                    ),
                }}
            />

            {/* Profile Tab */}
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarLabel: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default TabLayout;

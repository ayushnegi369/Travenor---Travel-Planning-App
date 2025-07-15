import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    ScrollView,
    Modal,
    Dimensions,
    ActivityIndicator,
    Platform,
    PermissionsAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import RBSheet from "react-native-raw-bottom-sheet";
import RangeSlider from "rn-range-slider";
import DropDownPicker from "react-native-dropdown-picker";
import useUserStore from "../../store/userStore";
import { BackHandler } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { DESTINATIONS } from "./DESTINATIONS";

// If you haven't installed react-native-maps, run:
// npm install react-native-maps
let MapView, Marker;
try {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
} catch (e) {
    MapView = null;
    Marker = null;
}
import type { Region } from "react-native-maps";

// For best results, install 'react-native-geolocation-service' and link it for Android/iOS
// npm install react-native-geolocation-service
let Geolocation;
try {
    Geolocation = require("react-native-geolocation-service");
} catch (e) {
    Geolocation = null;
}

const FILTER_OPTIONS = ["All", "Popular", "Nearby", "Recommended", "Recent"];

const categories = ["All Category", "House", "Hotels", "Villa"];
const facilities = ["Pool", "Wi-Fi", "Parking", "Gym", "Breakfast"];

// Default filter values
const DEFAULT_CATEGORY = "All Category";
const DEFAULT_FACILITIES: string[] = [];
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 2000;
const DEFAULT_ROOMS = "3 Rooms";
const DEFAULT_BATHROOMS = "2 Bathrooms";

// Default location (Bali, Indonesia)
const DEFAULT_LOCATION = {
    name: "Vincentius",
    address: "Bali, Indonesia",
    latitude: -8.3405,
    longitude: 115.092,
};

// =========================
// Home Tab Screen
// - Main landing page after login
// - Handles data fetching and rendering of home content
// - Supports navigation to other screens
// =========================

const Home = () => {
    // const { username, email, jwtToken } = useUserStore();
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
                // Log to console
                console.log("Username:", user?.username);
                console.log("Email:", user?.email);
                console.log("JWT Token:", token);   
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

    const [destinationData, setDestinationData] = useState(DESTINATIONS);
    const [selectedFilter, setSelectedFilter] = useState(FILTER_OPTIONS[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredDestinations, setFilteredDestinations] =
        useState(DESTINATIONS);
    const router = useRouter();
    const refRBSheet = useRef<any>(null);
    const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);
    const [selectedFacilities, setSelectedFacilities] =
        useState<string[]>(DEFAULT_FACILITIES);
    const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
    const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);

    const [roomsOpen, setRoomsOpen] = useState(false);
    const [bathroomsOpen, setBathroomsOpen] = useState(false);
    const [rooms, setRooms] = useState(DEFAULT_ROOMS);
    const [bathrooms, setBathrooms] = useState(DEFAULT_BATHROOMS);

    // Pending state for bottom sheet
    const [pendingCategory, setPendingCategory] = useState(selectedCategory);
    const [pendingFacilities, setPendingFacilities] =
        useState<string[]>(selectedFacilities);
    const [pendingMinPrice, setPendingMinPrice] = useState(minPrice);
    const [pendingMaxPrice, setPendingMaxPrice] = useState(maxPrice);
    const [pendingRooms, setPendingRooms] = useState(rooms);
    const [pendingBathrooms, setPendingBathrooms] = useState(bathrooms);

    const [isSliding, setIsSliding] = useState(false);

    const [location, setLocation] = useState(DEFAULT_LOCATION);
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [markerPosition, setMarkerPosition] = useState({
        latitude: location.latitude,
        longitude: location.longitude,
    });
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [pickedAddress, setPickedAddress] = useState(location.address);

    // Debug: set to true to test WebView rendering with simple HTML
    const [webviewDebug, setWebviewDebug] = useState(false);

    const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
        useState(false);

    const toggleFacility = (item) => {
        setSelectedFacilities((prev) =>
            prev.includes(item)
                ? prev.filter((f) => f !== item)
                : [...prev, item]
        );
    };

    // When opening the bottom sheet, copy current filter state to pending state
    const openBottomSheet = () => {
        setPendingCategory(selectedCategory);
        setPendingFacilities(selectedFacilities);
        setPendingMinPrice(minPrice);
        setPendingMaxPrice(maxPrice);
        setPendingRooms(rooms);
        setPendingBathrooms(bathrooms);
        refRBSheet.current?.open();
    };

    // Toggle facility for pending state
    const togglePendingFacility = (item: string) => {
        setPendingFacilities((prev: string[]) =>
            prev.includes(item)
                ? prev.filter((f) => f !== item)
                : [...prev, item]
        );
    };

    // Apply filters from bottom sheet
    const applyFilters = () => {
        setSelectedCategory(pendingCategory);
        setSelectedFacilities(pendingFacilities);
        setMinPrice(pendingMinPrice);
        setMaxPrice(pendingMaxPrice);
        setRooms(pendingRooms);
        setBathrooms(pendingBathrooms);
        refRBSheet.current?.close();
    };

    // Clear all filters
    const clearAllFilters = () => {
        setPendingCategory(DEFAULT_CATEGORY);
        setPendingFacilities(DEFAULT_FACILITIES);
        setPendingMinPrice(DEFAULT_MIN_PRICE);
        setPendingMaxPrice(DEFAULT_MAX_PRICE);
        setPendingRooms(DEFAULT_ROOMS);
        setPendingBathrooms(DEFAULT_BATHROOMS);
        // Also reset main filter state so all destinations are shown
        setSelectedCategory(DEFAULT_CATEGORY);
        setSelectedFacilities(DEFAULT_FACILITIES);
        setMinPrice(DEFAULT_MIN_PRICE);
        setMaxPrice(DEFAULT_MAX_PRICE);
        setRooms(DEFAULT_ROOMS);
        setBathrooms(DEFAULT_BATHROOMS);
    };

    useEffect(() => {
        let filtered = [...destinationData];
        // Pills
        if (selectedFilter !== "All") {
            if (selectedFilter === "Popular") {
                filtered = filtered.filter((item) => item.price > 300);
            } else if (selectedFilter === "Nearby") {
                filtered = filtered.filter((item) => Number(item.id) < 3);
            } else if (selectedFilter === "Recommended") {
                filtered = filtered.filter((item) => item.rooms >= 4);
            } else if (selectedFilter === "Recent") {
                filtered = filtered.filter((item) => Number(item.id) > 3);
            }
        }
        // Search filter
        if (searchQuery.trim() !== "") {
            const q = searchQuery.trim().toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(q) ||
                    item.location.toLowerCase().includes(q)
            );
        }
        // Category
        if (selectedCategory && selectedCategory !== DEFAULT_CATEGORY) {
            filtered = filtered.filter((item) =>
                item.title
                    .toLowerCase()
                    .includes(selectedCategory.toLowerCase())
            );
        }
        // Price
        if (
            !(minPrice === DEFAULT_MIN_PRICE && maxPrice === DEFAULT_MAX_PRICE)
        ) {
            filtered = filtered.filter(
                (item) => item.price >= minPrice && item.price <= maxPrice
            );
        }
        // Rooms
        if (rooms && rooms !== DEFAULT_ROOMS) {
            if (rooms === "4+ Rooms") {
                filtered = filtered.filter((item) => item.rooms >= 4);
            } else {
                const num = parseInt(rooms);
                if (!isNaN(num)) {
                    filtered = filtered.filter((item) => item.rooms === num);
                }
            }
        }
        // Bathrooms
        if (bathrooms && bathrooms !== DEFAULT_BATHROOMS) {
            if (bathrooms === "3+ Bathrooms") {
                filtered = filtered.filter((item) => item.bathrooms >= 3);
            } else {
                const num = parseInt(bathrooms);
                if (!isNaN(num)) {
                    filtered = filtered.filter(
                        (item) => item.bathrooms === num
                    );
                }
            }
        }
        // Facilities (skipped: not present in data model)
        setFilteredDestinations(filtered);
    }, [
        destinationData,
        selectedFilter,
        searchQuery,
        selectedCategory,
        minPrice,
        maxPrice,
        rooms,
        bathrooms,
        selectedFacilities,
    ]);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => subscription.remove(); // ✅ Correct removal
        }, [])
    );

    useEffect(() => {
        fetch("http://10.0.2.2:3000/fetch-destinations")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    // Ensure each item has the required fields
                    const mappedData = data.map((item, idx) => ({
                        id: item.id?.toString() || `${idx + 1}`,
                        title: item.title || "Unknown Title",
                        location: item.location || "Unknown Location",
                        rooms: item.rooms ?? 1,
                        bathrooms: item.bathrooms ?? 1,
                        price: item.price ?? 0,
                        image:
                            item.image ||
                            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60&ixlib=rb-4.0.3",
                    }));
                    setDestinationData(mappedData);
                }
            })
            .catch((err) => console.error("Fetch error:", err));
    }, []);

    // Reverse geocode to get address from lat/lng
    const fetchAddress = async (lat: number, lng: number) => {
        setIsLoadingAddress(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data && data.display_name) {
                setPickedAddress(data.display_name);
            } else {
                setPickedAddress("Unknown location");
            }
        } catch (e) {
            setPickedAddress("Unknown location");
        }
        setIsLoadingAddress(false);
    };

    // When marker moves, update address
    useEffect(() => {
        fetchAddress(markerPosition.latitude, markerPosition.longitude);
    }, [markerPosition]);

    // Helper to get current location
    const getCurrentLocation = async () => {
        setIsGettingCurrentLocation(true);
        try {
            if (Platform.OS === "android") {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    setIsGettingCurrentLocation(false);
                    alert("Location permission denied.");
                    return;
                }
            }
            const geo = Geolocation || navigator.geolocation;
            geo.getCurrentPosition(
                (position: any) => {
                    setMarkerPosition({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setIsGettingCurrentLocation(false);
                },
                (error: any) => {
                    setIsGettingCurrentLocation(false);
                    alert("Could not get current location.");
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (e) {
            setIsGettingCurrentLocation(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.iconWrapper}
                    onPress={() => {
                        setMarkerPosition({
                            latitude: location.latitude,
                            longitude: location.longitude,
                        });
                        setPickedAddress(location.address);
                        setLocationModalVisible(true);
                    }}
                >
                    <Ionicons name="location-outline" size={24} color="gray" />
                </TouchableOpacity>

                <View style={styles.textBlock}>
                    <Text style={styles.heading}>{location.name}</Text>
                    <Text style={styles.subheading} numberOfLines={1}>
                        {location.address}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.iconWrapper}
                    onPress={() => router.push("/notifications")}
                >
                    <Ionicons
                        name="notifications-outline"
                        size={24}
                        color="gray"
                    />
                    <View style={styles.notificationBadge}>
                        <Text style={styles.notificationText}>3</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchBarContainer}>
                    <MaterialIcons
                        name="search"
                        size={24}
                        color="gray"
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by location..."
                        placeholderTextColor="gray"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={openBottomSheet}
                >
                    <Ionicons name="funnel-outline" size={24} color="gray" />
                </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <View style={{ height: 48 }}>
                <FlatList
                    data={FILTER_OPTIONS}
                    keyExtractor={(item) => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pillList}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    renderItem={({ item }) => {
                        const isSelected = item === selectedFilter;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.pill,
                                    isSelected
                                        ? styles.pillSelected
                                        : styles.pillUnselected,
                                ]}
                                onPress={() => setSelectedFilter(item)}
                            >
                                <Text
                                    style={[
                                        styles.pillText,
                                        isSelected
                                            ? styles.pillTextSelected
                                            : styles.pillTextUnselected,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Destinations List */}
            <FlatList
                data={filteredDestinations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.destinationList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {
                            router.push(`/details/${item.title}`);
                        }}
                    >
                        <View style={styles.card}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>
                                    {item.title}
                                </Text>
                                <Text style={styles.cardLocation}>
                                    {item.location}
                                </Text>
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
                                        <Text style={styles.cardNight}>
                                            {" "}
                                            /night
                                        </Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
            <RBSheet
                ref={refRBSheet}
                useNativeDriver={true}
                // dragFromTopOnly={true} // Not supported by RBSheet types
                customStyles={{
                    wrapper: { backgroundColor: "transparent" },
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        height: 600,
                    },
                }}
                customModalProps={{
                    animationType: "slide",
                    statusBarTranslucent: true,
                }}
                customAvoidingViewProps={{ enabled: false }}
            >
                <View style={styles.draggableIcon} />
                <ScrollView
                    style={styles.container}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={!isSliding}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.filterTitle}>Filter Place</Text>
                        <TouchableOpacity onPress={clearAllFilters}>
                            <Text style={styles.clearAll}>Clear all</Text>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            height: 1,
                            backgroundColor: "#eee",
                            marginVertical: 12,
                        }}
                    />
                    {/* Category */}
                    <Text style={styles.sectionTitle}>Category</Text>
                    <View style={{ marginBottom: 16 }}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={categories}
                            keyExtractor={(item) => item}
                            contentContainerStyle={styles.pillList}
                            renderItem={({ item }) => {
                                const isSelected = item === pendingCategory;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.pill,
                                            isSelected
                                                ? styles.pillSelected
                                                : styles.pillUnselected,
                                        ]}
                                        onPress={() => setPendingCategory(item)}
                                    >
                                        <Text
                                            style={[
                                                styles.pillText,
                                                isSelected
                                                    ? styles.pillTextSelected
                                                    : styles.pillTextUnselected,
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>

                    {/* Price Range */}
                    <Text style={styles.sectionTitle}>Range Price</Text>
                    <View
                        pointerEvents="box-none"
                        onTouchStart={() => setIsSliding(true)}
                        onTouchEnd={() => setIsSliding(false)}
                    >
                        <RangeSlider
                            min={0}
                            max={2000}
                            step={10}
                            low={pendingMinPrice}
                            high={pendingMaxPrice}
                            onValueChanged={(low, high) => {
                                setPendingMinPrice(Number(low));
                                setPendingMaxPrice(Number(high));
                            }}
                            renderThumb={() => (
                                <View style={styles.sliderThumb} />
                            )}
                            renderRail={() => (
                                <View style={styles.sliderRail} />
                            )}
                            renderRailSelected={() => (
                                <View style={styles.sliderRailSelected} />
                            )}
                            renderLabel={(value) => (
                                <View style={styles.sliderLabel}>
                                    <Text style={styles.sliderLabelText}>
                                        {value}
                                    </Text>
                                </View>
                            )}
                            renderNotch={() => (
                                <View style={styles.sliderNotch} />
                            )}
                        />
                    </View>

                    <View style={styles.priceRangeText}>
                        <Text>${pendingMinPrice}</Text>
                        <Text>${pendingMaxPrice}</Text>
                    </View>

                    {/* Bedroom & Bathroom */}
                    <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionTitle}>Bedroom</Text>
                        <Text style={styles.sectionTitle}>Bathroom</Text>
                    </View>

                    <View style={styles.dropdownRow}>
                        <DropDownPicker
                            open={roomsOpen}
                            value={pendingRooms}
                            items={[
                                { label: "1 Room", value: "1 Room" },
                                { label: "2 Rooms", value: "2 Rooms" },
                                { label: "3 Rooms", value: "3 Rooms" },
                                { label: "4+ Rooms", value: "4+ Rooms" },
                            ]}
                            setOpen={setRoomsOpen}
                            setValue={setPendingRooms}
                            containerStyle={styles.dropdown}
                            dropDownContainerStyle={{
                                backgroundColor: "#f0f0f0",
                            }}
                            style={styles.dropdownStyle}
                            listMode="SCROLLVIEW"
                        />
                        <DropDownPicker
                            open={bathroomsOpen}
                            value={pendingBathrooms}
                            items={[
                                { label: "1 Bathroom", value: "1 Bathroom" },
                                { label: "2 Bathrooms", value: "2 Bathrooms" },
                                {
                                    label: "3+ Bathrooms",
                                    value: "3+ Bathrooms",
                                },
                            ]}
                            setOpen={setBathroomsOpen}
                            setValue={setPendingBathrooms}
                            containerStyle={styles.dropdown}
                            dropDownContainerStyle={{
                                backgroundColor: "#f0f0f0",
                            }}
                            style={styles.dropdownStyle}
                            listMode="SCROLLVIEW"
                        />
                    </View>

                    {/* Facility Place */}
                    <Text style={styles.sectionTitle}>Facility Place</Text>
                    <View style={styles.facilityContainer}>
                        {facilities.map((item) => {
                            const isSelected = pendingFacilities.includes(item);
                            return (
                                <TouchableOpacity
                                    key={item}
                                    style={[
                                        styles.facilityPill,
                                        isSelected && styles.facilitySelected,
                                    ]}
                                    onPress={() => togglePendingFacility(item)}
                                >
                                    <Text
                                        style={[
                                            styles.facilityText,
                                            isSelected &&
                                                styles.facilityTextSelected,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Apply Button */}
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={applyFilters}
                    >
                        <Text style={styles.applyText}>Apply Now</Text>
                    </TouchableOpacity>
                </ScrollView>
            </RBSheet>

            {/* Location Picker Modal */}
            <Modal
                visible={locationModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setLocationModalVisible(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.2)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 16,
                            overflow: "hidden",
                            width: Dimensions.get("window").width * 0.9,
                            height: 420,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <View
                            style={{
                                width: Dimensions.get("window").width * 0.9,
                                height: 300,
                                borderWidth: 2,
                                borderColor: "#007bff",
                                backgroundColor: "#eee",
                            }}
                        >
                            {/* Current Location Button - bottom right */}
                            <TouchableOpacity
                                onPress={getCurrentLocation}
                                style={{
                                    position: "absolute",
                                    bottom: 16,
                                    right: 16,
                                    zIndex: 20,
                                    backgroundColor: "#fff",
                                    borderRadius: 20,
                                    paddingVertical: 10,
                                    paddingHorizontal: 16,
                                    borderWidth: 1,
                                    borderColor: "#007bff",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    shadowColor: "#000",
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 2,
                                }}
                            >
                                {isGettingCurrentLocation ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#007bff"
                                    />
                                ) : (
                                    <Ionicons
                                        name="locate"
                                        size={20}
                                        color="#007bff"
                                    />
                                )}
                                <Text
                                    style={{
                                        color: "#007bff",
                                        fontWeight: "bold",
                                        marginLeft: 8,
                                    }}
                                >
                                    Current Location
                                </Text>
                            </TouchableOpacity>
                            <WebView
                                style={{ flex: 1 }}
                                originWhitelist={["*"]}
                                source={{
                                    html: webviewDebug
                                        ? `
                                    <html><body style='background:#fff;'><h1 style='color:#007bff;text-align:center;margin-top:40%;'>Hello from WebView</h1></body></html>
                                `
                                        : `
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
                                            var lat = ${markerPosition.latitude};
                                            var lng = ${markerPosition.longitude};
                                            var map = L.map('map').setView([lat, lng], 15);
                                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                                maxZoom: 19,
                                            }).addTo(map);
                                            var marker = L.marker([lat, lng], {draggable:true}).addTo(map);
                                            marker.on('dragend', function(e) {
                                                var pos = marker.getLatLng();
                                                window.ReactNativeWebView.postMessage(JSON.stringify({lat: pos.lat, lng: pos.lng}));
                                            });
                                            map.on('click', function(e) {
                                                marker.setLatLng(e.latlng);
                                                window.ReactNativeWebView.postMessage(JSON.stringify({lat: e.latlng.lat, lng: e.latlng.lng}));
                                            });
                                        </script>
                                    </body>
                                    </html>
                                `,
                                }}
                                onMessage={(event) => {
                                    try {
                                        const data = JSON.parse(
                                            event.nativeEvent.data
                                        );
                                        if (data.lat && data.lng) {
                                            setMarkerPosition({
                                                latitude: data.lat,
                                                longitude: data.lng,
                                            });
                                        }
                                    } catch (e) {}
                                }}
                            />
                            {/* Toggle debug mode button */}
                            <TouchableOpacity
                                onPress={() => setWebviewDebug((d) => !d)}
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    backgroundColor: "#007bff",
                                    borderRadius: 8,
                                    padding: 6,
                                    zIndex: 10,
                                }}
                            >
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: 12,
                                    }}
                                >
                                    {webviewDebug
                                        ? "Show Map"
                                        : "Debug WebView"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View
                            style={{
                                padding: 16,
                                backgroundColor: "#fff",
                                alignSelf: "stretch",
                            }}
                        >
                            <Text
                                style={{ fontWeight: "bold", marginBottom: 4 }}
                            >
                                Selected Location:
                            </Text>
                            <Text
                                style={{ fontSize: 13, color: "#333" }}
                                numberOfLines={2}
                            >
                                {markerPosition.latitude.toFixed(5)},{" "}
                                {markerPosition.longitude.toFixed(5)}
                            </Text>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "flex-end",
                                    marginTop: 16,
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() =>
                                        setLocationModalVisible(false)
                                    }
                                    style={{ marginRight: 16 }}
                                >
                                    <Text
                                        style={{
                                            color: "#888",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={async () => {
                                        // Show loading indicator
                                        setIsLoadingAddress(true);
                                        let address = `${markerPosition.latitude.toFixed(
                                            5
                                        )}, ${markerPosition.longitude.toFixed(
                                            5
                                        )}`;
                                        try {
                                            const response = await fetch(
                                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${markerPosition.latitude}&lon=${markerPosition.longitude}`
                                            );
                                            const data = await response.json();
                                            if (data && data.display_name) {
                                                address = data.display_name;
                                            }
                                        } catch (e) {}
                                        setLocation({
                                            name:
                                                address && address.split(",")[0]
                                                    ? address.split(",")[0]
                                                    : "Selected Location",
                                            address,
                                            latitude: markerPosition.latitude,
                                            longitude: markerPosition.longitude,
                                        });
                                        setIsLoadingAddress(false);
                                        setLocationModalVisible(false);
                                    }}
                                    style={{
                                        backgroundColor: "#007bff",
                                        paddingHorizontal: 18,
                                        paddingVertical: 8,
                                        borderRadius: 8,
                                    }}
                                >
                                    {isLoadingAddress ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#fff"
                                        />
                                    ) : (
                                        <Text
                                            style={{
                                                color: "#fff",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Confirm
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#fff",
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "#ccc",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    textBlock: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    heading: {
        fontSize: 14,
        color: "gray",
    },
    subheading: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        width: "80%",
    },
    notificationBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "red",
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        minWidth: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    notificationText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    searchBarContainer: {
        flexDirection: "row",
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 30,
        alignItems: "center",
        paddingHorizontal: 10,
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
    },
    filterButton: {
        marginLeft: 12,
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "#ccc",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },

    // Filter Pills (Top)
    pillList: {
        paddingTop: 5,
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: "#fff",
    },
    pill: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 36,
    },
    pillSelected: {
        backgroundColor: "#007bff",
    },
    pillUnselected: {
        backgroundColor: "#f0f0f0",
    },
    pillText: {
        fontSize: 14,
        lineHeight: 18,
        textAlignVertical: "center",
    },
    pillTextSelected: {
        color: "#fff",
        fontWeight: "bold",
    },
    pillTextUnselected: {
        color: "gray",
    },

    destinationList: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 18,
        overflow: "hidden",
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
        gap: 10,
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

    // Bottom Sheet Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    clearAll: {
        fontSize: 12,
        color: "gray",
    },

    // Category Pills
    categoryPillList: {
        marginVertical: 10,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    categoryPillSelected: {
        backgroundColor: "#007bff",
    },
    categoryPillUnselected: {
        backgroundColor: "#f0f0f0",
    },
    categoryPillText: {
        fontSize: 14,
    },
    categoryPillTextSelected: {
        color: "#fff",
        fontWeight: "bold",
    },
    categoryPillTextUnselected: {
        color: "#000",
    },

    sectionTitle: {
        marginTop: 20,
        fontWeight: "bold",
        fontSize: 14,
        color: "#000",
    },
    priceRangeText: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    sectionTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    dropdownRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    dropdown: {
        width: "48%",
        zIndex: 1000,
    },
    dropdownStyle: {
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
        borderColor: "#ccc",
    },

    // Facility

    // Add padding for bottom sheet content
    container: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        backgroundColor: "#fff",
        minHeight: 300,
    },
    facilityContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },
    facilityPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        marginBottom: 10,
    },
    facilitySelected: {
        borderColor: "#007bff",
        borderWidth: 1,
        backgroundColor: "#e6f0ff",
    },
    facilityText: {
        color: "#000",
    },
    facilityTextSelected: {
        color: "#007bff",
        fontWeight: "bold",
    },

    applyButton: {
        backgroundColor: "#007bff",
        paddingVertical: 14,
        borderRadius: 30,
        marginVertical: 30,
        marginBottom: 40,
        alignItems: "center",
    },
    applyText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },

    // Bottom sheet drag indicator
    draggableIcon: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "#ccc",
        alignSelf: "center",
        marginVertical: 8,
    },

    // Slider styles
    sliderThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#007bff",
        borderWidth: 2,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    sliderRail: {
        height: 4,
        borderRadius: 2,
        backgroundColor: "#e0e0e0",
        flex: 1,
    },
    sliderRailSelected: {
        height: 4,
        borderRadius: 2,
        backgroundColor: "#007bff",
        flex: 1,
    },
    sliderLabel: {
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        backgroundColor: "#007bff",
        borderRadius: 6,
    },
    sliderLabelText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    sliderNotch: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#007bff",
    },
});

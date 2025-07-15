import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Image,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import RNPickerSelect from "react-native-picker-select";
import { useRouter } from "expo-router";
import useUserStore from "../../store/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================
// Edit Profile Screen
// - Allows user to update profile information
// - Handles form input and profile update API call
// - Navigates back to profile screen on success
// =========================

const ProfileScreen = () => {
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

    const [firstName, setFirstName] = useState("Leonardo");
    const [lastName, setLastName] = useState("Ahmed");
    const [location, setLocation] = useState("Sylhet Bangladesh");
    const [callingCode, setCallingCode] = useState("88");
    const [phone, setPhone] = useState("01758-000666");
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.roundBackButton}
                    onPress={() => router.push("/tabs/profile")}
                >
                    <Ionicons name="chevron-back" size={22} color="#333" />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Edit Profile</Text>
                <TouchableOpacity>
                    <Text style={styles.topBarDone}>Done</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Image
                    source={{ uri: "https://i.pravatar.cc/150?img=11" }}
                    style={styles.avatar}
                />

                <Text style={styles.name}>{firstName}</Text>
                <TouchableOpacity>
                    <Text style={styles.changePicture}>
                        Change Profile Picture
                    </Text>
                </TouchableOpacity>

                {/* First Name */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            value={firstName}
                            onChangeText={setFirstName}
                            style={styles.input}
                            placeholder="First Name"
                        />
                        <Ionicons
                            name="checkmark"
                            size={20}
                            color="dodgerblue"
                        />
                    </View>
                </View>

                {/* Last Name */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            value={lastName}
                            onChangeText={setLastName}
                            style={styles.input}
                            placeholder="Last Name"
                        />
                        <Ionicons
                            name="checkmark"
                            size={20}
                            color="dodgerblue"
                        />
                    </View>
                </View>

                {/* Location */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Location</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            value={location}
                            onChangeText={setLocation}
                            style={styles.input}
                            placeholder="Location"
                        />
                        <Ionicons
                            name="checkmark"
                            size={20}
                            color="dodgerblue"
                        />
                    </View>
                </View>

                {/* Mobile Number */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>Mobile Number</Text>
                    <View style={styles.inputRow}>
                        <RNPickerSelect
                            onValueChange={setCallingCode}
                            value={callingCode}
                            items={[
                                { label: "+88", value: "88" },
                                { label: "+91", value: "91" },
                                { label: "+1", value: "1" },
                                { label: "+44", value: "44" },
                            ]}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            placeholder={{}}
                        />
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Phone Number"
                        />
                        <Ionicons
                            name="checkmark"
                            size={20}
                            color="dodgerblue"
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "#fff",
    },
    roundBackButton: {
        backgroundColor: "#f0f0f0",
        padding: 8,
        borderRadius: "50%",
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    topBarTitle: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "600",
        color: "#222",
        flex: 1,
    },
    topBarDone: {
        color: "dodgerblue",
        fontSize: 16,
        fontWeight: "bold",
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    backButton: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    content: {
        paddingHorizontal: 24,
        alignItems: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginVertical: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginTop: 10,
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
    },
    changePicture: {
        color: "dodgerblue",
        fontSize: 14,
        marginTop: 4,
    },
    fieldContainer: {
        width: "100%",
        marginTop: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 6,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f6f6f6",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: "#000",
    },
    doneButton: {
        marginTop: 30,
        backgroundColor: "dodgerblue",
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 30,
    },
    doneText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default ProfileScreen;

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 14,
        color: "#000",
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    inputAndroid: {
        fontSize: 14,
        color: "#000",
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
});

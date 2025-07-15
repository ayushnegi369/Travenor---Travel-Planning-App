import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_AVATAR = "https://i.imgur.com/Kl8bRmk.png";

// =========================
// Profile Tab Screen
// - Displays user profile information
// - Supports editing profile and logout
// =========================

const Profile = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [location, setLocation] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const jsonValue = await AsyncStorage.getItem("userData");
                const user = jsonValue ? JSON.parse(jsonValue) : null;
                const userEmail = user?.email;
                setUsername(user?.username || "");
                if (!userEmail) {
                    router.push("/auth/signin");
                    return;
                }
                setEmail(userEmail);
                // Fetch full profile from backend
                const res = await fetch(`http://10.0.2.2:3000/user/profile?email=${encodeURIComponent(userEmail)}`);
                const data = await res.json();
                const u = data.user || {};
                setFirstName(u.firstName ?? "");
                setLastName(u.lastName ?? "");
                setLocation(u.location ?? "");
                setMobileNumber(u.mobileNumber ?? "");
                setProfileImage(u.profileImage ?? "");
            } catch (e) {
                Alert.alert("Error", "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("http://10.0.2.2:3000/user/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    location: location || null,
                    mobileNumber: mobileNumber || null,
                    profileImage: profileImage || null,
                }),
            });
            if (res.ok) {
                Alert.alert("Success", "Profile updated successfully");
            } else {
                Alert.alert("Error", "Failed to update profile");
            }
        } catch (e) {
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("userData");
            router.push("/auth/signin");
        } catch (e) {
            Alert.alert(`Error: ${e}`);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ textAlign: "center", marginTop: 40 }}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitleAbsolute}>Profile</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Profile Info */}
                <View style={styles.profileInfo}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: profileImage || DEFAULT_AVATAR }}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.username}>{username || "Username"}</Text>
                </View>
                {/* Editable Fields */}
                <View style={styles.formSection}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First Name"
                    />
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last Name"
                    />
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: '#f0f0f0' }]}
                        value={email}
                        editable={false}
                        selectTextOnFocus={false}
                    />
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Location"
                    />
                    <Text style={styles.label}>Mobile Number</Text>
                    <TextInput
                        style={styles.input}
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        placeholder="Mobile Number"
                        keyboardType="phone-pad"
                    />
                    <Text style={styles.label}>Profile Image URL</Text>
                    <TextInput
                        style={styles.input}
                        value={profileImage}
                        onChangeText={setProfileImage}
                        placeholder="Profile Image URL"
                    />
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.logOutBtn} onPress={handleLogout}>
                    <Text style={styles.logOutText}>Log out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: 16,
        position: 'relative',
    },
    iconBtn: {
        backgroundColor: "#f0f0f0",
        padding: 8,
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitleAbsolute: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        zIndex: -1,
    },
    profileInfo: {
        alignItems: "center",
        marginTop: 32,
        marginBottom: 24,
    },
    avatarWrapper: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: '#007bff',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        marginBottom: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    username: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 8,
        color: "#333",
        textAlign: 'center',
    },
    formSection: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: "#333",
        marginBottom: 4,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
        backgroundColor: "#fff",
        marginBottom: 4,
    },
    saveBtn: {
        backgroundColor: "#007bff",
        padding: 14,
        borderRadius: 8,
        marginTop: 18,
        alignItems: "center",
    },
    saveBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    logOutBtn: {
        backgroundColor: "#f8d7da",
        padding: 14,
        borderRadius: 8,
        marginTop: 18,
        alignItems: "center",
    },
    logOutText: {
        color: "#c82333",
        fontWeight: "bold",
        fontSize: 16,
    },
});

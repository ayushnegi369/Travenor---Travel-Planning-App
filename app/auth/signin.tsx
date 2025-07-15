import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Pressable,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { Link, useRouter } from "expo-router";
// import useUserStore from "../../store/userStore";

import {
    GoogleSignin,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================
// SignIn Screen
// - Handles user sign-in with email and password
// - Supports Google sign-in
// - Stores user data in AsyncStorage on success
// - Navigates to main tabs on successful login
// =========================

const SignIn = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [password, setPassword] = useState("");
    // const { setUserInfo } = useUserStore();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId:
                "1058734721826-mrihdegerqmcqf4l7uirls2ui879u4pu.apps.googleusercontent.com",
            offlineAccess: true,
            forceCodeForRefreshToken: true,
            accountName: "",
        });
    }, []);

    // handleSignIn: Handles sign-in logic, API call, and navigation
    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Both email and password are required");
            return;
        }

        try {
            const response = await axios.post("http://10.0.2.2:3000/signin", {
                email,
                password,
            });
            if (response.data.message === "Signin successful") {
                // setUserInfo({
                //     email: response.data.user.email,
                //     username: response.data.user.username,
                //     jwtToken: response.data.token,
                // });
                const userData = {
                    email: response.data.user.email,
                    username: response.data.user.username,
                    jwtToken: response.data.token,
                };
                // Async Storage
                const jsonValue = JSON.stringify(userData);
                await AsyncStorage.setItem("userData", jsonValue);
                console.log("Signin success:", response.data);
                Alert.alert("Success", "You are signed in!");
                router.push("/tabs");
            } else {
                Alert.alert(`Error: ${response}`);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || error.message;
            console.error("Signin error:", msg);
            Alert.alert("Error Signing In", msg);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin.signOut();
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            const signinData = {
                username: userInfo.data?.user.givenName,
                email: userInfo.data?.user.email,
            };
            const response = await axios.post(
                "http://10.0.2.2:3000/google/signin",
                signinData
            );

            if (response.data.message === "User registered successfully") {
                // setUserInfo({
                //     email: response.data.user.email,
                //     username: response.data.user.username,
                //     jwtToken: response.data.token,
                // });
                const userData = {
                    email: response.data.user.email,
                    username: response.data.user.username,
                    jwtToken: response.data.token,
                };
                const jsonValue = JSON.stringify(userData);
                await AsyncStorage.setItem("userData", jsonValue);
                Alert.alert("Success", "Google Sign-In successful!");
                router.push("/tabs");
            } else if (response.data.message === "User already exists") {
                // setUserInfo({
                //     email: response.data.user.email,
                //     username: response.data.user.username,
                //     jwtToken: response.data.token,
                // });
                const userData = {
                    email: response.data.user.email,
                    username: response.data.user.username,
                    jwtToken: response.data.token,
                };
                const jsonValue = JSON.stringify(userData);
                await AsyncStorage.setItem("userData", jsonValue);
                Alert.alert("Success", "Google Sign-In successful!");
                router.push("/tabs");
            } else {
                Alert.alert(`Error: ${response}`);
            }
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Alert.alert("Cancelled", "Sign-In was cancelled");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Alert.alert("In Progress", "Sign-In is already in progress");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert("Error", "Play Services not available");
            } else {
                console.error(error);
                Alert.alert(
                    "Error",
                    "Something went wrong with Google Sign-In"
                );
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Back Button */}
                    <Pressable
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </Pressable>

                    {/* Form */}
                    <View style={styles.content}>
                        <Text style={styles.title}>Sign In</Text>
                        <Text style={styles.subtitle}>
                            Please sign in to continue
                        </Text>

                        {/* Email */}
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            keyboardType="email-address"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={setEmail}
                        />

                        {/* Password */}
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password"
                                secureTextEntry={!passwordVisible}
                                value={password}
                                onChangeText={setPassword}
                                placeholderTextColor="#666"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Pressable
                                onPress={() =>
                                    setPasswordVisible(!passwordVisible)
                                }
                            >
                                <Ionicons
                                    name={passwordVisible ? "eye-off" : "eye"}
                                    size={22}
                                    color="gray"
                                />
                            </Pressable>
                        </View>

                        <Link href="/auth/forgot-password" style={styles.hint}>
                            {/* Forgot Password */}
                            <Text>Forgot Password?</Text>
                        </Link>

                        {/* Sign In Button */}
                        <Pressable
                            style={styles.signUpButton}
                            onPress={handleSignIn}
                        >
                            <Text style={styles.buttonText}>Sign In</Text>
                        </Pressable>

                        {/* Sign Up Link */}
                        <Link style={styles.loginText} href="/auth/signup">
                            Don't have an account?{" "}
                            <Text style={styles.link}>Sign Up</Text>
                        </Link>

                        {/* OR Divider */}
                        <View style={styles.orContainer}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>OR</Text>
                            <View style={styles.line} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                onPress={handleGoogleSignIn}
                                style={[
                                    styles.socialButton,
                                    { backgroundColor: "#DB4437" },
                                ]}
                            >
                                <FontAwesome
                                    name="google"
                                    size={20}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    { backgroundColor: "#1877F2" },
                                ]}
                            >
                                <FontAwesome
                                    name="facebook"
                                    size={20}
                                    color="white"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    { backgroundColor: "black" },
                                ]}
                            >
                                <FontAwesome
                                    name="twitter"
                                    size={20}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default SignIn;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
        flexGrow: 1,
        justifyContent: "flex-start",
    },
    backBtn: {
        position: "absolute",
        top: 20,
        left: 20,
        padding: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 50,
        zIndex: 1,
    },
    content: { flex: 1, justifyContent: "center" },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "gray",
        marginBottom: 30,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#f0f0f0",
        padding: 14,
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 16,
        color: "#000",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        marginBottom: 8,
        paddingHorizontal: 10,
    },
    passwordInput: { flex: 1, height: 50, fontSize: 16, color: "#000" },
    hint: {
        color: "blue",
        fontWeight: "bold",
        fontSize: 12,
        marginBottom: 28,
        textAlign: "right",
    },
    signUpButton: {
        backgroundColor: "#2e64e5",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
    loginText: { textAlign: "center", marginBottom: 20 },
    link: { color: "#2e64e5", fontWeight: "bold" },
    orContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    orText: { marginHorizontal: 10, color: "gray" },
    line: { flex: 1, height: 1, backgroundColor: "#ccc" },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 40,
    },
    socialButton: {
        padding: 14,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 60,
    },
});

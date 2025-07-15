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
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Link, useRouter } from "expo-router";
// import useUserStore from "../../store/userStore";

import {
    GoogleSignin,
    statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================
// SignUp Screen
// - Handles user registration
// - Checks if user already exists
// - Sends OTP to email for verification
// - Navigates to OTP verification screen on success
// =========================

const SignUp = () => {
    const router = useRouter();
    // const { setUserInfo } = useUserStore();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId:
                "1058734721826-mrihdegerqmcqf4l7uirls2ui879u4pu.apps.googleusercontent.com",
            offlineAccess: true,
            forceCodeForRefreshToken: true,
            accountName: "",
        });
    }, []);

    // TODO: while passing the password i should send it in encrypted form

    // handleSignup: Handles sign-up logic, user existence check, OTP sending, and navigation
    const handleSignup = async () => {
        if (!username || !email || !password) {
            Alert.alert("Error", "All fields are required.");
            return;
        }

        const signupData = {
            username,
            email,
            password,
        };

        try {
            const checkUserExist = await axios.post(
                "http://10.0.2.2:3000/check-user-exist",
                signupData
            );
            if (checkUserExist.data.message === "User already exists") {
                Alert.alert(`User with email : ${email} already exists`);
                return;
            }
            const otpResponse = await axios.post(
                "http://10.0.2.2:3000/send-otp",
                signupData
            );
            if (otpResponse.data.message === "OTP sent successfully") {
                Alert.alert(`Response : ${otpResponse.data.message}`);
                router.push({
                    pathname: "/auth/otp-verification",
                    params: { email, username, password },
                });
            } else {
                Alert.alert(
                    `Error from try signup: ${otpResponse.data.message}`
                );
            }
        } catch (error) {
            Alert.alert(`Error from signup catch: ${error}`);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await GoogleSignin.signOut();
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            const signupData = {
                username: userInfo.data?.user.givenName,
                email: userInfo.data?.user.email,
            };
            const response = await axios.post(
                "http://10.0.2.2:3000/google/signin",
                signupData
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
                // Async local storage
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
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Pressable
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </Pressable>

                    <View style={styles.content}>
                        <Text style={styles.title}>Signup Now</Text>
                        <Text style={styles.subtitle}>
                            Please fill the details and create account
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor="#666"
                            value={username}
                            onChangeText={setUsername}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            keyboardType="email-address"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password"
                                secureTextEntry={!passwordVisible}
                                value={password}
                                onChangeText={setPassword}
                                placeholderTextColor="#666"
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
                        <Text style={styles.hint}>
                            Password must be at least 8 characters
                        </Text>

                        <Pressable
                            style={styles.signUpButton}
                            onPress={handleSignup}
                        >
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </Pressable>

                        <Text style={styles.loginText}>
                            Already have an account?{" "}
                            <Link href="/auth/signin" style={styles.link}>
                                Sign In
                            </Link>
                        </Text>

                        <View style={styles.orContainer}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>OR</Text>
                            <View style={styles.line} />
                        </View>

                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.socialButton,
                                    { backgroundColor: "#DB4437" },
                                ]}
                                onPress={handleGoogleSignIn}
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
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
    content: {
        flex: 1,
        justifyContent: "center",
    },
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
        borderColor: "#ccc",
        marginBottom: 8,
        paddingHorizontal: 10,
    },
    passwordInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: "#000",
    },
    hint: {
        color: "gray",
        fontSize: 12,
        marginBottom: 28,
        paddingLeft: 4,
    },
    signUpButton: {
        backgroundColor: "#2e64e5",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    loginText: {
        textAlign: "center",
        marginBottom: 20,
    },
    link: {
        color: "#2e64e5",
        fontWeight: "bold",
    },
    orContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    orText: {
        marginHorizontal: 10,
        color: "gray",
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#ccc",
    },
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

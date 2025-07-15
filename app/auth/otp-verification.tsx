import React, { useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { OtpInput } from "react-native-otp-entry";
import { useRoute } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import useUserStore from "../../store/userStore";

// =========================
// OTP Verification Screen
// - Handles OTP input and verification for user registration
// - Allows resending OTP
// - Navigates to next step on success
// =========================

const OtpVerification = () => {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(300); // 5:00 countdown
    const { username, email, password } = useLocalSearchParams();
    // const { setUserInfo } = useUserStore();

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = () => {
        const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
        const seconds = String(timer % 60).padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    // handleVerify: Handles OTP verification logic and navigation
    const handleVerify = async () => {
        const data = {
            email,
            otp,
        };
        const signupData = {
            username,
            email,
            password,
        };
        try {
            console.log("data email : ", data.email);
            console.log("signupdata email", signupData.email);
            const response = await axios.post(
                "http://10.0.2.2:3000/verify-otp",
                data
            );
            if (response.data.message === "OTP verified") {
                const signUpresponse = await axios.post(
                    "http://10.0.2.2:3000/signup",
                    signupData
                );
                if (
                    signUpresponse.data.message ===
                    "User registered successfully"
                ) {
                    // Global State Storage
                    // setUserInfo({
                    //     email: signUpresponse.data.user.email,
                    //     username: signUpresponse.data.user.username,
                    //     jwtToken: signUpresponse.data.token,
                    // });
                    // Async local storage
                    const userData = {
                        email: signUpresponse.data.user.email,
                        username: signUpresponse.data.user.username,
                        jwtToken: signUpresponse.data.token,
                    };
                    const jsonValue = JSON.stringify(userData);
                    await AsyncStorage.setItem("userData", jsonValue);
                    Alert.alert("User Registered Successfully !");
                    router.push("/tabs");
                }
            } else {
                Alert.alert(
                    "Error",
                    response.data?.message || "OTP verification failed"
                );
            }
        } catch (err: any) {
            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                    err?.message ||
                    "An error occurred"
            );
        }
    };

    // reGenerateOTP: Handles resending OTP to user's email
    const reGenerateOTP = async () => {
        const sendData = {
            email,
        };
        try {
            const response = await axios.post(
                "http://10.0.2.2:3000/send-otp",
                sendData
            );
            console.log(response);
            Alert.alert("Otp sent successfully !");
        } catch (err) {
            console.log(err);
            Alert.alert(`${err}`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }}>
                {/* Back Button */}
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </Pressable>

                <View style={styles.content}>
                    <Text style={styles.title}>OTP Verification</Text>
                    <Text style={styles.subtitle}>
                        Please check your email to see the verification code
                    </Text>

                    <Text style={styles.otpLabel}>OTP Code</Text>

                    {/* OTP Inputs */}
                    <View style={styles.otpContainer}>
                        <OtpInput
                            numberOfDigits={6}
                            onTextChange={(text) => setOtp(text)}
                        />
                    </View>

                    {/* Verify Button */}
                    <Pressable
                        style={styles.verifyButton}
                        onPress={handleVerify}
                    >
                        <Text style={styles.buttonText}>Verify</Text>
                    </Pressable>

                    {/* Resend + Timer */}
                    <Pressable style={styles.bottomRow} onPress={reGenerateOTP}>
                        <Text style={styles.resendText}>
                            Resend code to your email
                        </Text>
                        <Text style={styles.timerText}>{formatTime()}</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default OtpVerification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    backBtn: {
        position: "absolute",
        top: 20,
        left: 0,
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
    otpLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    otpInput: {
        backgroundColor: "#f0f0f0",
        width: 60,
        height: 60,
        borderRadius: 10,
        fontSize: 24,
        color: "#000",
        textAlign: "center",
    },
    verifyButton: {
        backgroundColor: "#2e64e5",
        padding: 18,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 4,
    },
    resendText: {
        fontSize: 12,
        color: "gray",
    },
    timerText: {
        fontSize: 12,
        color: "gray",
    },
});

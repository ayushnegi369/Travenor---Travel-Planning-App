import React, { useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    KeyboardAvoidingView,
    Alert,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { OtpInput } from "react-native-otp-entry";
import { useLocalSearchParams, useRouter } from "expo-router";

// =========================
// Forgot Password OTP Confirmation Screen
// - Handles OTP input and verification for password reset
// - Navigates to set new password screen on success
// =========================

const ForgotOTP = () => {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(300); // 5:00 countdown
    const { email } = useLocalSearchParams();

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

    const handleVerify = async () => {
        const data = {
            email,
            otp,
        };
        try {
            const response = await axios.post(
                "http://10.0.2.2:3000/forgot-password-otp-confirm",
                data
            );
            if (response.data.message === "OTP verified") {
                Alert.alert(`${response}`);
                router.push(`/auth/set-new-password/${email}`);
            } else {
                Alert.alert(`Error: ${response}`);
            }
        } catch (err) {
            console.log(`Error: ${err}`);
        }
    };

    const reGenerateOTP = async () => {
        const sendData = {
            email,
        };
        try {
            const response = await axios.post(
                "http://10.0.2.2:3000/forgot-password",
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

export default ForgotOTP;

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

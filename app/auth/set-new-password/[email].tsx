import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    Modal,
    Platform,
    KeyboardAvoidingView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

// =========================
// Set New Password Screen
// - Handles new password input for password reset
// - Updates user password on the server
// - Navigates to sign-in screen on success
// =========================

// TODO: Get the email and if user email is found generate otp
// TODO: move to otp-verification page then if otp is correct
// TODO: move to set new password otp where update the password in mongo db via email

const SetNewPassword = () => {
    const [password, setPassword] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();
    const { email } = useLocalSearchParams();

    const handleSetNewPassword = async () => {
        if (!password) {
            Alert.alert("Password is required");
        } else {
            const sendData = {
                email,
                newPassword: password,
            };
            try {
                const response = await axios.post(
                    "http://10.0.2.2:3000/update-user-password",
                    sendData
                );
                console.log(response);
                Alert.alert(`${response}`);
                router.push("/auth/signin");
            } catch (err) {
                console.log("Error from frontend :", err);
                Alert.alert(`${err}`);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                {/* Back Button */}
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </Pressable>
                <View style={styles.content}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>Enter your new password</Text>

                    {/* Email Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        keyboardType="default"
                        placeholderTextColor="#666"
                        value={password}
                        onChangeText={setPassword}
                    />

                    {/* Reset Button */}
                    <Pressable
                        style={styles.resetButton}
                        onPress={handleSetNewPassword}
                    >
                        <Text style={styles.buttonText}>Reset Password</Text>
                    </Pressable>
                </View>

                {/* Modal */}
                <Modal
                    transparent
                    visible={modalVisible}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Ionicons
                                name="checkmark-circle"
                                size={60}
                                color="#2e64e5"
                                style={{ marginBottom: 15 }}
                            />
                            <Text style={styles.modalTitle}>
                                Check your email
                            </Text>
                            <Text style={styles.modalText}>
                                We have sent password recovery instructions to
                                your email.
                            </Text>
                            <Pressable
                                style={[styles.resetButton, { marginTop: 20 }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>OK</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SetNewPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    content: {
        flex: 1,
        justifyContent: "center",
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
        fontSize: 16,
        color: "#000",
        marginBottom: 20,
    },
    resetButton: {
        backgroundColor: "#2e64e5",
        padding: 18,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 30,
        borderRadius: 10,
        alignItems: "center",
        width: "80%",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    modalText: {
        fontSize: 14,
        color: "gray",
        textAlign: "center",
    },
});

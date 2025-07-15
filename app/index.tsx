import React, { useEffect, useState } from "react";
import useUserStore from "../store/userStore";
import { useRouter } from "expo-router";
import SplashScreen from "../components/splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

// =========================
// Main entry point for the app
// - Handles splash screen display
// - Checks for user authentication using AsyncStorage
// - Navigates to main tabs or pager based on auth state
// =========================

export default function Index() {
    const router = useRouter();
    const [showSplash, setShowSplash] = useState(true);
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    // useEffect: Check for stored user authentication token on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("userData");
                const user = jsonValue != null ? JSON.parse(jsonValue) : null;
                setJwtToken(user?.jwtToken || null);
            } catch (e) {
                setJwtToken(null);
            }
        };
        checkAuth();
    }, []);

    // useEffect: Show splash screen for 3 seconds, then navigate based on auth
    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowSplash(false);
            if (jwtToken) {
                router.replace("/tabs");
            } else {
                router.replace("/pager");
            }
        }, 3000);
        return () => clearTimeout(timeout);
    }, [jwtToken]);

    if (showSplash) {
        return <SplashScreen />; // ✅ show splash screen component
    }

    return null; // Will be replaced via router
}

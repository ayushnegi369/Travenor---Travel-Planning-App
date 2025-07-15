import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

const word = "Travenor";

export default function SplashScreen() {
    // Create animated values for each letter
    const animations = useRef(
        word.split("").map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        const animationsSequence = animations.map((anim, index) =>
            Animated.timing(anim, {
                toValue: -20, // jump up
                duration: 300,
                delay: index * 100, // delay each letter
                useNativeDriver: true,
                easing: Easing.out(Easing.quad),
            })
        );

        const reverseSequence = animations.map((anim) =>
            Animated.timing(anim, {
                toValue: 0, // fall back
                duration: 300,
                useNativeDriver: true,
                easing: Easing.in(Easing.quad),
            })
        );

        // Play forward, then reverse
        Animated.sequence([
            Animated.stagger(100, animationsSequence),
            Animated.stagger(100, reverseSequence),
        ]).start();
    }, []);

    return (
        <View style={styles.splashStyle}>
            <View style={styles.wordContainer}>
                {word.split("").map((letter, index) => (
                    <Animated.Text
                        key={index}
                        style={[
                            styles.letter,
                            {
                                transform: [{ translateY: animations[index] }],
                            },
                        ]}
                    >
                        {letter}
                    </Animated.Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    splashStyle: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007bff",
    },
    wordContainer: {
        flexDirection: "row",
    },
    letter: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#fff",
        marginHorizontal: 2,
    },
});

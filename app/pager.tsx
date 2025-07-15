import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    Image,
    Pressable,
    Dimensions,
} from "react-native";
import PagerView from "react-native-pager-view";
import { useRouter } from "expo-router";

const images = [
    require("../assets/carousel-images/image1.png"),
    require("../assets/carousel-images/image2.png"),
    require("../assets/carousel-images/image3.png"),
];

const texts = [
    {
        title: "Life is Short and the world is ",
        highlight: "wide!",
        subtitle:
            "At Friends tours and travel, we customize reliable and trustworthy educational tours to destinations all over the world",
    },
    {
        title: "It's a big world out there go ",
        highlight: "explore!",
        subtitle:
            "To get the best of your adventure you just need to leave and go where you like, we are waiting for you",
    },
    {
        title: "People don't take trips, trips take ",
        highlight: "people!",
        subtitle:
            "At Friends tours and travel, we customize reliable and trustworthy educational tours to destinations all over the world",
    },
];

export default function MyPager() {
    const pagerRef = useRef<PagerView>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            const nextPage = (currentPage + 1) % texts.length;
            pagerRef.current?.setPage?.(nextPage);
        }, 4000);

        return () => clearInterval(interval);
    }, [currentPage]);

    const handleNext = () => {
        if (currentPage < texts.length - 1) {
            pagerRef.current?.setPage?.(currentPage + 1);
        } else {
            router.push("/auth/signin");
        }
    };

    return (
        <View style={styles.container}>
            <PagerView
                style={styles.container}
                initialPage={0}
                ref={pagerRef}
                onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
                {texts.map((item, index) => (
                    <View style={styles.page} key={index}>
                        <Image source={images[index]} style={styles.image} />

                        <Text style={styles.mainText}>
                            {item.title}
                            <Text style={styles.orangeText}>
                                {item.highlight}
                            </Text>
                        </Text>

                        <Text style={styles.subText}>{item.subtitle}</Text>

                        {/* Dots */}
                        <View style={styles.dotsContainer}>
                            {texts.map((_, dotIndex) => (
                                <View
                                    key={dotIndex}
                                    style={[
                                        styles.dot,
                                        currentPage === dotIndex &&
                                            styles.activeDot,
                                    ]}
                                />
                            ))}
                        </View>

                        <Pressable style={styles.button} onPress={handleNext}>
                            <Text style={styles.buttonText}>
                                {index === texts.length - 1
                                    ? "Get Started"
                                    : "Next"}
                            </Text>
                        </Pressable>
                    </View>
                ))}
            </PagerView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    page: {
        alignItems: "center",
        justifyContent: "flex-start",
    },
    image: {
        width: "100%",
        height: "60%",
        resizeMode: "cover",
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    mainText: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        paddingHorizontal: 40,
        marginVertical: 20,
    },
    subText: {
        fontSize: 18,
        color: "gray",
        textAlign: "center",
        paddingHorizontal: 30,
        marginBottom: 10,
    },
    orangeText: {
        color: "orange",
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 15,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#ccc",
        marginHorizontal: 6,
    },
    activeDot: {
        backgroundColor: "orange",
        width: 12,
        height: 12,
    },
    button: {
        width: "90%",
        height: 50,
        marginTop: 10,
        backgroundColor: "blue",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

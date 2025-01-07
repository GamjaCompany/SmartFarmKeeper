import React from "react";
import { View, Image, StyleSheet } from "react-native";

export const Danger = () => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/Danger.png')} // SVG 파일을 이미지로 변환한 파일
                style={styles.image}
            />
        </View>
    );
};

export const Offline = () => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/Offline.png')} // SVG 파일을 이미지로 변환한 파일
                style={styles.image}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50, // 고정된 컨테이너 너비
        height: 50, // 고정된 컨테이너 높이
    },
    image: {
        width: '100%', // 컨테이너 크기에 맞춤
        height: '100%', // 컨테이너 크기에 맞춤
        resizeMode: 'contain', // 이미지 비율 유지
    },
});

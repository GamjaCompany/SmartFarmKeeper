import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";

interface DetectionLog {
    time: string;
    target: string;
    image: string;
}

interface DetectionLogModalProps {
    id: number;
    name: string;
    logs: DetectionLog[];
    onBack: () => void;
}

const DetectionLogModal: React.FC<DetectionLogModalProps> = ({ id, name, logs, onBack }) => {
    const batteryLevel = 92; // 예시 값

    return (
        <View style={styles.card}>
            {/* 말뚝 정보 */}
            <View style={styles.header}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.battery}>🔋 {batteryLevel}%</Text>
            </View>
            <View style={styles.latestDetection}>
                <Text style={styles.warning}>⚠️ 최근 탐지 시기</Text>
                <Text style={styles.time}>{logs[0]?.time || "탐지 기록 없음"}</Text>
            </View>

            {/* 탐지 로그 리스트 */}
            <ScrollView style={styles.logs}>
                {logs.map((log, index) => (
                    <View key={index} style={styles.logItem}>
                        <Image source={{ uri: log.image }} style={styles.logImage} />
                        <View style={styles.logTextContainer}>
                            <Text style={styles.logTime}>⚠️ {log.time}</Text>
                            <Text style={styles.logTarget}>탐지 대상: {log.target}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>← 뒤로가기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#c3e8c9',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '50%', // 카드 크기 조정
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2C9E3E',
    },
    battery: {
        fontSize: 28,
        color: '#000',
    },
    latestDetection: {
        margin: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#fff'
    },
    warning: {
        fontSize: 28,
        color: '#37B34A',
        fontWeight: 'bold',
    },
    time: {
        fontSize: 28,
        color: '#000',
    },
    logs: {
        flex: 1,
    },
    logItem: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
    },
    logTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    logTime: {
        fontSize: 18,
        color: '#37B34A',
        fontWeight: 'bold',
    },
    logTarget: {
        fontSize: 18,
        color: '#000',
    },
    backButton: {
        backgroundColor: "#007bff",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: "flex-start",
        marginBottom: 16,
    },
    backButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default DetectionLogModal;
   

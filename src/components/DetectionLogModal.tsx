import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

interface DetectionLog {
    time: string;
    target: string;
    image: string;
}

interface ScarecrowInfoProps {
    id: number;
    name: string;
    logs: DetectionLog[];
}

const DetectionLogModal: React.FC<ScarecrowInfoProps> = ({ id, name, logs }) => {
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
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFA500',
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
        color: '#000',
    },
    battery: {
        fontSize: 28,
        color: '#000',
    },
    latestDetection: {
        backgroundColor: '#E7E7E7',
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
    },
    warning: {
        fontSize: 28,
        color: '#FF0000',
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
        color: '#FF0000',
        fontWeight: 'bold',
    },
    logTarget: {
        fontSize: 18,
        color: '#000',
    },
});

export default DetectionLogModal;
   

import React, {useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native";

interface DetectionLog {
    time: string;
    // timeStamp?: string;
    target: string;
    image: string;
}

interface DetectionLogModalProps {
    id: number;
    name: string;
    battery: string;
    logs: DetectionLog[];
    onBack: () => void;
}

const DetectionLogModal: React.FC<DetectionLogModalProps> = ({ id, name, battery, logs, onBack }) => {
    const batteryLevel = 92; // 예시 값
    const [isExpanded, setIsExpanded] = useState(true); // 로그 표시 여부 상태

    useEffect(() => {
        console.log("Logs received in DetectionLogModal:", logs);
    }, [logs]);

    // 동적으로 카드 높이를 계산
    const calculateCardHeight = () => {
        const baseHeight = isExpanded ? 230 : -230; // 기본 높이
        const additionalHeight = logs.length * 90; // 로그 한 개당 높이 증가량
        console.log(logs.length)
        const maxHeight = Dimensions.get("window").height * 0.80; // 최대 높이
        return Math.min(baseHeight + additionalHeight, maxHeight);
    };

    return (
        <View style={[styles.card, { height: calculateCardHeight() }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.battery}>🔋 {battery}%</Text>
          </View>
    
          {/* 최근 탐지 시기 버튼 */}
          <TouchableOpacity
            style={styles.latestDetection}
            onPress={() => setIsExpanded(!isExpanded)} // 버튼 클릭 시 표시 상태 변경
          >
            <Text style={styles.warning}>⚠️ 최근 탐지 시기</Text>
            <Text style={styles.time}>{logs[0]?.time || "탐지 기록 없음"}</Text>
          </TouchableOpacity>
    
          {/* 로그 표시 (확장 상태일 때만 표시) */}
          {isExpanded && (
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
          )}
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
        height: '85%', // 카드 크기 조정
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
    logTimeStamp: {
        fontSize: 16,
        color: '#555',
        marginTop: 4,
    },
});

export default DetectionLogModal;
   

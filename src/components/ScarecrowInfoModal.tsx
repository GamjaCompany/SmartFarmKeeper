import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface ScarecrowInfoProps {
    id: number;
    name: string;
    battery: string;
    onArrowClick: (direction: 'left' | 'right') => void;
}

const ScarecrowInfoModal: React.FC<ScarecrowInfoProps> = ({ id, name, battery, onArrowClick }) => {
    return (
        <View style={styles.card}>
            {/* 말뚝 정보 */}
            <View style={styles.row}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.battery}>🔋 {battery}%</Text>{/* server에서 get */}
            </View>
            <View style={styles.row}>
                <Text style={styles.warning}>최근 탐지 시기 ⚠️</Text>
                <Text style={styles.time}>1시간 6분 전</Text>
            </View>

            {/* 화살표 버튼 */}
            <View style={styles.buttons}>
                <TouchableOpacity 
                    style={styles.arrowButton}
                    onPress={() => onArrowClick('left')}
                >
                    <Text style={styles.arrowText}>←</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.arrowButton}
                    onPress={() => onArrowClick('right')}
                >
                    <Text style={styles.arrowText}>→</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

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
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    battery: {
        fontSize: 16,
        color: '#000',
    },
    warning: {
        fontSize: 16,
        color: '#FF0000',
        fontWeight: 'bold',
    },
    time: {
        fontSize: 16,
        color: '#000',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    arrowButton: {
        backgroundColor: '#FFD700', // 화살표 버튼 색
        borderRadius: 10,
        padding: 20,
    },
    arrowText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default ScarecrowInfoModal;

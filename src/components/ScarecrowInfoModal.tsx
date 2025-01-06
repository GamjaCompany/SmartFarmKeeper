import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface ScarecrowInfoProps {
    id: number;
    name: string;
    battery: string;
    onArrowClick: (direction: 'left' | 'right') => void;
    onDetailInfoClick: () => void;
}

const ScarecrowInfoModal: React.FC<ScarecrowInfoProps> = ({ id, name, battery, onArrowClick, onDetailInfoClick }) => {
    // const batteryLevel = 92; // dummy - get required
    const lastDetection = "1시간 6분 전"; // dummy - get required - use castTime

    const castTime = (timeString: string): string => {
        const inputTime = new Date(timeString); // 입력된 시간
        const now = new Date(); // 현재 시간

        // 시간 차이 (밀리초 단위)
        const diff = now.getTime() - inputTime.getTime();

        if (isNaN(diff)) {
            throw new Error("Invalid date format. Please provide a valid ISO date string.");
        }

        // 시간 단위 변환
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // 적절한 문자열 반환
        if (seconds < 60) {
            return `${seconds}초 전`;
        } else if (minutes < 60) {
            return `${minutes}분 전`;
        } else if (hours < 24) {
            return `${hours}시간 전`;
        } else {
            return `${days}일 전`;
        }
    };

    return (
        <View style={styles.card}>
            {/* 말뚝 정보 */}
            <View style={styles.header}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.battery}>🔋{battery}%</Text>
            </View>
            <View>
                <TouchableOpacity
                    style={styles.detectBtn}
                    onPress={onDetailInfoClick} // 클릭 시 함수 호출
                >
                    {/* 탐지 시기와 경고 메시지 */}
                    <View style={styles.detectContent}>
                        <Text style={styles.warning}>⚠️ 최근 탐지 시기</Text>
                        <Text style={styles.time}>{lastDetection || "탐지 기록 없음"}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 화살표 버튼 */}
            {/* <View style={styles.buttons}>
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
            </View> */}
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    detectBtn: {
        margin: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#E7E7E7',
    },
    detectContent: {
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
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
    warning: {
        fontSize: 28,
        color: '#FF0000',
        fontWeight: 'bold',
    },
    time: {
        paddingLeft: 40,
        fontSize: 28,
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
        width: "40%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    arrowText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default ScarecrowInfoModal;

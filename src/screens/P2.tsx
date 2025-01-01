import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, PermissionsAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const P2: React.FC = () => {
  
    // 위치 권한 요청 함수
    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'We need your location to show the map',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Location permission granted');
            } else {
                console.log('Location permission denied');
            }
        }
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    return (
        <View style={styles.container}>
            {/* 지도 영역 */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 37.5665, // 초기 위도
                    longitude: 126.9780, // 초기 경도
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {/* 말뚝 마커 */}
                <Marker
                    coordinate={{ latitude: 37.5665, longitude: 126.9780 }}
                    title="1번 말뚝"
                />
                <Marker
                    coordinate={{ latitude: 37.5655, longitude: 126.9770 }}
                    title="2번 말뚝"
                />
            </MapView>

            {/* 하단 카드 영역 */}
            <View style={styles.card}>
                {/* 말뚝 정보 */}
                <View style={styles.row}>
                    <Text style={styles.title}>3번 말뚝</Text>
                    <Text style={styles.battery}>🔋 92%</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.warning}>최근 탐지 시기 ⚠️</Text>
                    <Text style={styles.time}>1시간 6분 전</Text>
                </View>

                {/* 화살표 버튼 */}
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.arrowButton}>
                        <Text style={styles.arrowText}>←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.arrowButton}>
                        <Text style={styles.arrowText}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    card: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFA500', // 주황색 배경
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
        color: '#FF0000', // 경고 텍스트 빨간색
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

export default P2;

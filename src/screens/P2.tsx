import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, Text, FlatList, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ScarecrowInfoModal from '../components/ScarecrowInfoModal';
import DetectionLogModal from '../components/DetectionLogModal';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import mqtt from 'mqtt';

interface Item {
    id: number;
    name: string;
    status: string;
    statusDot: string;
    battery: string;
    lat: number;
    lng: number;
}

interface DetectionLog {
    time: string;
    object?: string;
    img_url?: string;
  }
  

type RouteParams = {
    params: {
        items?: Item[];
        itemId?: number;
        battery?: string;
        logs?: DetectionLog[];
    };
};

const P2: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'params'>>();
    const [items, setItems] = useState<Item[]>(route.params?.items || []);
    const [currentModal, setCurrentModal] = useState<"ScarecrowInfo" | "DetectionLog">("ScarecrowInfo");
    const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [logs, setLogs] = useState<DetectionLog[]>([]);
    const [itemId, setItemId] = useState<number | null>(null);
    const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
    const [battery, setBattery] = useState<string>('??');
    // const [items, setItems] = useState<Item[]>(route.params?.items || []);

    useEffect(() => {
        if (route.params?.logs) {
            const formattedLogs = route.params.logs.map((log) => ({
                time: log.time,
                target: log.object ?? 'Unknown',
                image: log.img_url ?? '',
            }));
            setLogs(formattedLogs);
            setItemId(route.params.itemId || null);
            setBattery(route.params.battery || '??');
            setModalVisible(true);
        }
    }, [route.params]);

    useEffect(() => {
        if (currentItemIndex >= items.length) {
            setCurrentItemIndex(0); // 안전한 값으로 초기화
        }
    }, [currentItemIndex, items]);

    useEffect(() => {
        requestLocationPermission(); 
      }, []);

      useEffect(() => {
        // P1에서 전달받은 값 저장
        if (route.params?.itemId) {
            setItemId(route.params.itemId);
            setBattery(route.params.battery || '??');
        }
    }, [route.params]);

    useEffect(() => {
        const client = mqtt.connect('wss://1c15066522914e618d37acbb80809524.s1.eu.hivemq.cloud:8884/mqtt', {
            username: 'tester',
            password: 'Test1234',
        });

        client.on('connect', () => {
            console.log('MQTT Connected');
            setMqttClient(client);

            // GET_Response 구독
            client.subscribe('GET_Response', (err) => {
                if (err) {
                    console.error('Subscription error:', err);
                }
            });
        });

        client.on('message', (topic, message) => {
            if (topic === 'GET_Response') {
                try {
                    const parsed = JSON.parse(message.toString());
                    if (parsed.prev_list) {
                        // prev_list 변환 후 logs에 저장
                        const formattedLogs = parsed.prev_list.map(
                            (log: { time_stamp: string; object?: string; img_url?: string }) => ({
                                time: log.time_stamp,
                                target: log.object ?? 'Unknown',
                                image: log.img_url ?? '',
                            })
                        );
                        setLogs(formattedLogs);
                        setModalVisible(true); // Modal 표시
                    }
                } catch (error) {
                    console.error('Failed to parse MQTT message:', error);
                }
            }
        });

        return () => {
            client.end(true, () => console.log('MQTT Client Disconnected'));
        };
    }, []);

    useEffect(() => {
        // itemId가 설정되면 GET 요청 발행
        if (itemId && mqttClient) {
            const topic = 'GET';
            const message = JSON.stringify({ idx: itemId });

            mqttClient.publish(topic, message, (err) => {
                if (err) {
                    console.error('Error publishing GET message:', err);
                } else {
                    console.log(`GET message sent: ${message}`);
                }
            });
        }
    }, [itemId, mqttClient]);
    const [mapKey, setMapKey] = useState(0);    // temp key for map rerendering
    const [mapRegion, setMapRegion] = useState({
        latitude: 37.8695,
        longitude: 127.7430,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

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

    useFocusEffect(
        React.useCallback(() => {
            console.log('Navigated back. Route params:', route.params?.items);
    
            if (Array.isArray(route.params?.items)) {
                setItems([...route.params.items]); // 새로운 배열로 설정
                updateMapRegion(route.params.items); // 지도 중심 업데이트
            } else {
                setItems([]); // 빈 배열로 초기화
            }
    
            setCurrentItemIndex(0); // 초기화
            setMapKey((prevKey) => prevKey + 1); // 지도 강제 재랜더링
        }, [route.params?.items])
    );

    const handleDetailInfoClick = () => {
        setCurrentModal("DetectionLog");
    };

    const handleBackToScarecrowInfo = () => {
        setCurrentModal("ScarecrowInfo");
    };

    const currentItem = items.length > 0 ? items[currentItemIndex] : null;

    const updateMapRegion = (items: Item[]) => {
        if (items.length === 0) return;

        // 모든 마커의 중심을 계산
        const latitudes = items.map((item) => item.lat);
        const longitudes = items.map((item) => item.lng);
        const avgLatitude =
            latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
        const avgLongitude =
            longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;

        setMapRegion({
            latitude: avgLatitude,
            longitude: avgLongitude,
            latitudeDelta: 0.005, // 적당한 확대 수준 설정
            longitudeDelta: 0.005,
        });
    };

    const handleMarkerPress = (itemId: number) => {
        const index = items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
            setCurrentItemIndex(index); // 선택된 말뚝의 정보를 설정
            setCurrentModal("ScarecrowInfo"); // ScarecrowInfoModal을 열도록 설정
        }
    };

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.mapContainer}>
                    <MapView
                        key={mapKey}
                        style={styles.map}
                        mapType="satellite"
                        region={mapRegion}
                        onMapReady={() => console.log('Map is ready')}
                    >
                        {items.map((item) => {
                    console.log('Rendering Marker with coordinates:', item.lat, item.lng);
                    if (typeof item.lat !== 'number' || typeof item.lng !== 'number') {
                        console.error(`Invalid coordinates for item with id ${item.id}`);
                        return null; // Marker를 렌더링하지 않음
                    }
                    return (
                        <Marker
                            key={item.id} // 동적인 키 생성
                            coordinate={{
                                latitude: item.lat,
                                longitude: item.lng,
                            }}
                            title={`${item.id}번 말뚝`}
                            onPress={() => handleMarkerPress(item.id)}
                        />
                    );
                })}

            </MapView>

            {currentItem && currentModal === "ScarecrowInfo" && (
                <ScarecrowInfoModal
                    id={currentItem.id}
                    name={currentItem.name}
                    battery={currentItem.battery}
                    // onArrowClick={handleArrowClick}
                    onDetailInfoClick={handleDetailInfoClick}
                />
            )}
                </View>
            </TouchableWithoutFeedback>
            {modalVisible && (
                <DetectionLogModal
                    id={itemId || 0}
                    name={`${itemId || 0}번 말뚝`}
                    battery={battery}
                    logs={logs}
                    onBack={() => setModalVisible(false)} // Modal 닫기
                />
            )}
        </View>
    );
};
            {/* {currentModal === "ScarecrowInfo" ? (
            <MapView
                key={mapKey}
                style={styles.map}
                mapType="satellite"
                region={mapRegion}
                onMapReady={() => console.log('Map is ready')}
            >

                {/* <Marker
                    key={9}
                    coordinate={{
                        latitude: 37.8697,
                        longitude: 127.7435,
                    }}
                    title="test"
                /> */}

                
                

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
    },
    logContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0, right: 0,
        backgroundColor: '#fff',
        padding: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '40%', // 로그 표시 높이 제한
      },
      infoText: {
        fontSize: 16,
        marginBottom: 6,
      },
      logItem: {
        paddingVertical: 4,
      },
      logText: {
        fontSize: 14,
        color: '#333',
      },
});

export default P2;

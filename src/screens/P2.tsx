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
    battery: string;
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
    // const [items, setItems] = useState<Item[]>([
    //     { id: 1, name: '1번 말뚝', status: '정상' },
    //     { id: 2, name: '2번 말뚝', status: '고장' },
    //     { id: 3, name: '3번 말뚝', status: '고장' },
    //     { id: 4, name: '4번 말뚝', status: '꺼짐' },
    // ]);
    const route = useRoute<RouteProp<RouteParams, 'params'>>();
    const [currentModal, setCurrentModal] = useState<"ScarecrowInfo" | "DetectionLog">("ScarecrowInfo");
    const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [logs, setLogs] = useState<DetectionLog[]>([]);
    const [itemId, setItemId] = useState<number | null>(null);
    const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
    const [battery, setBattery] = useState<string>('??');
    // const [items, setItems] = useState<Item[]>(route.params?.items || []);

        // 파라미터에서 받아온 값들
    const items   = route.params?.items   || [];

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
            if (route.params?.items) {
                // setItems(route.params.items);
            }
        }, [route.params?.items])
    );

    const handleArrowClick = (direction: 'left' | 'right') => {
        setCurrentItemIndex((prevIndex) => {
            if (direction === 'left') {
                return prevIndex === 0 ? items.length - 1 : prevIndex - 1;
            } else {
                return prevIndex === items.length - 1 ? 0 : prevIndex + 1;
            }
        });
    };

    const handleDetailInfoClick = () => {
        setCurrentModal("DetectionLog");
    };

    const handleBackToScarecrowInfo = () => {
        setCurrentModal("ScarecrowInfo");
    };

    const currentItem = items[currentItemIndex]; // 현재 선택된 말뚝 아이템

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 37.5665,
                            longitude: 126.9780,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        onMapReady={() => console.log('Map is ready')}
                    >
                        {items.map((item) => (
                            <Marker
                                key={item.id}
                                coordinate={{ latitude: 37.5665 + item.id * 0.001, longitude: 126.9780 + item.id * 0.001 }}
                                title={item.name}
                            />
                        ))}
                    </MapView>
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
                <ScarecrowInfoModal
                    id={currentItem.id}
                    name={currentItem.name}
                    battery={currentItem.battery}
                    onArrowClick={handleArrowClick}
                    onDetailInfoClick={handleDetailInfoClick}
                />
            ) : (
                <DetectionLogModal
                    id={currentItem.id}
                    name={currentItem.name}
                    logs={[
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        {
                            time: "2025-01-01 12:00",
                            target: "사람",
                            image: "https://example.com/image1.jpg",
                        },
                        
                    ]}
                    onBack={handleBackToScarecrowInfo}
                />
            )} */}

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
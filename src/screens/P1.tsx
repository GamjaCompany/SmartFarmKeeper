import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mqtt from 'mqtt';
import { Notifications } from 'react-native-notifications';
import Toast from 'react-native-toast-message';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

import DetectionLogModal from '../components/DetectionLogModal';

const DOUBLE_TAP_INTERVAL = 300;

interface Item {
    id: number;
    name: string;
    status: string;
    statusDot: string;
    battery: string;
    lat: number
    lng: number
}

// 예시: 말뚝 별로 미리 정의된(또는 서버에서 가져올) 탐지 로그
interface DetectionLog {
    time: string;
    target: string;
    image: string;
}

// 말뚝 id => 해당 말뚝의 로그 목록(가짜 데이터) 라고 가정
const dummyLogs: Record<number, DetectionLog[]> = {
    1: [
        { time: '2025-01-01 12:00', target: '사람', image: 'https://example.com/image1.jpg' },
        { time: '2025-01-01 13:34', target: '고라니', image: 'https://example.com/image2.jpg' },
    ],
    2: [
        { time: '2025-01-02 08:00', target: '사람', image: 'https://example.com/image3.jpg' },
    ],
    // ...
    // id가 더 있다면 여기에 추가
};

interface StackParamList extends ParamListBase {
    P1: undefined;
    P2: undefined;
};

type P1ScreenNavigationProp = StackNavigationProp<StackParamList, 'P1'>;

const P1: React.FC = () => {
    // const [clientId, setClientId] = useState<string | null>(null);

    const [items, setItems] = useState<Item[]>([]);
    const [mqttMessage, setMqttMessage] = useState<string>('MQTT message');
    const [modalVisible, setModalVisible] = useState(false);
    const [numDevices, SetNumDevices] = useState<number>(0);
    // const [deleteMode, setDeleteMode] = useState<number | null>(null); // 제거 모드 활성화 상태
    const [selectedItem, setSelectedItem] = useState<Item | null>(null); // 선택된 아이템
    const [isContextMenuVisible, setIsContextMenuVisible] = useState(false); // 컨텍스트 메뉴 표시 여부
    const navigation = useNavigation<P1ScreenNavigationProp>();
    const [message, setMessage] = useState('');
    const [mqttClient, setMqttClient] = useState<mqtt.MqttClient | null>(null);
    const lastTapRef = useRef<number | null>(null);
    const [deletedItems, setDeletedItems] = useState<number[]>([]);
    const [lastPrevList, setLastPrevList] = useState<DetectionLog[]>([]);

    const [logModalVisible, setLogModalVisible] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState<DetectionLog[]>([]);

    // const generateClientId = (): string => {
    //     const chars = '0123456789';
    //     return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    // };

    const handleDragEnd = ({ data }: { data: Item[] }) => {
        setItems(data); // 드래그 후 정렬된 데이터로 상태 업데이트
        saveItemToStorage(data); // 정렬된 데이터 스토리지에 저장
    };

    const handleDeleteItem = async (id: number) => {
        try {
            const updatedItems = items.filter((item) => item.id !== id); // 삭제된 항목 제외
            setItems(updatedItems); // 상태 업데이트
            
            // 삭제된 idx를 저장
            setDeletedItems((prev) => [...prev, id]);
    
            // 비동기 스토리지 업데이트 후 numDevices 업데이트
            await saveItemToStorage(updatedItems);
            console.log('Current items in storage after deletion:', updatedItems);
    
            // numDevices 상태 업데이트
            SetNumDevices(updatedItems.length); // updatedItems 배열의 길이 사용
        } catch (error) {
            console.error('Error deleting item:', error);
        } finally {
            setIsContextMenuVisible(false); // 컨텍스트 메뉴 닫기
        }
    };

    const handleLongPress = (item: Item) => {
        setSelectedItem(item);
        setIsContextMenuVisible(true); // 컨텍스트 메뉴 열기
    };

    // ★ 탐지 로그 모달을 열기 위한 함수 (Single Tap 시 호출)
    const showLogModal = (pileId: number) => {
        // 만약 실제 서버에서 가져온다면, 여기서 fetch 호출 or mqtt 통신 후 setSelectedLogs()
        // 지금은 dummyLogs 에서 가져옴
        const logs = dummyLogs[pileId] || [];
        setSelectedLogs(logs);
        setLogModalVisible(true);
    };

    const handleTap = (item: Item) => {
        const now = Date.now();
        if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_INTERVAL) {
            // 더블 탭인 경우 → 컨텍스트 메뉴 표시
            lastTapRef.current = null;
            setSelectedItem(item);
            setIsContextMenuVisible(true);
        } else {
            lastTapRef.current = now;
            setTimeout(() => {
                if (lastTapRef.current && Date.now() - lastTapRef.current >= DOUBLE_TAP_INTERVAL) {
                    console.log('Single tap detected for item:', item.id);
    
                    if (mqttClient) {
                        const topic = 'GET';
                        const message = JSON.stringify({ idx: item.id });
    
                        mqttClient.publish(topic, message, (error) => {
                            if (error) {
                                console.error('Error publishing MQTT message:', error);
                            } else {
                                console.log(`Message sent to topic '${topic}': ${message}`);
                            }
                        });
                    } else {
                        console.error('MQTT client is not connected');
                    }
    
                    navigation.navigate('P2', {
                        itemId: item.id,
                        battery: item.battery, // P2로 id와 배터리를 전달
                    });
    
                    lastTapRef.current = null;
                }
            }, DOUBLE_TAP_INTERVAL);
        }
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<Item>) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: isActive ? '#f0f0f0' : '#fff' },]} // 드래그 중인 항목 스타일
            onLongPress={drag}
            delayLongPress={500}
            // 탭(싱글/더블) 처리
            onPress={() => handleTap(item)}
        >
            <Text style={styles.cardTitle}>{item.id}번 말뚝</Text>
            <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: item.statusDot }]}/>
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    const saveItemToStorage = async (itemList: Item[]) => {
        try {
            const jsonValue = JSON.stringify(itemList);
            await AsyncStorage.setItem('@piling_items', jsonValue);
            console.log('Items saved to storage!');
            console.log(items);
        } catch (e) {
            console.error('Failed to save items to storage:', e);
        }
    };

    const loadItemsFromStorage = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@piling_items');
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Failed to load items from storage:', e);
            return [];
        }
    };

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const storedItems = await loadItemsFromStorage();
                setItems(storedItems);
                SetNumDevices(storedItems.length);
            } catch (error) {
                console.error('Error loading items from storage:', error);
            }
        };

        fetchItems();
    }, []);

    useEffect(() => {
        // items와 deletedItems 상태를 최신 상태로 동기화
        setDeletedItems((prev) =>
          prev.filter((id) => !items.some((item) => item.id === id))
        );
      }, [items]);

    useEffect(() => {
        const intervalId = setInterval(() => {
          console.log('현재 items 리스트:', items);
        }, 5000);
    
        // 언마운트되거나 items 변경으로 useEffect 재실행 시 interval 정리
        return () => {
          clearInterval(intervalId);
        };
      }, [items]); 

    // useEffect(() => {
    //         AsyncStorage.clear()
    //             .then(() => {
    //                 console.log('All AsyncStorage data cleared');
    //             })
    //             .catch((error) => {
    //                 console.error('Error clearing AsyncStorage:', error);
    //             });

    //     }, []);

    useEffect(() => {
        try {
            const client = mqtt.connect('wss://1c15066522914e618d37acbb80809524.s1.eu.hivemq.cloud:8884/mqtt', {
                username: 'tester',
                password: 'Test1234',
            });

            client.on('connect', () => {
                console.log('MQTT Connected');
                setMqttClient(client);

                client.subscribe('Notify', (err) => {
                    if (err) {
                        console.error('Subscription error:', err);
                    }
                });
                client.subscribe('GET_Response', (err) => {
                    if (err) {
                        console.error('Subscription error:', err);
                    }
                });
                client.subscribe('Response', (err) => {
                    if (err) {
                        console.error('Subscription error:', err);
                    }
                });
            });

            client.on('message', (topic, message) => {
                // console.log(`Received message from topic ${topic}: ${message.toString()}`);
                const parsed = JSON.parse(message.toString());

                try {
                    // prev_list가 존재하면 추출
                    if (parsed.prev_list) {
                        // prev_list만 문자열로 변환해 저장
                        const listStr = JSON.stringify(parsed.prev_list, null, 2);
                        // console.log("HELLO"+listStr);
                    } else {
                        // prev_list가 없다면 기존 로직
                        setMqttMessage(message.toString());
                    }

                } catch (err) {
                    console.error('JSON parse error:', err);
                    // parse 실패하면 그냥 메시지 그대로 저장
                    setMqttMessage(message.toString());
                }


                if (topic === 'Notify') {
                    try {
                        const parsedData = JSON.parse(message.toString());
                        const { idx, status, battery, cmd, lat, lng } = parsedData;
                        let nowStatus = "";
                        let statusDot = "";
                        const iLat = Number(lat);
                        const iLng = Number(lng);

                        if (cmd === "new_device") {
                            const isDuplicate = items.some((item) => item.id === idx);

                            if (isDuplicate) {
                                console.log(`Duplicate idx (${idx}) detected. Ignoring command.`);
                                return; // 중복된 경우 처리 중단
                            }
                            if (status === "GOOD") {
                                nowStatus = "정상";
                                statusDot = "green";
                            }
                            else if (status === "BAD") {
                                nowStatus = "고장";
                                statusDot = "red";
                            }
                            else if (status === "OFF") {
                                nowStatus = "꺼짐";
                                statusDot = "gray";
                            }

                            setSelectedItem({
                                id: idx,
                                name: `${numDevices + 1}번 말뚝`,
                                status: nowStatus,
                                statusDot,
                                lat: iLat,
                                lng: iLng,
                                battery,
                            });
                            setModalVisible(true); // 팝업 표시
                        }
                        else if (cmd === "status_update") {
                            if (status === "GOOD") {
                                console.log("good");
                                nowStatus = "정상";
                                statusDot = "green";
                            }
                            else if (status === "BAD") {
                                console.log("bad");
                                nowStatus = "고장";
                                statusDot = "red";
                            }
                            else if (status === "OFF") {
                                console.log("off");
                                nowStatus = "꺼짐";
                                statusDot = "gray";
                            }

                            console.log('Updating status for idx:', idx, 'with status:', nowStatus);
                            console.log('Current items:', items);

                            setItems((prevItems) =>
                                prevItems.map((item) =>
                                    item.id === idx
                                        ? { ...item, status: nowStatus, statusDot }
                                        : item
                                )
                            );
                        }
                        else if(cmd === "alert"){
                            console.log("alert");

                            Notifications.postLocalNotification({
                                title : "움직임 감지",
                                body: `${idx}번 말뚝에서 움직임이 감지되었습니다.`,
                                identifier: `alert-${idx}`, // 알림의 고유 ID (필수 아님, 하지만 권장)
                                payload: { idx },           // 알림과 함께 전달할 데이터 (필수 아님)
                                sound: "default",           // 알림 사운드 (기본값: default)
                                badge: 1,  
                                type: "default",                                // 알림 유형 (필수)
                                thread: `thread-${idx}`,                        // 알림 스레드 (필수)
                            });

                            // Toast 메시지
                            Toast.show({
                                type: "success",           // 성공 스타일 (default, success, error 중 선택)
                                text1: "움직임 감지",    // 제목
                                text2: `${idx}번 말뚝에서 움직임이 감지되었습니다.`, // 메시지 내용
                                position: "top",        // 위치 (top, bottom)
                                visibilityTime: 3000,      // 표시 시간 (ms)
                            });
                        }
                    } catch (error) {
                        console.error('Error parsing MQTT message:', error);
                    }
                }
            });

            client.on('close', () => console.log('MQTT Connection Closed'));

            client.on('error', (error) => {
                console.error('MQTT Connection Error:', error);
            });

            client.on('offline', () => console.log('MQTT Offline'));

            client.on('reconnect', () => console.log('MQTT Reconnecting...'));

            return () => {
                client.end(true, () => {
                    console.log('MQTT Disconnected');
                });
            };
        } catch (error) {
            console.error('useEffect Error:', error);
        }
    }, [numDevices]);


    return (
        <View style={styles.container}>
            <DraggableFlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                onDragEnd={({ data }) => {
                    setItems(data); // 드래그 후 정렬된 데이터 저장
                    saveItemToStorage(data); // 스토리지에 저장
                }}
                activationDistance={10} // 드래그 민감도 설정
            />
            {isContextMenuVisible && (
            <TouchableWithoutFeedback onPress={() => setIsContextMenuVisible(false)}>
                    <View style={[styles.contextMenuOverlay, { zIndex: 10 }]}>
                        {/* 여기는 '배경' 영역. 실제 클릭하면 메뉴를 닫음 */}
                        <TouchableWithoutFeedback onPress={() => { /* 여기서는 닫히지 않음 */ }}>
                            <View style={[styles.contextMenuBox, { zIndex: 11 }]}>
                                <Text style={styles.contextMenuTitle}>
                                    {selectedItem?.id}번 말뚝 삭제
                                </Text>
                                <TouchableOpacity
                                    style={styles.contextMenuButton}
                                    onPress={() => {
                                        if (selectedItem) {
                                            handleDeleteItem(selectedItem.id);
                                        }
                                    }}
                                >
                                    <Text style={styles.contextMenuButtonText}>삭제</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}
            {modalVisible && (
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>새로운 말뚝을 찾았어요!</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={async () => {
                                if (selectedItem) {
                                    // 중복 검사: selectedItem.id가 이미 items 배열에 존재하는지 확인
                                    const isDuplicate = items.some((item) => item.id === selectedItem.id);

                                    if (!isDuplicate) {
                                        const newItem = {
                                            id: selectedItem.id,
                                            name: selectedItem.name,
                                            status: selectedItem.status,
                                            statusDot: selectedItem.statusDot,
                                            lat: selectedItem.lat,
                                            lng: selectedItem.lng,
                                            battery: selectedItem.battery,
                                        };

                                        setItems((prevItems) => [...prevItems, newItem]);
                                        SetNumDevices(numDevices + 1);

                                        // 스토리지에 저장
                                        try {
                                            const currentItems = await loadItemsFromStorage();
                                            await saveItemToStorage([...currentItems, newItem]);
                                        } catch (error) {
                                            console.error('Error saving new item to storage:', error);
                                        }
                                    } else {
                                        console.log(`Duplicate device (id: ${selectedItem.id}) not added.`);
                                    }
                                }
                                setModalVisible(false); // 팝업 닫기
                            }}
                        >
                            <Text style={styles.modalButtonText}>지금 추가</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: 'gray' }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>추가 안 함</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {/* 탐지 로그 모달 (Single Tap 시 표시)
            {logModalVisible && (
                <DetectionLogModal
                    id={selectedItem?.id || 0}
                    name={selectedItem?.name || '말뚝'}
                    logs={selectedLogs}
                    onBack={() => setLogModalVisible(false)}
                />
            )} */}
            {/* <ScrollView contentContainerStyle={styles.scrollView}>
                {items.map((item) => (
                    // <Scarecrow key={item.id} id={item.id} name={item.name} status={item.status}/>
                    <View key={item.id} style={styles.card}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <View style={styles.statusContainer}>
                            <View style={[styles.statusDot, { backgroundColor: item.statusDot }]} />
                            <Text style={styles.statusText}>{item.status}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView> */}
            {/* <View style={styles.mqttContainer}>
                <Text style={styles.mqttText}>{mqttMessage}</Text>
            </View> */}
            {/* <View style={styles.showanalysis}>
                <TouchableOpacity style={styles.button} onPress={() => {
                    console.log("click!");
                    navigation.navigate('P2', { items });
                }}>
                    <Text style={styles.buttonText}>분석 보기</Text>
                </TouchableOpacity>
            </View> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3d3d3d',
        padding: 20,
    },
    scrollView: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        height: 150,
        marginBottom: 10,
        borderWidth: 4,
        borderColor: '#18d',
        borderRadius: 45,
        backgroundColor: '#fff',
    },
    cardTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#000',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#000',
    },
    statusDot: {
        width: 20,
        height: 20,
        marginRight: 10,
        borderRadius: 15,
    },
    mqttContainer: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#18d',
        borderRadius: 10,
        alignItems: 'center',
    },
    mqttText: {
        fontSize: 16,
        color: '#000',
    },
    button: {
        alignSelf: 'center',
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 20,
        marginTop: 20,
    },
    buttonText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButton: {
        width: '100%',
        padding: 15,
        backgroundColor: '#000',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    contextMenuOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // 반투명
        justifyContent: 'center',
        alignItems: 'center',
    },
    contextMenuBox: {
        width: 250,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    contextMenuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    contextMenuButton: {
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#000',
        borderRadius: 8,
    },
    contextMenuButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    showanalysis: {
        position: 'absolute', // 버튼을 고정
        bottom: 20, // 하단에서의 거리
        left: 20, // 좌측 여백
        right: 20, // 우측 여백
        alignItems: 'center',
    }  
});

export default P1;
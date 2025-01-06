import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mqtt from 'mqtt';
import { Notifications } from 'react-native-notifications';
import Toast from 'react-native-toast-message';

interface Item {
    id: number;
    name: string;
    status: string;
    statusDot: string;
    battery: string;
}

interface StackParamList extends ParamListBase {
    P1: undefined;
    P2: undefined;
};

type P1ScreenNavigationProp = StackNavigationProp<StackParamList, 'P1'>;

const P1: React.FC = () => {

    const [clientId, setClientId] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [mqttMessage, setMqttMessage] = useState<string>('MQTT message');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const navigation = useNavigation<P1ScreenNavigationProp>();

    const generateClientId = (): string => {
        const chars = '0123456789';
        return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    // useEffect(() => {
    //     AsyncStorage.clear()
    //         .then(() => {
    //             console.log('All AsyncStorage data cleared');
    //         })
    //         .catch((error) => {
    //             console.error('Error clearing AsyncStorage:', error);
    //         });

    // }, []);

    useEffect(() => {
        const initializeClientId = async (client: mqtt.MqttClient) => {
            try {
                let validClientId = false;
                let newClientId = '';

                const storedClientId = await AsyncStorage.getItem('clientId');
                if (storedClientId) {
                    // 저장된 ID가 있으면 그것을 사용
                    newClientId = storedClientId;
                    console.log('Using stored client ID:', newClientId);
                    return;
                }

                // 메시지 핸들러 등록 (최초 한 번만 등록)
                const messageHandler = (topic: string, message: Buffer) => {
                    if (topic === "GET_Response") {
                        try {
                            const response = JSON.parse(message.toString());
                            console.log("Received response:", response);
        
                            if (response.result === "Y") {
                                // 유효한 ID가 오면 저장하고 반복문 종료
                                AsyncStorage.setItem('clientId', newClientId);
                                setClientId(newClientId);
                                console.log('Generated valid client ID:', newClientId);
                                validClientId = true;  // 유효한 ID를 받으면 반복문 종료
                            } else if (response.result === "N") {
                                console.log("Invalid ID received. Generating a new one...");
        
                                // N 응답이 오면 새로운 클라이언트 ID를 생성해서 다시 요청
                                newClientId = generateClientId(); // 새로운 ID 생성 함수 호출
                                client.publish("GET", JSON.stringify({
                                    uuid: newClientId,
                                    cmd: 'check_id',
                                }));
                            }
                        } catch (error) {
                            console.error("Error parsing GET_Response message:", error);
                        }
                    }
                };
        
                // 메시지 핸들러 등록
                client.on('message', messageHandler);
        
                // 최초 클라이언트 ID를 생성하고 확인 요청
                // newClientId = generateClientId(); // 새로운 ID 생성 함수 호출
                newClientId = '012345678910';
                client.publish("GET", JSON.stringify({
                    uuid: newClientId,
                    cmd: 'check_id',
                }));
        
                // 응답을 기다리기 위한 대기
                while (!validClientId) {
                    await new Promise(resolve => setTimeout(resolve, 500));  // 응답 대기
                }
        
                // 유효한 ID를 받으면 더 이상 메시지 핸들러가 필요 없으므로 제거
                client.removeListener('message', messageHandler);
        
            } catch (error) {
                console.error('Error initializing client ID:', error);
            }
        };
        


        try {
            const client = mqtt.connect('wss://1c15066522914e618d37acbb80809524.s1.eu.hivemq.cloud:8884/mqtt', {
                username: 'tester',
                password: 'Test1234',
            });

            client.on('connect', () => {
                console.log('MQTT Connected');

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

            initializeClientId(client);   // init Client ID

            client.on('message', (topic, message) => {
                console.log(`Received message from topic ${topic}: ${message.toString()}`);
                setMqttMessage(message.toString());

                if (topic === 'Notify') {
                    try {
                        const parsedData = JSON.parse(message.toString());
                        const {idx, status, battery, cmd} = parsedData;
                        let nowStatus = "";
                        let statusDot = "";

                        if(cmd === "new_device"){
                            if(status === "GOOD"){
                                nowStatus = "정상";
                                statusDot = "green";
                            }
                            else if(status === "BAD"){
                                nowStatus = "고장";
                                statusDot = "red";
                            }
                            else if(status === "OFF"){
                                nowStatus = "꺼짐";
                                statusDot = "gray";
                            }

                            setSelectedItem({
                                id: idx, 
                                name: `${idx}번 말뚝`, 
                                status: nowStatus, 
                                statusDot,
                                battery,
                            });
                            setModalVisible(true); // 팝업 표시
                        }
                        else if(cmd === "status_update"){
                            if(status === "GOOD"){
                                console.log("good");
                                nowStatus = "정상";
                                statusDot = "green";
                            }
                            else if(status === "BAD"){
                                console.log("bad");
                                nowStatus = "고장";
                                statusDot = "red";
                            }
                            else if(status === "OFF"){
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
    }, []);


    return (
        <View style={styles.container}>
            {modalVisible && (
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>새로운 말뚝을 찾았어요!</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                if (selectedItem) {
                                    setItems((prevItems) => [
                                        ...prevItems,
                                        {
                                            id: selectedItem.id,
                                            name: selectedItem.name,
                                            status: selectedItem.status,
                                            statusDot: selectedItem.statusDot,
                                            battery: selectedItem.battery,
                                        },
                                    ]);
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
            <ScrollView contentContainerStyle={styles.scrollView}>
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
            </ScrollView>
            <View style={styles.mqttContainer}>
                <Text style={styles.mqttText}>{mqttMessage}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => {
                console.log("click!");
                navigation.navigate('P2', { items });
            }}>
                <Text style={styles.buttonText}>분석 보기</Text>
            </TouchableOpacity>
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
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default P1;

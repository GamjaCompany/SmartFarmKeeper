import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import Scarecrow from '../components/Scarecrow';
import mqtt from 'mqtt';

interface Item {
    id: number;
    name: string;
    status: string;
    statusDot: string;
    battery : string;
}

interface StackParamList extends ParamListBase {
    P1: undefined;
    P2: undefined;
};

type P1ScreenNavigationProp = StackNavigationProp<StackParamList, 'P1'>;

const P1: React.FC = () => {
    const [items, setItems] = useState<Item[]>([
    //     { id: 1, name: '1번 말뚝', status: '정상' },
    //     { id: 2, name: '2번 말뚝', status: '고장' },
    //     { id: 3, name: '3번 말뚝', status: '고장' },
    //     { id: 4, name: '4번 말뚝', status: '꺼짐' },
    ]);

    const [mqttMessage, setMqttMessage] = useState<string>('MQTT message');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const navigation = useNavigation<P1ScreenNavigationProp>();

    useEffect(() => {
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
    
            client.on('message', (topic, message) => {
                console.log(`Received message from topic ${topic}: ${message.toString()}`);
                setMqttMessage(message.toString());

                if (topic === 'Notify') {
                    try {
                        const parsedData = JSON.parse(message.toString());
                        const {idx, status, battery} = parsedData;
                        let nowStatus = "";
                        let statusDot = "";

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

                        // setItems((prevItems) => [
                        //     ...prevItems,
                        //     {id:idx, name: `${idx}번 말뚝`, status : nowStatus, statusDot},
                        // ])
                        // 팝업을 띄우기 위해 데이터 설정
                        setSelectedItem({
                            id: idx, 
                            name: `${idx}번 말뚝`, 
                            status: nowStatus, 
                            statusDot,
                            battery,
                        });
                        setModalVisible(true); // 팝업 표시
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

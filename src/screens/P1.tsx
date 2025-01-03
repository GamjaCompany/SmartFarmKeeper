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
}

interface StackParamList extends ParamListBase {
    P1: undefined;
    P2: undefined;
};

type P1ScreenNavigationProp = StackNavigationProp<StackParamList, 'P1'>;

const P1: React.FC = () => {
    const [items, setItems] = useState<Item[]>([
        { id: 1, name: '1번 말뚝', status: '정상' },
        { id: 2, name: '2번 말뚝', status: '고장' },
        { id: 3, name: '3번 말뚝', status: '고장' },
        { id: 4, name: '4번 말뚝', status: '꺼짐' },
    ]);

    const [mqttMessage, setMqttMessage] = useState<string>('MQTT message');

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
                client.subscribe('DEBUG', (err) => {
                    if (err) {
                        console.error('Subscription error:', err);
                    }
                });
            });
    
            client.on('message', (topic, message) => {
                console.log(`Received message from topic ${topic}: ${message.toString()}`);
                setMqttMessage(message.toString());
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
            <ScrollView contentContainerStyle={styles.scrollView}>
                {items.map((item) => (
                    <Scarecrow key={item.id} id={item.id} name={item.name} status={item.status}/>
                ))}
                <View style={styles.mqttContainer}>
                    <Text style={styles.mqttText}>{mqttMessage}</Text>
                </View>
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={() => {
                    console.log("click!");
                    navigation.navigate('P2');
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
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 20,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    messageBox: {
        flex: 1,
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginLeft: 10,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#000',
    },
    receivedMessageContainer: {
        marginTop: 20,
    },
    receivedMessageLabel: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    receivedMessage: {
        fontSize: 16,
        color: '#fff',
    },
});

export default P1;

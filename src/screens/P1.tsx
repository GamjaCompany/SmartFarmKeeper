import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import mqtt from 'mqtt';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();

interface Item {
    id: number;
    name: string;
    status: string;
    color: string;
}

const P1: React.FC = () => {
    const [items, setItems] = useState<Item[]>([
        { id: 1, name: '1번 말뚝', status: '정상', color: 'lime' },
        { id: 2, name: '2번 말뚝', status: '고장', color: 'yellow' },
        { id: 3, name: '3번 말뚝', status: '정상', color: 'lime' },
        { id: 4, name: '4번 말뚝', status: '꺼짐', color: 'red' },
        { id: 5, name: '5번 말뚝', status: '정상', color: 'lime' },
        { id: 6, name: '6번 말뚝', status: '고장', color: 'yellow' },
    ]);

    const [host, setHost] = useState<string>('1c15066522914e618d37acbb80809524.s1.eu.hivemq.cloud'); // 기본 MQTT 브로커
    const [id, setId] = useState<string>('tester');
    const [passwd, setPasswd] = useState<string>('Test1234');
    const [message, setMessage] = useState<string>('');
    const [receivedMessage, setReceivedMessage] = useState<string>(''); // 수신된 메시지 저장

    const clientRef = useRef<mqtt.MqttClient | null>(null);

    useEffect(() => {
        clientRef.current = mqtt.connect(`wss://${host}:8084/mqtt`, {
            username: id,
            password: passwd,
        });

        clientRef.current.on('connect', () => {
            console.log('MQTT connected');
            clientRef.current?.subscribe('test/topic', (err) => {
                if (!err) {
                    console.log('Subscribed to test/topic');
                }
            });
        });

        clientRef.current.on('message', (topic, message) => {
            setReceivedMessage(message.toString());
            console.log(`Message received on ${topic}: ${message}`);
        });

        clientRef.current.on('error', (err) => {
            console.error('MQTT Error:', err);
        });

        return () => {
            clientRef.current?.end();
        };
    }, [host, id, passwd]);

    const sendMessage = () => {
        if (clientRef.current) {
            const fullMessage = `Host: ${host}, ID: ${id}, Message: ${message}`;
            clientRef.current.publish('test/topic', fullMessage);
            console.log('Message sent:', fullMessage);
            setMessage('');
        } else {
            console.error('MQTT client not connected');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {items.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <View style={styles.statusContainer}>
                            <Text style={styles.statusText}>{item.status}</Text>
                            <View
                                style={[
                                    styles.statusDot,
                                    { backgroundColor: item.color },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* 입력 필드 */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Host"
                    value={host}
                    onChangeText={(text) => setHost(text)}
                />
                <TextInput
                    style={styles.textInput}
                    placeholder="ID"
                    value={id}
                    onChangeText={(text) => setId(text)}
                />
                <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    secureTextEntry
                    value={passwd}
                    onChangeText={(text) => setPasswd(text)}
                />
            </View>

            {/* 메시지 전송 및 수신 */}
            <View style={styles.messageContainer}>
                <TouchableOpacity style={styles.button} onPress={sendMessage}>
                    <Text style={styles.buttonText}>분석 보기</Text>
                </TouchableOpacity>
                <TextInput
                    style={styles.messageBox}
                    value={message}
                    onChangeText={(text) => setMessage(text)}
                    placeholder="보낼 메시지 입력"
                />
            </View>

            {/* 수신된 메시지 표시 */}
            <View style={styles.receivedMessageContainer}>
                <Text style={styles.receivedMessageLabel}>수신된 메시지:</Text>
                <Text style={styles.receivedMessage}>{receivedMessage}</Text>
            </View>
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
    inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    textInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#fff',
        marginHorizontal: 5,
        borderRadius: 10,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#000',
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';

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

    const [editId, setEditId] = useState<number | null>(null);
    const [newName, setNewName] = useState<string>('');

    const handleEdit = (id: number, currentName: string) => {
        setEditId(id);
        setNewName(currentName);
    };

    const handleSave = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, name: newName } : item
            )
        );
        setEditId(null);
        setNewName('');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {items.map((item) => (
                    <View key={item.id} style={styles.card}>
                        {editId === item.id ? (
                            <TextInput
                                style={styles.input}
                                value={newName}
                                onChangeText={(text) => setNewName(text)}
                                onEndEditing={() => handleSave(item.id)} // 입력 종료 시 자동 저장
                                placeholder="새 이름 입력"
                            />
                        ) : (
                            <TouchableOpacity onPress={() => handleEdit(item.id, item.name)}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
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
            <TouchableOpacity style={styles.button}>
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
    input: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 10,
        flex: 1,
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
});

export default P1;

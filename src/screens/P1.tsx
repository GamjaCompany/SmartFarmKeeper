import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Item {
    id: number;
    name: string;
    status: string;
    color: string;
}

const P1: React.FC = () => {
    const items: Item[] = [
        { id: 1, name: '1번 말뚝', status: '정상', color: 'green' },
        { id: 2, name: '2번 말뚝', status: '고장', color: 'yellow' },
        { id: 3, name: '3번 말뚝', status: '정상', color: 'green' },
        { id: 4, name: '4번 말뚝', status: '꺼짐', color: 'red' },
    ];

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
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>분석 보기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3d3d3d', // 배경색 (이미지 참고)
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
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#00f',
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 16,
        marginRight: 10,
        color: '#000',
    },
    statusDot: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
    },
    button: {
        alignSelf: 'center',
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default P1;


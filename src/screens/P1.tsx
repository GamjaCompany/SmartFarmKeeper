import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';
import Scarecrow from '../components/Scarecrow';

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

    const navigation = useNavigation<P1ScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {items.map((item) => (
                    <Scarecrow key={item.id} id={item.id} name={item.name} status={item.status}/>
                ))}
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

import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ScarecrowProps {
    id: number;
    name: string;
    status: string;
}

const Scarecrow: React.FC<ScarecrowProps> = ({ id, name, status }) => {
    const getStatusColor = (status: string): string => {
        switch (status) {
            case "정상":
                return "lime";
            case "고장":
                return "yellow";
            case "꺼짐":
                return "red";
            default:
                return "gray"; // default
        }
    };

    const color = getStatusColor(status);
    
    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{name}</Text>
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>{status}</Text>
                <View
                    style={[
                        styles.statusDot,
                        { backgroundColor: color },
                    ]}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        height: 150,
        marginBottom: 10,
        borderWidth: 4,
        borderColor: '#37B34A',
        borderRadius: 45,
        backgroundColor: '#fff',
    },
    cardTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#37B34A',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#37B34A',
    },
    statusDot: {
        width: 20,
        height: 20,
        marginRight: 10,
        borderRadius: 15,
    },
});

export default Scarecrow;
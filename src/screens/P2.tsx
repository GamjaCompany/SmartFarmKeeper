import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ScarecrowInfoModal from '../components/ScarecrowInfoModal';
import DetectionLogModal from '../components/DetectionLogModal';

interface Item {
    id: number;
    name: string;
    status: string;
}

const P2: React.FC = () => {
    const [items, setItems] = useState<Item[]>([
        { id: 1, name: '1번 말뚝', status: '정상' },
        { id: 2, name: '2번 말뚝', status: '고장' },
        { id: 3, name: '3번 말뚝', status: '고장' },
        { id: 4, name: '4번 말뚝', status: '꺼짐' },
    ]);

    const [currentItemIndex, setCurrentItemIndex] = useState<number>(1);
    const [currentModal, setCurrentModal] = useState<"ScarecrowInfo" | "DetectionLog">("ScarecrowInfo");

    const currentItem = items[currentItemIndex]; // 현재 선택된 말뚝 아이템

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

    useEffect(() => {
        requestLocationPermission();
    }, []);

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

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 37.5665,
                    longitude: 126.9780,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {items.map((item) => (
                    <Marker
                        key={item.id}
                        coordinate={{ latitude: 37.5665 + item.id * 0.001, longitude: 126.9780 + item.id * 0.001 }}
                        title={item.name}
                    />
                ))}
            </MapView>

            {currentModal === "ScarecrowInfo" ? (
                <ScarecrowInfoModal
                    id={currentItem.id}
                    name={currentItem.name}
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
                    ]}
                    onBack={handleBackToScarecrowInfo}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
});

export default P2;

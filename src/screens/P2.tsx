import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute, RouteProp } from '@react-navigation/native';
import ScarecrowInfoModal from '../components/ScarecrowInfoModal';

interface Item {
    id: number;
    name: string;
    status: string;
    battery: string;
}

type RouteParams = {
    params: {
        items?: Item[];
    };
};

const P2: React.FC = () => {
    // const [items, setItems] = useState<Item[]>([
    //     { id: 1, name: '1번 말뚝', status: '정상' },
    //     { id: 2, name: '2번 말뚝', status: '고장' },
    //     { id: 3, name: '3번 말뚝', status: '고장' },
    //     { id: 4, name: '4번 말뚝', status: '꺼짐' },
    // ]);
    const route = useRoute<RouteProp<RouteParams, 'params'>>();
    const { items = [] }: { items?: Item[] } = route.params || {};

    const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);

    // 위치 권한 요청 함수
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
                return prevIndex === 0 ? items.length - 1 : prevIndex - 1; // 첫 번째 항목에서 왼쪽 클릭 시 마지막 항목으로
            } else {
                return prevIndex === items.length - 1 ? 0 : prevIndex + 1; // 마지막 항목에서 오른쪽 클릭 시 첫 번째 항목으로
            }
        });
    };

    const currentItem = items[currentItemIndex]; // 현재 선택된 말뚝 아이템

    return (
        <View style={styles.container}>
            {/* 지도 영역 */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 37.5665, // 초기 위도
                    longitude: 126.9780, // 초기 경도
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                onMapReady={() => console.log('Map is ready')}
            >
                {/* 말뚝 마커 */}
                {items.map((item) => (
                    <Marker
                        key={item.id}
                        coordinate={{ latitude: 37.5665 + item.id * 0.001, longitude: 126.9780 + item.id * 0.001 }}
                        title={item.name}
                    />
                ))}
            </MapView>

            {/* 하단 카드 영역 */}
            <ScarecrowInfoModal
                id={currentItem.id}
                name={currentItem.name}
                battery={currentItem.battery}
                onArrowClick={handleArrowClick}
            />
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

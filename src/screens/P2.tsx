import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ScarecrowInfoModal from '../components/ScarecrowInfoModal';
import DetectionLogModal from '../components/DetectionLogModal';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';

interface Item {
    id: number;
    name: string;
    status: string;
    statusDot: string;
    battery: string;
    lat: number;
    lng: number;
}

type RouteParams = {
    params: {
        items?: Item[];
    };
};

const P2: React.FC = () => {
    const route = useRoute<RouteProp<RouteParams, 'params'>>();
    const [items, setItems] = useState<Item[]>(route.params?.items || []);
    const [currentModal, setCurrentModal] = useState<"ScarecrowInfo" | "DetectionLog">("ScarecrowInfo");
    const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
    const [mapKey, setMapKey] = useState(0);    // temp key for map rerendering
    const [mapRegion, setMapRegion] = useState({
        latitude: 37.8695,
        longitude: 127.7430,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

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

    useFocusEffect(
        React.useCallback(() => {
            console.log('Navigated back. Route params:', route.params?.items);
    
            if (Array.isArray(route.params?.items)) {
                setItems([...route.params.items]); // 새로운 배열로 설정
                updateMapRegion(route.params.items); // 지도 중심 업데이트
            } else {
                setItems([]); // 빈 배열로 초기화
            }
    
            setCurrentItemIndex(0); // 초기화
            setMapKey((prevKey) => prevKey + 1); // 지도 강제 재랜더링
        }, [route.params?.items])
    );

    const handleDetailInfoClick = () => {
        setCurrentModal("DetectionLog");
    };

    const handleBackToScarecrowInfo = () => {
        setCurrentModal("ScarecrowInfo");
    };

    const currentItem = items.length > 0 ? items[currentItemIndex] : null;

    const updateMapRegion = (items: Item[]) => {
        if (items.length === 0) return;

        // 모든 마커의 중심을 계산
        const latitudes = items.map((item) => item.lat);
        const longitudes = items.map((item) => item.lng);
        const avgLatitude =
            latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
        const avgLongitude =
            longitudes.reduce((sum, lng) => sum + lng, 0) / longitudes.length;

        setMapRegion({
            latitude: avgLatitude,
            longitude: avgLongitude,
            latitudeDelta: 0.005, // 적당한 확대 수준 설정
            longitudeDelta: 0.005,
        });
    };

    const handleMarkerPress = (itemId: number) => {
        const index = items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
            setCurrentItemIndex(index); // 선택된 말뚝의 정보를 설정
            setCurrentModal("ScarecrowInfo"); // ScarecrowInfoModal을 열도록 설정
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                key={mapKey}
                style={styles.map}
                mapType="satellite"
                region={mapRegion}
                onMapReady={() => console.log('Map is ready')}
            >

                {/* <Marker
                    key={9}
                    coordinate={{
                        latitude: 37.8697,
                        longitude: 127.7435,
                    }}
                    title="test"
                /> */}

                {items.map((item) => {
                    console.log('Rendering Marker with coordinates:', item.lat, item.lng);
                    if (typeof item.lat !== 'number' || typeof item.lng !== 'number') {
                        console.error(`Invalid coordinates for item with id ${item.id}`);
                        return null; // Marker를 렌더링하지 않음
                    }
                    return (
                        <Marker
                            key={item.id} // 동적인 키 생성
                            coordinate={{
                                latitude: item.lat,
                                longitude: item.lng,
                            }}
                            title={`${item.id}번 말뚝`}
                            onPress={() => handleMarkerPress(item.id)}
                        />
                    );
                })}

            </MapView>

            {currentItem && currentModal === "ScarecrowInfo" ? (
                <ScarecrowInfoModal
                    id={currentItem.id}
                    name={currentItem.name}
                    battery={currentItem.battery}
                    // onArrowClick={handleArrowClick}
                    onDetailInfoClick={handleDetailInfoClick}
                />
            ) : (
                currentItem && (
                    <DetectionLogModal
                        id={currentItem.id}
                        name={currentItem.name}
                        logs={[
                            { time: "2025-01-01 12:00", target: "사람", image: "https://example.com/image1.jpg" },
                            { time: "2025-01-02 13:34", target: "고라니", image: "https://example.com/image2.jpg" },
                        ]}
                        onBack={handleBackToScarecrowInfo}
                    />
                )
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

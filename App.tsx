import React from 'react';
import { Text, SafeAreaView, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import P1 from './src/screens/P1';
import P2 from './src/screens/P2';
import { GOOGLE_MAPS_API_KEY } from '@env';

const Stack = createStackNavigator();
// Bottom Tab Navigator 생성
const Tab = createBottomTabNavigator();

const App: React.FC = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <Tab.Navigator
                    initialRouteName="P2"
                    screenOptions={{
                        headerShown: false, // 상단 헤더 숨김
                        tabBarStyle: { backgroundColor: '#f8f9fa', height: 60 }, // 하단 바 스타일
                        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' }, // 라벨 스타일
                        tabBarActiveTintColor: '#007bff', // 활성화된 탭 색상
                        tabBarInactiveTintColor: '#6c757d', // 비활성화된 탭 색상
                    }}
                >
                    <Tab.Screen
                        name="P2"
                        component={P2}
                        options={{
                            tabBarLabel: '지도',
                            tabBarIcon: ({ color }) => (
                                <Text style={{ fontSize: 24, color }}>📍</Text> // 아이콘
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="P1"
                        component={P1}
                        options={{
                            tabBarLabel: '말뚝 리스트',
                            tabBarIcon: ({ color }) => (
                                <Text style={{ fontSize: 24, color }}>📋</Text> // 아이콘
                            ),
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
            <Toast />
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3d3d3d', // 앱 전체 배경
    },
});

export default App;

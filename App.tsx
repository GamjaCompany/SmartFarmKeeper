import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StyleSheet } from 'react-native';
import P1 from './src/screens/P1';
import P2 from './src/screens/P2';
import { GOOGLE_MAPS_API_KEY } from '@env';

const Stack = createStackNavigator();

const App: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="P1">
                <Stack.Screen name="P1" component={P1} options={{ title: '첫 번째 페이지' }} />
                <Stack.Screen name="P2" component={P2} options={{ title: '두 번째 페이지' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3d3d3d', // 앱 전체 배경
    },
});

export default App;

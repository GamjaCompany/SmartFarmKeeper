import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import P1 from './src/screens/P1';
import P2 from './src/screens/P2';
import { GOOGLE_MAPS_API_KEY } from '@env';

const App: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <P2 />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3d3d3d', // 앱 전체 배경
    },
});

export default App;

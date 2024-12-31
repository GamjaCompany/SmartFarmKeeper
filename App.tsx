import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import P1 from './src/screens/P1'; // P1 컴포넌트 경로를 적절히 설정하세요.

const App: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <P1 />
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

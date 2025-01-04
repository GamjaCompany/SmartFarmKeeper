const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
    resolver: {
        // Node.js 모듈을 React Native 환경에서 사용할 수 있도록 폴리필 추가
        extraNodeModules: {
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer'),
            url: require.resolve('react-native-url-polyfill'),
        },
    },
    transformer: {
        // ES6+ 호환성을 위한 기본 Babel 설정
        babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);



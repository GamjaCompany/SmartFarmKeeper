// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('metro-config').MetroConfig}
//  */
// const config = {};

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);

const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
    const {
        resolver: { assetExts, sourceExts },
    } = await getDefaultConfig();

    return {
        transformer: {
            babelTransformerPath: require.resolve('react-native-svg-transformer'), // SVG 처리용, 필요시 유지
        },
        resolver: {
            assetExts: [...assetExts, 'png', 'jpg', 'jpeg', 'gif'], // 이미지 확장자 추가
            sourceExts: sourceExts.filter(ext => ext !== 'svg'), // 필요시 SVG 제외
        },
    };
})();
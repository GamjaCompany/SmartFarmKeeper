import { PermissionsAndroid } from 'react-native';

const requestPermissions = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: '위치 권한 요청',
                message: '이 앱은 현재 위치를 사용해야 합니다.',
                buttonNeutral: '나중에',
                buttonNegative: '취소',
                buttonPositive: '확인',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('위치 권한이 허용되었습니다.');
        } else {
            console.log('위치 권한이 거부되었습니다.');
        }
    } catch (err) {
        console.warn(err);
    }
};

requestPermissions();

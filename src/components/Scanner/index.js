import { useEffect} from 'react';
import { Platform, Text, View, Dimensions } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner
} from 'react-native-vision-camera';


export default function Scanner({ setScannerResult }) {
    const device = useCameraDevice('back');
    const { hasPermission } = useCameraPermission();
    const { width, height } = Dimensions.get("window")


    const requestCameraPermission = async () => {
        const isIos = Platform.OS === 'ios';
        const permission = isIos
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA;
        await request(permission);
    };


    const codeScanner = useCodeScanner({
        codeTypes: ['ean-13', 'upc-a', 'qr'],
        onCodeScanned: (codes) => {
            setScannerResult(codes[0]?.value)
        }
    })

    useEffect(() => {
        if (!hasPermission) requestCameraPermission();
    }, []);

    if (!hasPermission) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Câmera não permitida</Text>
            </View>
        );
    }


    return (
        <View style={{ flex: 1, position: 'absolute', zIndex: 9, height:height, backgroundColor:'#fff' }}>

            <Camera
                style={{ width: width, height: 140, alignSelf: 'center' }}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
            />

            <View style={{ height: 140, alignItems: 'center', justifyContent: 'center', marginTop: -140 }}>
                <View style={{ width: '80%', height: 2, backgroundColor: 'red', alignSelf: "center" }} />
            </View>

            <Text style={{
                textAlign:'center',
                color:'#000',
                fontSize:15,
                marginTop:20
            }}>Aponte a camera para o código de barras</Text>

        </View>

    );
}

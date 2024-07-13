import React, { useEffect, useState, useCallback } from 'react';
import { Platform, Text, View, Dimensions, FlatList, StyleSheet, Pressable } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { useNavigation, useTheme, useRoute } from '@react-navigation/native';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner
} from 'react-native-vision-camera';

import api from '../../services/api';

export default function Scanner({ setScannerResult }) {
    const device = useCameraDevice('back');
    const { hasPermission } = useCameraPermission();
    const navigation = useNavigation()
    const route = useRoute()
    const [pedidoId, setPedidoId] = useState(null)

    useEffect(() => {
        setPedidoId(route.params);
        console.log(route.params, "route.params da inicializacao - scanner");
    }, [route])

    const { width, height } = Dimensions.get("window")


    const requestCameraPermission = async () => {
        const isIos = Platform.OS === 'ios';
        const permission = isIos
            ? PERMISSIONS.IOS.CAMERA
            : PERMISSIONS.ANDROID.CAMERA;
        await request(permission);
    }


    const codeScanner = useCodeScanner({
        codeTypes: ['ean-13'],
        onCodeScanned: (codes) => {
            VerifyCode(codes)

        }
    })

    const onError = useCallback((error) => {
        console.error(error);
        // Handle the error here
      }, []);

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

    async function VerifyCode(code) {
        console.log(code, "codigo escanneado - scanner");
        try {
            const product = await api.get(`/produto/codigo?codigo=${code[0].value}`)
            !!pedidoId ? 
            navigation.navigate('Budget', { product: product.data, pedidoId: pedidoId }) :
            navigation.navigate('RegisterStock', {codigo: code[0].value})

        } catch (error) {
            console.log(error.response);
        }
    }


    return (
        <View style={{ flex: 1, position: 'absolute', zIndex: 9, height: height, backgroundColor: '#fff' }}>

            <Camera
            onError={onError}
                style={{ width: width, height: 140, alignSelf: 'center' }}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
            />

            <View style={{ height: 140, alignItems: 'center', justifyContent: 'center', marginTop: -140 }}>
                <View style={{ width: '80%', height: 2, backgroundColor: 'red', alignSelf: "center" }} />
            </View>

            <Text style={{
                textAlign: 'center',
                color: '#000',
                fontSize: 15,
                marginTop: 20
            }}>Aponte a camera para o código de barras</Text>

        </View>

    );
}

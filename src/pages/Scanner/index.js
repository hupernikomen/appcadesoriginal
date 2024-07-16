import React, { useEffect, useState, useCallback, useContext } from 'react';
import { Platform, Text, View, Dimensions, FlatList, StyleSheet, Pressable } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { useNavigation, useTheme, useRoute } from '@react-navigation/native';
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useCodeScanner
} from 'react-native-vision-camera';

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';

import api from '../../services/api';

export default function Scanner() {
    const device = useCameraDevice('back');
    const { Toast } = useContext(AppContext)
    const {AddItemOrder} = useContext(CrudContext)
    const { hasPermission } = useCameraPermission();
    const navigation = useNavigation()
    const route = useRoute()
    const [salesformID, setSalesformID] = useState(null)
    const [hasScanned, setHasScanned] = useState(false);


    useEffect(() => {
        setSalesformID(route.params);
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
            if (!hasScanned) {
                console.log(codes);
                VerifyCode(codes);
                setHasScanned(true);
            }
        },
        enabled: !hasScanned, // disable the scanner once it's scanned
    });


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

    

        if (code[0].value.substr(0, 3) !== '789') return

        try {
            const product = await api.get(`/getproduct/code?code=${code[0].value}`)
            if (!product.data) {
                Toast("Item não cadastrado")
            }

            if(!!salesformID) {
                AddItemOrder({ product: product.data, salesformID: salesformID })
                navigation.navigate('Budget', {salesformID: route.params})
            }else {

                navigation.navigate('RegisterStock', { code: code[0].value })
                setHasScanned(false);
            }

        } catch (error) {
            console.log(error.response);
        } 
    }


    return (
        <View style={{ flex: 1, position: 'absolute', zIndex: 9, height: height, backgroundColor: '#fff' }}>

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
                textAlign: 'center',
                color: '#000',
                fontSize: 15,
                marginTop: 20
            }}>Aponte a camera para o código de barras</Text>

        </View>

    );
}

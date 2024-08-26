import { View, Text, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';

import { AppContext } from '../../contexts/appContext';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Texto from '../../components/Texto';
import Topo from '../../components/Topo';

export default function BarrasPonto() {

    const navigation = useNavigation()
    const { credencial } = useContext(AppContext)
    const [codigoDeBarras, setCodigoDeBarras] = useState('')

    const data = new Date();

    const convertData = () => {
        const hour = String(data.getHours()).padStart(2, '0');
        const minute = String(data.getMinutes()).padStart(2, '0');
        const day = String(data.getDate()).padStart(2, '0');
        const month = String(data.getMonth() + 1).padStart(2, '0');
        const year = String(data.getFullYear() % 100).padStart(2, '0'); // ano com 2 dígitos
        return (`${day}${month}${year}${hour}${minute}`);
    };

    const registro = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${String(data.getFullYear() % 100).padStart(2, '0')} ${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`


    useEffect(() => {

        MontaCodigo()

    }, [])

    function MontaCodigo() {
        const ean12 = `${credencial?.matricula}${convertData()}`
        const chave = codigoDeVerificacaoEAN13(ean12)

        isNaN(chave) ? setCodigoDeBarras("") : setCodigoDeBarras(ean12 + chave)

    }



    function codigoDeVerificacaoEAN13(ean12) {
        const weights = [1, 3];
        let sum = 0;
        let weightIndex = 0;

        for (let i = 0; i < 12; i++) {
            const digit = parseInt(ean12.charAt(i));
            sum += digit * weights[weightIndex];
            weightIndex = (weightIndex + 1) % 2;
        }

        const remainder = sum % 10;
        const checksum = remainder === 0 ? 0 : 10 - remainder;

        return checksum;
    }


    return (
        <>
            <Topo
                posicao='center'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                titulo='Crachá Digital' />
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

                <Texto texto={`${credencial?.nome}`} tipo='Bold' tamanho={22} />
                <Texto texto={`Matrícula: ${credencial?.matricula}`} tipo='Light' />
                <Texto texto={`${registro}`} tipo='Light' />

                <Texto tipo='Light' texto={'Aponte o leitor para o código de barras'} estilo={{ marginVertical: 30 }} />
                <View style={{ alignItems: "center", justifyContent: "center", height: 120 }}>
                    <Text style={{ fontFamily: 'Barcode', fontSize: 250, color: '#222' }}>{codigoDeBarras}</Text>
                </View>
            </View>
        </>
    );
}
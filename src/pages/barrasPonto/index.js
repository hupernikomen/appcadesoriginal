import { View, Text, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';

import { AppContext } from '../../contexts/appContext';
import { CredencialContext } from '../../contexts/credencialContext';

import Texto from '../../components/Texto';
import Topo from '../../components/Topo';

export default function BarrasPonto() {

    const {width} = Dimensions.get('window')

    const navigation = useNavigation()
    const { credencial } = useContext(CredencialContext)
    const { CodigoDeVerificacaoEAN13 } = useContext(AppContext)
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
        const chave = CodigoDeVerificacaoEAN13(ean12)

        isNaN(chave) ? setCodigoDeBarras("") : setCodigoDeBarras(ean12 + chave)

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
                    <Text style={{ fontFamily: 'Barcode', fontSize: width * 0.5, color: '#222' }}>{codigoDeBarras}</Text>
                </View>
            </View>
        </>
    );
}
import { View, Text, Pressable, ActivityIndicator, Keyboard } from 'react-native';

import { useRoute, useTheme, useNavigation } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import Input from '../../components/Input';

import { AppContext, AppProvider } from '../../contexts/appContext';

import api from '../../services/api';

import { createNumberMask } from 'react-native-mask-input';
import MaskOfInput from '../../components/MaskOfInput';

export default function FinalizaVenda() {

    const { credencial, Toast } = useContext(AppContext)

    const CurrencyMask = createNumberMask({
        delimiter: '.',
        separator: ',',
        precision: 2,
    });

    const {colors} = useTheme()

    const navigation = useNavigation()
    const {params: rota} = useRoute()

    const [load, setLoad] = useState(false)

    const [alerta, setAlerta] = useState('')

    const [tempoDePagamento, setTempoDePagamento] = useState('')
    const [valorAdiantado, setValorAdiantado] = useState('')
    const [observacao, setObservacao] = useState('')
    const [total, setTotal] = useState('')

    const maxTimes = 6

    useEffect(() => {

        if (tempoDePagamento >= 6) {
            setTempoDePagamento(String(maxTimes));
            Toast(`Máximo de ${maxTimes} prestações`)
        }

    }, [tempoDePagamento])

    useEffect(() => {

        setTotal(rota?.total - valorAdiantado.replace(',', '.'))
    }, [valorAdiantado])


    async function EnviaVenda() {

        console.log(typeof valorAdiantado , typeof rota?.total);
        

        Keyboard.dismiss()

        if (Number(valorAdiantado) > Number(rota?.total)) {
            Toast('Valor superior à compra')
            return
        }

        setLoad(true)

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credencial?.token}`
        }

        try {
            await api.put(`/atualiza/estoque?ordemDeCompraID=${rota?.ordemDeCompraID}`, { headers })
            await api.put(`/atualiza/ordemDeCompra?ordemDeCompraID=${rota?.ordemDeCompraID}`, {
                estado: 'Criado',
                valorPago: Number(rota?.total),
                tempoDePagamento: tempoDePagamento,
                valorAdiantado: Number(valorAdiantado.replace(',', '.')),
                observacao: observacao
            }, { headers })


            Toast('Pedido Enviado')
            navigation.navigate('Home')

        } catch (error) {
            console.log(error.response);
        } finally {setLoad(false)}
    }



    return (
        <View style={{ padding: 10, gap: 6 }}>

            <View style={{ padding: 16 }}>
                <Text style={{ fontFamily: 'Roboto-Light', color: "#222" }}>Compra no valor de R$ {rota?.total.replace('.', ',')} poderá ser pago no cartão de crédito em até {maxTimes}x ou à vista.</Text>
            </View>

            <MaskOfInput type='numeric' title={'À vista / Entrada (R$)'} value={valorAdiantado} setValue={setValorAdiantado} mask={CurrencyMask} />

            <View>

                <Input type='numeric' maxlength={maxTimes.length} value={tempoDePagamento} setValue={setTempoDePagamento} title={'Nº de prestações'} info={tempoDePagamento ? tempoDePagamento + "x R$ " + (parseFloat(total / tempoDePagamento)).toFixed(2).replace('.', ',') : null} />
                <Text>{alerta}</Text>
            </View>

            <View>
                <Input lines={5} styleContainer={{height: 100}} styleInput={{height: 60}} title={'Observações'} value={observacao} setValue={setObservacao} />
            </View>



            <Pressable
                style={{ backgroundColor: colors.theme,height: 55,
                    borderRadius: 6,
                    marginVertical: 12,
                    padding: 14,
                    justifyContent: "center",
                    alignItems: "center" }}
                onPress={() => EnviaVenda()}
            >
                {load ? <ActivityIndicator color={'#fff'} /> :
                    <Text style={{ color: '#fff', fontSize: 16 }}>Enviar Pedido</Text>
                }

            </Pressable>
        </View>
    );
}
import { View, Text, Pressable, ActivityIndicator, Keyboard } from 'react-native';

import { useRoute, useTheme, useNavigation } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../contexts/appContext';

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

    const { colors } = useTheme()

    const navigation = useNavigation()
    const { params: rota } = useRoute()

    const [load, setLoad] = useState(false)

    const [alerta, setAlerta] = useState('')

    const [tempoDePagamento, setTempoDePagamento] = useState('')
    const [valorAdiantado, setValorAdiantado] = useState('')
    const [observacao, setObservacao] = useState('')
    const [desconto, setDesconto] = useState('')
    const [total, setTotal] = useState('')

    const [orcamento, setOrcamento] = useState([])

    const maxTimes = 6

    useEffect(() => {
        BuscaOrdemDecompra()
    }, [])

    useEffect(() => {

        if (tempoDePagamento >= 6) {
            setTempoDePagamento(String(maxTimes));
            Toast(`Máximo de ${maxTimes} prestações`)
        }

    }, [tempoDePagamento])

    useEffect(() => {

        setTotal(orcamento?.totalDaNota - valorAdiantado.replace(',', '.'))
    }, [valorAdiantado])


    async function BuscaOrdemDecompra() {

        try {
            const res = await api.get(`/busca/ordemDeCompra?ordemDeCompraID=${rota?.ordemDeCompraID}`)
            setOrcamento(res.data)

            const { estado, id } = res.data

        } catch (error) {
            console.log(error.response);

        }
    }


    async function EnviaVenda() {

        Keyboard.dismiss()

        if (Number(valorAdiantado) > Number(orcamento?.totalDaNota)) {
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
                totalDaNota: Number(orcamento?.totalDaNota),
                valorPago: (Number(orcamento?.totalDaNota) - valorAdiantado) * (1 - desconto / 100),
                desconto: Number(desconto) || null,
                tempoDePagamento: tempoDePagamento || null,
                valorAdiantado: Number(valorAdiantado.replace(',', '.')) || null,
                observacao: observacao
            }, { headers })


            Toast('Pedido Enviado')
            navigation.navigate('Orcamento', { ordemDeCompraID: rota?.ordemDeCompraID })

        } catch (error) {
            console.log(error.response);
        } finally { setLoad(false) }
    }



    return (
        <View style={{ padding: 10, gap: 6 }}>

            <View style={{ padding: 16 }}>
                <Text style={{ fontFamily: 'Roboto-Light', color: "#222" }}>Compra no valor de R$ {parseFloat(orcamento?.totalDaNota).toFixed(2).replace('.', ',')} poderá ser pago no cartão de crédito em até {maxTimes}x ou à vista.</Text>
            </View>

            {!tempoDePagamento && !valorAdiantado && <MaskOfInput type='numeric' title='Desconto (%)' value={desconto} setValue={setDesconto} info={'À pagar R$ ' + ((parseFloat(orcamento?.totalDaNota) - Number(valorAdiantado.replace(',', '.'))) * (1 - desconto / 100)).toFixed(2).replace('.', ',')} maxlength={2} />}
           
            {!desconto && <View>
                <MaskOfInput type='numeric' title={'Adiantamento (R$)'} value={valorAdiantado} setValue={setValorAdiantado} mask={CurrencyMask} />
                <MaskOfInput type='numeric' title='Nº de prestações' value={tempoDePagamento} setValue={setTempoDePagamento} info={tempoDePagamento ? tempoDePagamento + "x R$ " + (parseFloat((parseFloat(orcamento?.totalDaNota) - Number(valorAdiantado.replace(',', '.'))) * (1 - desconto / 100) / tempoDePagamento)).toFixed(2).replace('.', ',') : null} />
                <Text>{alerta}</Text>
            </View>}

            <MaskOfInput lines={5} multiline={true} styleMask={{ height: 60 }} style={{ height: 100 }} title='Observações' value={observacao} setValue={setObservacao} />

            <Pressable
                style={{
                    backgroundColor: colors.theme, height: 55,
                    borderRadius: 6,
                    marginVertical: 12,
                    padding: 14,
                    justifyContent: "center",
                    alignItems: "center"
                }}
                onPress={() => EnviaVenda()}
            >
                {load ? <ActivityIndicator color={'#fff'} /> :
                    <Text style={{ color: '#fff', fontSize: 16 }}>Enviar Pedido</Text>
                }

            </Pressable>
        </View>
    );
}
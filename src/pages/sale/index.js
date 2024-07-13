import { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import { AppContext } from '../../contexts/appContext';
import Feather from 'react-native-vector-icons/Feather'

import MaskInput from 'react-native-mask-input';
import api from '../../services/api';

export default function Sale() {
    const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/]
    const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]

    const { credential, Toast } = useContext(AppContext)
    const navigation = useNavigation()
    const { colors } = useTheme()

    const [data, setData] = useState([])
    const [cpf, setCpf] = useState('')

    useEffect(() => {

        // SE CPF/CNPJ ESTIVER INCOMPLETO MANTER DADOS APAGADOS
        if (cpf.length < 14) {
            setData([])

        }

    }, [cpf])

    useEffect(() => {
        navigation.setOptions({
            title: data.nome ? 'Cliente: ' + data.nome : ''
        })
    }, [data])



    async function buscarCliente(cpf) {

        // AO CLICAR NA LUPA ESSA FUNÇÃO É EXECUTADA
        Keyboard.dismiss()


        try {
            const dadosCliente = await api.get(`/cliente?cpf=${cpf}`)
            const pedidosDoCliente = await api.get(`/pedidos/cliente?clienteId=${dadosCliente.data?.id}`)


            if (!dadosCliente.data && cpf.length >= 14) {
                Toast("Cliente não cadastrado")

            } else if (cpf.length < 14 && cpf !== '00') {
                Toast('CPF/CNPJ incompleto')

            } else if (!!dadosCliente.data) {
                setData(dadosCliente.data);

                pedidosDoCliente.data?.map(pedido => {

                    // SE CLIENTE EXISTE E NÃO HA PEDIDO EM ABERTO 
                    if (!!dadosCliente.data && pedido.status !== 'Criado') {
                        setData(dadosCliente.data);
                    } 
                })
            }


        } catch (error) {
            console.log(error.response.data.error);

        }
    }


    async function criarPedido() {

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credential?.token}`
        }

        try {
            const resposta = await api.post(`/pedido`, { clienteId: data?.id, usuarioId: credential.id }, { headers })
            navigation.navigate('Budget', { pedidoId: resposta.data?.id })

        } catch (error) {
            console.log(error.response);

        }
    }


    return (
        <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 14, marginVertical: 10 }}>


            <View style={{ flexDirection: "row", alignItems: 'center', gap: 6 }}>

                <MaskInput
                    keyboardType='numeric'
                    placeholder='CPF/CNPJ'
                    style={styles.inputs}
                    autoFocus={true}
                    value={cpf}
                    onChangeText={setCpf}
                    placeholderTextColor={'#222'}
                    mask={(text) => {
                        if (text.replace(/\D+/g, "").length <= 14) {
                            return CPF_MASK
                        } else {
                            return CNPJ_MASK
                        }
                    }}
                />

                <Pressable onPress={() => buscarCliente(cpf)} style={{
                    backgroundColor: colors.detail,
                    borderRadius: 50,
                    alignItems: "center",
                    justifyContent: "center",
                    width: 45,
                    aspectRatio: 1
                }}>
                    <Feather name={'search'} size={20} color={'#fff'} />
                </Pressable>

                {!!data.id && (cpf.length >= 14 || cpf === '00') ?
                    <Pressable onPress={() => criarPedido()} style={{
                        backgroundColor: colors.detail,
                        borderRadius: 50,
                        alignItems: "center",
                        justifyContent: "center",
                        width: 45,
                        aspectRatio: 1
                    }}>
                        <Feather name={'plus'} size={20} color={'#fff'} />
                    </Pressable> : null
                }
            </View>

            <Text style={{ fontWeight: '300', color: '#222', textAlign: 'center', marginHorizontal: 20, marginVertical: 30 }}>
                Informe o numero do CPF/CNPJ e clique em <Feather name={'search'} size={12} color={colors.detail} />.
                Em seguida, aperte <Feather name={'plus'} size={12} color={colors.detail} /> para criar novo pedido.
            </Text>

        </View>
    )

}

const styles = StyleSheet.create({

    inputs: {
        borderRadius: 50,
        height: 50,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#222',
        flex: 1,
        paddingHorizontal: 40,
    },
    textobotao: {
        fontSize: 15,
        textAlign: 'center',
        color: '#222',
        marginTop: 12
    },

    botaoPedidos: {
        elevation: 5,
        height: 50,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: 'center',
        marginTop: 20
    }
})
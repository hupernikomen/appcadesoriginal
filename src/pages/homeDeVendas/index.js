import { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import { AppContext } from '../../contexts/appContext';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Feather from 'react-native-vector-icons/Feather'

import MaskInput from 'react-native-mask-input';
import api from '../../services/api';

export default function Sale() {
    const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/]
    const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]

    const { credencial, Toast } = useContext(AppContext)
    const navigation = useNavigation()
    const { colors } = useTheme()

    const [cliente, setCliente] = useState('')
    const [cpf_cnpj, setCpf_Cnpj] = useState('')

    const [load, setLoad] = useState(false)

    useEffect(() => {

        // SE CPF/CNPJ ESTIVER INCOMPLETO MANTER DADOS APAGADOS
        cpf_cnpj.length >= 14 ? BuscaCliente(cpf_cnpj) : setCliente('')


    }, [cpf_cnpj])

    useEffect(() => {

        navigation.setOptions({
            headerRight: () => {
                return (
                    <View style={{ flexDirection: 'row', }}>

                        {!cliente && cpf_cnpj.length >= 14 ? <Pressable style={{ height: 55, width: 40, alignItems: "center", justifyContent: 'center' }}
                            onPress={() => navigation.navigate('RegistraCliente', { cpf_cnpj })}>
                            <Feather name='user-plus' color='#fff' size={22} />
                        </Pressable> : null}
                        <Pressable style={{ height: 55, width: 40, alignItems: "center", justifyContent: 'center' }}
                            onPress={() => BuscaCliente('15.302.980/0001-54')}>
                            <AntDesign name='swap' color='#fff' size={22} />
                        </Pressable>
                    </View>
                )
            }
        })


    }, [cliente])


    async function BuscaCliente(cpf_cnpj) {

        setLoad(true)

        try {
            const response = await api.get(`/busca/cliente?cpf_cnpj=${cpf_cnpj}`)
            if (response.data?.cpf_cnpj === "15.302.980/0001-54") {
                CriaOrdemDeCompra(response.data)
            }

            setCliente(response.data)
            
            !!response.data && Keyboard.dismiss()

        } catch (error) {
            console.log(error.response?.data?.error);

        } finally {
            setLoad(false)
        }
    }


    async function CriaOrdemDeCompra(data) {


        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credencial?.token}`
        }

        try {
            const response = await api.post(`/cria/ordemDeCompra`, { clienteID: data?.id, usuarioID: credencial.id }, { headers })
            console.log(response.data, "ordem");
            
            
            navigation.navigate('Orcamento', { ordemDeCompra: response.data, cliente: data })

        } catch (error) {
            console.log(error.response);

        }
    }


    return (
        <View style={{ flex: 1, padding: 10 }}>

            <View style={{ flexDirection: "row", alignItems: 'center', gap: 6, marginBottom: 30 }}>

                <MaskInput
                    keyboardType='numeric'
                    placeholder='CPF/CNPJ'
                    style={styles.inputs}
                    autoFocus={true}
                    value={cpf_cnpj}
                    onChangeText={setCpf_Cnpj}
                    placeholderTextColor={'#222'}
                    mask={(text) => {
                        if (text.replace(/\D+/g, "").length <= 11) {
                            return CPF_MASK
                        } else {
                            return CNPJ_MASK
                        }
                    }}
                />

                <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: 45,
                    right: 5,
                    position: 'absolute'
                }}>
                    {load ?
                        <ActivityIndicator color={'#222'} /> :
                        <Feather name={'search'} size={20} color={'#222'} />
                    }
                </View>
            </View>

            {!!cliente && cpf_cnpj.length >= 14 ?
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', padding: 18, borderTopWidth: .5, borderColor: '#ccc' }} onPress={() => CriaOrdemDeCompra(cliente)}>
                    <View>
                        <Text style={{ color: '#000', fontFamily: 'Roboto-Medium', fontSize: 15 }}>{cliente?.nome}</Text>
                        <Text style={{ fontWeight: '300', color: '#222', fontSize: 12, fontFamily: 'Roboto-Light', }}>{cliente?.whatsapp}</Text>
                    </View>
                </Pressable>
                : null
            }

        </View>
    )

}

const styles = StyleSheet.create({

    inputs: {
        borderRadius: 50,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#222',
        flex: 1,
        paddingHorizontal: 24,
        fontFamily: 'Roboto-Regular',
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
import { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import { AppContext } from '../../contexts/appContext';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Feather from 'react-native-vector-icons/Feather'

import MaskInput from 'react-native-mask-input';
import api from '../../services/api';
import MaskOfInput from '../../components/MaskOfInput';
import Texto from '../../components/Texto';
import ContainerItem from '../../components/containerItem';

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
            if (response.data?.cpf_cnpj === "15.302.980/0001-54")
                CriaOrdemDeCompra(response.data)

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
            navigation.navigate('Orcamento', { ordemDeCompra: response.data, cliente: data })

        } catch (error) {
            console.log(error.response);

        }
    }

    function tipoDeMascara(text) {
        if (text?.replace(/\D+/g, "").length <= 11) {
            return CPF_MASK
        } else {
            return CNPJ_MASK
        }
    }

    return (
        <View style={{ flex: 1, padding: 10 }}>

            <View style={{ flexDirection: "row", alignItems: 'center', gap: 6, marginBottom: 30 }}>

                <MaskOfInput mask={tipoDeMascara(cpf_cnpj)} setValue={setCpf_Cnpj} value={cpf_cnpj} style={{ flex: 1, fontSize: 22 }} type={'numeric'} title={'CPF / CNPJ'} />

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
                <ContainerItem onpress={() => CriaOrdemDeCompra(cliente)}>
                    <Texto texto={cliente?.nome} tamanho={16} />
                </ContainerItem> : null}

        </View>
    )

}


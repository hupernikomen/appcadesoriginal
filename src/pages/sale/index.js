import { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard, ActivityIndicator } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

import { AppContext } from '../../contexts/appContext';
import AntDesign from 'react-native-vector-icons/AntDesign'

import MaskInput from 'react-native-mask-input';
import api from '../../services/api';

export default function Sale() {
    const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/]
    const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]

    const { credential, Toast } = useContext(AppContext)
    const navigation = useNavigation()
    const { colors } = useTheme()

    const [data, setData] = useState([])
    const [cpf_cnpj, setCpf_Cnpj] = useState('')

    const [load, setLoad] = useState(false)

    useEffect(() => {

        // SE CPF/CNPJ ESTIVER INCOMPLETO MANTER DADOS APAGADOS
        if (cpf_cnpj.length < 14) {
            setData([])

        }

    }, [cpf_cnpj])

    useEffect(() => {
        navigation.setOptions({
            title: data.name ? 'Cliente: ' + data.name : ''
        })
    }, [data])


    async function GetClient(cpf_cnpj) {

        setLoad(true)

        // AO CLICAR NA LUPA ESSA FUNÇÃO É EXECUTADA
        Keyboard.dismiss()


        try {
            const _client = await api.get(`/getclient?cpf_cnpj=${cpf_cnpj}`)
            const _salesform = await api.get(`/getsalesform/client?clientID=${_client.data?.id}`)


            if (!_client.data && cpf_cnpj.length >= 14) {
                Toast("Cliente não cadastrado")

            } else if (cpf_cnpj.length < 14 ) {
                Toast('CPF/CNPJ incompleto')

            } else if (!!_client.data) {
                // setData(dadosCliente.data);
                await CreateSalesform(_client.data)

                _salesform.data?.map(salesform => {

                    // SE CLIENTE EXISTE E NÃO HA PEDIDO EM ABERTO 
                    if (!!_client.data && salesform.state !== 'Open') {
                        setData(_client.data);
                    } 
                })
            }


        } catch (error) {
            console.log(error.response.data.error);

        } finally {
            setLoad(false)
        }
    }


    async function CreateSalesform(data) {

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credential?.token}`
        }

        try {
            const response = await api.post(`/createsalesform`, { clientID: data?.id, collaboratorID: credential.id }, { headers })
            navigation.navigate('Budget', { salesformID: response.data?.id })

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

                <Pressable onPress={() => GetClient(cpf_cnpj)} style={{
                    backgroundColor: colors.detail,
                    borderRadius: 50,
                    alignItems: "center",
                    justifyContent: "center",
                    width: 45,
                    aspectRatio: 1
                }}>
                    <AntDesign name={'search1'} size={20} color={'#fff'} />
                </Pressable>

                    <Pressable onPress={() => GetClient('15.302.980/0001-54')} style={{
                        backgroundColor: colors.detail,
                        borderRadius: 50,
                        alignItems: "center",
                        justifyContent: "center",
                        width: 45,
                        aspectRatio: 1,
                    }}>
                        {load ?
                        <ActivityIndicator color={'#fff'}/>:
                        <AntDesign name='plus' size={20} color='#fff'/>
                        }
                    </Pressable>
            </View>

            <Text style={{ fontWeight: '300', color: '#222', textAlign: 'center', marginHorizontal: 20, marginVertical: 30 }}>
                Informe o numero do CPF/CNPJ e clique em <AntDesign name={'search1'} size={12} color={colors.detail} />.
                Ou aperte <AntDesign name={'plus'} size={12} color={colors.detail} /> para criar novo pedido sem cadastro.
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
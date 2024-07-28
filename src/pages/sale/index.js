import { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard, ActivityIndicator, FlatList } from 'react-native';
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

    const [salesforms, setSalesforms] = useState([])
    const [client, setClient] = useState('')
    const [cpf_cnpj, setCpf_Cnpj] = useState('')

    const [load, setLoad] = useState(false)

    useEffect(() => {

        // SE CPF/CNPJ ESTIVER INCOMPLETO MANTER DADOS APAGADOS
        cpf_cnpj.length >= 14 ? GetClient(cpf_cnpj) : setClient('')


    }, [cpf_cnpj])

    useEffect(() => {


    }, [client])


    async function GetClient(cpf_cnpj) {

        setLoad(true)

        try {
            const _client = await api.get(`/getclient?cpf_cnpj=${cpf_cnpj}`)
            const _salesform = await api.get(`/getsalesform/client?clientID=${_client.data?.id}`)

            setClient(_client.data)
            setSalesforms(_salesform.data)

            !!_client.data && Keyboard.dismiss()

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
            navigation.navigate('Budget', { salesformID: response.data?.id, client: data })

        } catch (error) {
            console.log(error.response);

        }
    }


    return (
        <View style={{ flex: 1, marginHorizontal: 14, marginVertical: 10 }}>

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
                        <AntDesign name={'search1'} size={20} color={'#222'} />
                    }
                </View>


            </View>

            {!!client && cpf_cnpj.length >= 14 ?

                <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }} onPress={() => CreateSalesform(client)}>
                    <AntDesign name={'user'} size={32} color={'#222'} />
                    <View>
                        <Text style={{ color: '#000' }}>{client?.name}</Text>
                        <Text style={{ fontWeight: '300', color: '#222', fontSize: 12 }}>{client?.whatsapp}</Text>
                    </View>
                </Pressable>
                :

                <Pressable style={{padding:10}} onPress={() => navigation.navigate('RegisterClient', { cpf_cnpj })}>

                    <Text style={{fontWeight:'300', color:'#000'}}>Cadastrar Cliente</Text>
                </Pressable>


            }


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
        paddingHorizontal: 24,
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
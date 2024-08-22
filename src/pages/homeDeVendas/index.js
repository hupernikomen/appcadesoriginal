import { useContext, useEffect, useState } from 'react';
import { View, Pressable, Keyboard, ActivityIndicator } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { AppContext } from '../../contexts/appContext';
import Material from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'

import api from '../../services/api';
import MaskOfInput from '../../components/MaskOfInput';
import Texto from '../../components/Texto';

export default function Sale() {
    const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/];
    const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]

    const { credencial } = useContext(AppContext)
    const navigation = useNavigation()
    const { colors } = useTheme()

    const [cliente, setCliente] = useState('')
    const [cpf_cnpj, setCpf_Cnpj] = useState('')

    const [load, setLoad] = useState(false)
    const [tipoSelecionado, setTipoSelecionado] = useState('Atacado')


    useEffect(() => {

        if (cpf_cnpj.length > 11) {
            BuscaCliente(cpf_cnpj);
        }

    }, [cpf_cnpj])




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
            const response = await api.post(`/cria/ordemDeCompra`, { clienteID: data?.id, usuarioID: credencial.id, tipo: tipoSelecionado }, { headers })
            navigation.navigate('Orcamento', { ordemDeCompraID: response.data.id })

        } catch (error) {
            console.log(error.response);

        } finally {
            setCliente("")
        }
    }

    function tipoDeMascara(text) {

        if (text?.replace(/\D+/g, "").length <= 11) {
            return CPF_MASK;
        } else {
            return CNPJ_MASK;
        }
    }

    return (
        <View style={{ flex: 1, padding: 10, gap: 6 }}>

            <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-around', gap: 6 }}>
                <Pressable onPress={() => setTipoSelecionado('Atacado')} style={{ borderRadius: 12, backgroundColor: '#e9e9e9', flexDirection: 'row', gap: 6, height: 40, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Material style={{ marginLeft: -26 }} name='check' size={20} color={tipoSelecionado === 'Atacado' ? colors.theme : '#ddd'} />
                    <Texto texto={'Atacado'} cor={tipoSelecionado === 'Atacado' ? '#222' : '#aaa'} />
                </Pressable>

                <Pressable onPress={() => setTipoSelecionado('Varejo')} style={{ borderRadius: 12, backgroundColor: '#e9e9e9', flexDirection: 'row', gap: 6, height: 40, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Material style={{ marginLeft: -26 }} name='check' size={20} color={tipoSelecionado === 'Varejo' ? colors.theme : '#ddd'} />
                    <Texto texto={'Varejo'} cor={tipoSelecionado === 'Varejo' ? '#222' : '#aaa'} />
                </Pressable>
            </View>




            <View style={{ flexDirection: "row", alignItems: 'center', gap: 2 }}>
                <MaskOfInput mask={tipoDeMascara(cpf_cnpj)} setValue={setCpf_Cnpj} value={cpf_cnpj} style={{ flex: 1, fontSize: 22 }} type={'numeric'} title={!!cliente ? cliente.nome : 'CPF / CNPJ'} />

                <View style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: 45,
                    right: 5,
                    position: 'absolute'
                }}>
                    {load ? <ActivityIndicator color={'#222'} /> : null}
                </View>
                {!!cliente ? <Pressable onPress={() => CriaOrdemDeCompra(cliente)} style={{ borderRadius: 12, gap: 6, backgroundColor: '#e9e9e9', height: 55, justifyContent: 'flex-start', alignItems: "center", paddingHorizontal: 18, flexDirection: "row" }}>
                    <AntDesign name='solution1' size={20} color={'#222'} />
                </Pressable> : null}
                {!cpf_cnpj ? <Pressable onPress={() => BuscaCliente("15.302.980/0001-54")} style={{ borderRadius: 12, gap: 6, backgroundColor: '#e9e9e9', height: 55, justifyContent: 'flex-start', alignItems: "center", paddingHorizontal: 18, flexDirection: "row" }}>
                    <AntDesign name='swap' size={20} color={'#222'} />
                </Pressable> : null}
                {!cliente && cpf_cnpj.length >= 14 ? <Pressable onPress={() => navigation.navigate('RegistraCliente', { cpf_cnpj })} style={{ borderRadius: 12, gap: 6, backgroundColor: '#e9e9e9', height: 55, justifyContent: 'flex-start', alignItems: "center", paddingHorizontal: 18, flexDirection: "row" }}>
                    <AntDesign name='adduser' size={20} color={'#222'} />
                </Pressable> : null}
            </View>


        </View>
    )
}


import { useContext, useEffect, useState } from 'react';
import { View, Pressable, Keyboard, ActivityIndicator, Switch } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { AppContext } from '../../contexts/appContext';

import api from '../../services/api';
import MaskOfInput from '../../components/MaskOfInput';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Icone from '../../components/Icone';

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

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    useEffect(() => {

        if (cpf_cnpj.length > 11) {
            BuscaCliente(cpf_cnpj);

        }

    }, [cpf_cnpj])




    async function BuscaCliente(cpf_cnpj) {

        setLoad(true)

        try {
            const response = await api.get(`/busca/cliente?cpf_cnpj=${cpf_cnpj}`)
            if (response.data?.cpf_cnpj === "000.000.000-00") {
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
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                titulo='Ordem de Compra' />

            <Tela>


                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 20, marginBottom:20, borderBottomWidth:.7, borderColor:'#ccc' }}>
                    <Pressable onPress={() => {
                        setTipoSelecionado('Atacado')
                        setIsEnabled(false)
                    }} style={{ flex: 1,alignItems:'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 }}>

                        <Texto texto={'Venda Atacado'} cor={!isEnabled ? colors.theme : '#bbb'} />
                    </Pressable>

                    <Switch
                        trackColor={{ false: '#ccc', true: '#ccc' }}
                        thumbColor={colors.theme}
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                    />

                    <Pressable onPress={() => {
                        setTipoSelecionado('Varejo')
                        setIsEnabled(true)
                    }} style={{ flex: 1,alignItems:'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 }}>
                        <Texto texto={'Venda Varejo'} cor={isEnabled ? colors.theme : '#bbb'} />
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

                    {!!cliente ? <Pressable onPress={() => CriaOrdemDeCompra(cliente)} style={{ borderRadius: 12, gap: 6, backgroundColor: '#e9e9e9', height: 60, justifyContent: 'flex-start', alignItems: "center", paddingHorizontal: 18, flexDirection: "row" }}>
                        <Icone label='COMPRAS' tamanhoDoIcone={20} corDoIcone='#222' nomeDoIcone='bag-handle-outline' onpress={() => CriaOrdemDeCompra(cliente)}/>
                    </Pressable> : null}

                    {!cpf_cnpj && isEnabled ? <Pressable onPress={() => BuscaCliente("000.000.000-00")} style={{ borderRadius: 12, gap: 6, backgroundColor: '#e9e9e9', height: 55, justifyContent: 'flex-start', alignItems: "center", paddingHorizontal: 18, flexDirection: "row" }}>
                        <Icone label='S/ CAD.' tamanhoDoIcone={20} corDoIcone='#222' nomeDoIcone='lock-open-outline' onpress={() => BuscaCliente("000.000.000-00")}/>
                        </Pressable> : null}

                    {!cliente && cpf_cnpj.length >= 14 ? <Pressable onPress={() => navigation.navigate('RegistraCliente', { cpf_cnpj })} style={{ borderRadius: 12, gap: 6, backgroundColor: '#e9e9e9', height: 60, justifyContent: 'flex-start', alignItems: "center", paddingHorizontal: 18, flexDirection: "row" }}>
                        <Icone label='NOVO' tamanhoDoIcone={20} corDoIcone='#222' nomeDoIcone='person-add-outline' onpress={() => navigation.navigate('RegistraCliente', { cpf_cnpj })}/>
                    </Pressable> : null}

                </View>
            </Tela>
        </>
    )
}


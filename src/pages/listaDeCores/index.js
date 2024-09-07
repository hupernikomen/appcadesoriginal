import { View, Text, FlatList, Pressable } from 'react-native';
import api from '../../services/api';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/appContext';
import MaskOfInput from '../../components/MaskOfInput';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import { useNavigation } from '@react-navigation/native';

export default function ListColors() {

    const { credencial, Toast } = useContext(AppContext)
    const [cores, setCores] = useState([])
    const [nome, setNome] = useState('')

    const navigation = useNavigation()

    useEffect(() => {
        ListaCores()
    }, [])


    async function ListaCores() {
        try {
            const response = await api.get("/listaCores")
            const cores = response.data
            
            setCores(cores)

        } catch (error) {
            console.log(error.response);

        }
    }

    function gerarCodigoAleatorio(listaDeCores) {
        let codigoAleatorio;
        do {
            codigoAleatorio = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        } while (listaDeCores.some(item => item.codigo === codigoAleatorio));
        return codigoAleatorio;
    }


    async function CriaCor() {

        if (!nome) return


        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credencial?.token}`
        }

        try {
            await api.post(`/criacor`, { nome, codigo: gerarCodigoAleatorio(cores) }, { headers })
            await ListaCores()
            setNome('')

        } catch (error) {
            console.log(error.response);
            Toast(error.response.data.error)

        }
    }

    function calcularEstoque(arr) {
        return arr?.reduce((acc, current) => {
            acc.estoque += current.estoque;
            acc.saida += current.saida;
            return acc;
        }, { estoque: 0, saida: 0 }).estoque - arr?.reduce((acc, current) => acc + current.saida, 0);
    }


    const Cores = ({ data }) => {

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                
                <Text style={{ fontWeight: '300', color: "#000" }}>{data?.nome}</Text>
                
                <View style={{ flexDirection: "row" }}>
                    <Text style={{ fontWeight: '300', color: "#000", fontSize: 12, width: 60, textAlign: 'right' }}>{calcularEstoque(data?.produto)} </Text>
                    <Text style={{ fontWeight: '300', color: "#000", fontSize: 12, width: 60, textAlign: 'right' }}>{data?.produto[0]?.saida} </Text>
                </View>
            </View>
        )
    }

    const CoresCabecalho = () => {
        return (

            <View>
                <View style={{ flexDirection: "row", paddingVertical: 10, marginBottom: 20, borderBottomColor: '#e9e9e9', borderBottomWidth: 1 }}>
                    <MaskOfInput style={{ flex: 1 }} title='Nome da Cor' value={nome} setValue={setNome} maxlength={20} />
                    <Pressable onPress={() => CriaCor()} style={{ height: 65, width: 65, alignItems: 'center', justifyContent: 'center' }}><Text>Criar</Text></Pressable>
                </View>

                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between", marginBottom: 18 }}>

                    <Text style={{ fontWeight: '500', color: "#000" }}>Cor</Text>

                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ fontWeight: '500', color: "#000", width: 60, textAlign: 'right' }}>E</Text>
                        <Text style={{ fontWeight: '500', color: "#000", width: 60, textAlign: 'right' }}>V</Text>

                    </View>
                </View>
            </View>


        )
    }


    return (
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                titulo='Cores' />

            <Tela>
                <FlatList data={cores?.sort((a, b) => a.nome.localeCompare(b.nome))}
                    ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 6 }} />}
                    ListHeaderComponent={<CoresCabecalho />}
                    renderItem={({ item }) => <Cores data={item} />}
                />
            </Tela>
        </ >
    );
}
import { View, Text, FlatList, Pressable } from 'react-native';
import api from '../../services/api';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/appContext';
import MaskOfInput from '../../components/MaskOfInput';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import { useNavigation } from '@react-navigation/native';
import Icone from '../../components/Icone';
import Texto from '../../components/Texto';

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
        const result = arr?.reduce((acc, current) => {
            acc.estoque += current.estoque;
            acc.saida += current.saida;
            return acc;
        }, { estoque: 0, saida: 0 });

        return {
            estoque: result.estoque - result.saida,
            saida: result.saida
        };
    }

    const Cores = ({ data }) => {

        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                <View style={{ flexDirection: "row", gap: 12 }}>

                    <View style={{ width: 20, aspectRatio: 1, borderRadius: 20, backgroundColor: data.corHexa }} />
                    <Text style={{ fontWeight: '300', color: "#000" }}>{data?.nome}</Text>
                </View>

                <View style={{ flexDirection: "row", gap: 6 }}>
                    <Text style={{ fontWeight: '300', color: "#000", fontSize: 12, width: 40, textAlign: 'center' }}>{calcularEstoque(data?.produto).estoque} </Text>
                    <Text style={{ fontWeight: '300', color: "#000", fontSize: 12, width: 40, textAlign: 'center' }}>{calcularEstoque(data?.produto).saida} </Text>
                </View>
            </View>
        )
    }


    const CoresCabecalho = () => {
        return (

            <View>
                <View style={{ flexDirection: "row",alignItems:"center", paddingVertical: 10, borderBottomColor: '#e9e9e9', borderBottomWidth: 1 }}>
                    <MaskOfInput style={{ flex: 1 }} title='Nome da Cor' value={nome} setValue={setNome} maxlength={20} />
                    <Pressable onPress={() => CriaCor()} style={{ height: 65, width: 65, alignItems: 'center', justifyContent: 'center' }}>
                        <Texto texto='Criar' />
                    </Pressable>
                </View>

                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between" }}>

                    <Texto texto='Cor' />

                    <View style={{ flexDirection: "row", gap: 6 }}>
                        <Icone nomeDoIcone={'pricetag-outline'} corDoIcone='#000' width={40} tamanhoDoIcone={18} />
                        <Icone nomeDoIcone={'repeat'} corDoIcone='#000' width={40} tamanhoDoIcone={18} />

                    </View>
                </View>
            </View>


        )
    }


    return (
        <>
            <Topo
                iconeLeft={{ nome: 'chevron-back', acao: () => navigation.goBack() }}
                titulo='Cores' />

            <Tela>
                <FlatList data={cores?.sort((a, b) => a.nome.localeCompare(b.nome))}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9' }} />}
                    ListHeaderComponent={<CoresCabecalho />}
                    renderItem={({ item }) => <Cores data={item} />}
                />
            </Tela>
        </ >
    );
}
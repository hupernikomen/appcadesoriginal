import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import api from '../../services/api';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Texto from '../../components/Texto';
import Load from '../../components/Load';
import { ScrollView } from 'react-native-gesture-handler';

export default function DetalheEstoque() {

    const route = useRoute()
    const navigation = useNavigation()
    const [load, setLoad] = useState(true)

    const [produtos, setProdutos] = useState([])

    useEffect(() => {
        BuscaPorReferencia()

    }, [route])

    async function BuscaPorReferencia() {
        try {
            const res = await api.get(`/busca/produto/referencia?referencia=${route.params?.referencia?.referencia}`)



            setProdutos(res.data)

        } catch (error) {
            console.log(error.data);
        } finally {
            setLoad(false)
        }
    }

    const tamanhoOrder = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2', 'G3', 'G4', 'G5', '2', '4', '6', '8', '10', '12', '14', '16'];

    function organizeList(list) {
        const result = {};
        list.forEach((item) => {
            const tamanho = item.tamanho;
            if (!result[tamanho]) {
                result[tamanho] = [];
            }
            result[tamanho].push({
                id: item.id,
                cor: item.cor.nome,
                estoque: item.estoque,
                saida: item.saida,
                codigoDeBarras: item.codigoDeBarras
            });
        });
        Object.keys(result).forEach((tamanho) => {
            result[tamanho].sort((a, b) => b.saida - a.saida); // sort by stock quantity in descending order
        });
        return tamanhoOrder.map((tamanho) => ({
            tamanho,
            cores: result[tamanho] || [],
        })).filter((item) => item.cores.length > 0);
    }



    //   console.log(organizedData);

    if (load) return <Load />

    return (
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                titulo={route.params?.referencia?.referencia + " - " + route.params?.referencia?.nome} />
            <Tela>

                <ScrollView showsVerticalScrollIndicator={false}>

                    {organizeList(produtos).map((item, index) => {
                        return (
                            <View key={index}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 18, marginBottom: 12 }}>
                                    <Texto texto={item.tamanho} tamanho={22} tipo='Bold' estilo={{ flex: 1 }} />
                                    <Texto tipo='Medium' texto='Est.' estilo={{ width: 40, textAlign: 'right' }} />
                                    <Texto tipo='Medium' texto='Ven.' estilo={{ width: 50, textAlign: 'right' }} />
                                </View>

                                {item.cores.map((item, index) => {
                                    return (
                                        <Pressable onPress={() => navigation.navigate('RegistraEstoque', {codigoDeBarras: item.codigoDeBarras})} key={index} style={{ flexDirection: "row", justifyContent: "space-between", height:25 }}>
                                            <Texto tipo='Light' texto={item.cor} estilo={{ flex: 1 }} />
                                            <Texto tipo='Light' texto={item.estoque - item.saida} estilo={{ width: 40, textAlign: 'right' }} />
                                            <Texto tipo='Light' texto={item.saida} estilo={{ width: 50, textAlign: 'right' }} />
                                        </Pressable>
                                    )
                                })}
                            </View>
                        )

                    })}
                </ScrollView>
            </Tela>
        </>
    );
}
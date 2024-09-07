import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Dimensions } from 'react-native';
import api from '../../services/api';
import Topo from '../../components/Topo';
import Texto from '../../components/Texto';
import Load from '../../components/Load';
import Tela from '../../components/Tela';

export default function DetalheEstoque() {


    const tamanhoOrder = ['PP', 'P', 'M', 'G', 'GG', 'G1', 'G2', 'G3', 'G4', 'G5', '2', '4', '6', '8', '10', '12', '14', '16'];

    const { width } = Dimensions.get('window')
    const route = useRoute()
    const navigation = useNavigation()
    const [load, setLoad] = useState(true)

    const [produtos, setProdutos] = useState([])

    useEffect(() => {
        BuscaPorReferencia()

    }, [route])

    async function BuscaPorReferencia() {
        try {
            const response = await api.get(`/busca/produto/referencia?referencia=${route.params?.referencia?.referencia}`)
            const produtos = response.data

            setProdutos(produtos)

        } catch (error) {
            console.log(error.data);
        } finally {
            setLoad(false)
        }
    }


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
                corHexa: item.cor?.corHexa,
                estoque: item.estoque,
                saida: item.saida,
                reservado: item.reservado,
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



    if (load) return <Load />

    return (
        <View>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                titulo={route.params?.referencia?.referencia + " - " + route.params?.referencia?.nome} />

            <FlatList
                horizontal
                data={organizeList(produtos)}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                renderItem={({ item, index }) => {
                    return (
                        <View key={index} style={{ width: width, paddingHorizontal: 14 }}>
                            <View style={{ flexDirection: "row",  justifyContent: "space-between", borderBottomWidth: .5, borderColor: '#d9d9d9', paddingVertical: 12 }}>
                                <Texto tamanho={22} tipo='Bold' texto={item.tamanho} estilo={{ marginLeft: 36 }} />
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                    <Texto texto='Res.' estilo={{ width: 30, textAlign: 'right' }} />
                                    <Texto texto='Vend.' estilo={{ width: 50, textAlign: 'right' }} />
                                    <Texto texto='Est.' estilo={{ width: 50, textAlign: 'right' }} />
                                </View>
                            </View>

                            <FlatList
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{paddingTop:14, paddingBottom:104}}
                                ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 12 }} />}
                                data={item.cores}
                                renderItem={({ item }) => {
                                    return (
                                        <Pressable onPress={() => {
                                            navigation.navigate('RegistraEstoque', { codigoDeBarras: item.codigoDeBarras })
                                        }} key={index} style={{ flexDirection: "row", justifyContent: "space-between", height: 25, alignItems: 'center' }}>
                                            <View style={{ width: 26, aspectRatio: 1, borderRadius: 10, backgroundColor: item.corHexa, marginRight: 10, opacity: .8 }} />

                                            <Texto tipo='Light' texto={item.cor} estilo={{ flex: 1 }} />

                                            {item.reservado === 0 ? null : <Texto tipo='Light' texto={item.reservado} estilo={{ width: 30, textAlign: 'right' }} />}

                                            {!item.saida ? null : <Texto tipo='Light' texto={item.saida} estilo={{ width: 50, textAlign: 'right' }} />}

                                            <Texto tipo='Light' texto={item.estoque - item.saida} estilo={{ width: 50, textAlign: 'right' }} />
                                        </Pressable>
                                    )
                                }}
                            />

                        </View>
                    )
                }}
            />
        </View>
    );
}
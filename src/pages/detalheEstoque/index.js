import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, Dimensions } from 'react-native';
import api from '../../services/api';
import Topo from '../../components/Topo';
import Texto from '../../components/Texto';
import Load from '../../components/Load';
import Icone from '../../components/Icone';

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


                            <FlatList
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{  paddingBottom: 80 }}
                                ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9' }} />}
                                data={item.cores}
                                ListHeaderComponent={
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: .5, borderColor: '#d9d9d9' }}>
                                        <Texto tamanho={22} tipo='Bold' texto={item.tamanho} estilo={{ marginLeft: 30 }} />
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                            <Icone nomeDoIcone={'cube-outline'} corDoIcone='#000' width={40} tamanhoDoIcone={18} />
                                            <Icone nomeDoIcone={'repeat'} corDoIcone='#000' width={40} tamanhoDoIcone={18} />
                                            <Icone nomeDoIcone={'pricetag-outline'} corDoIcone='#000' width={40} tamanhoDoIcone={18} />

                                        </View>
                                    </View>
                                }
                                renderItem={({ item }) => {
                                    return (
                                        <Pressable onPress={() => {
                                            navigation.navigate('RegistraEstoque', { codigoDeBarras: item.codigoDeBarras })
                                        }} key={index} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: 'center', paddingVertical: 12 }}>
                                            <View style={{ width: 20, aspectRatio: 1, borderRadius: 20, backgroundColor: item.corHexa, marginRight: 10, opacity: .8 }} />

                                            <Texto tipo='Light' texto={item.cor} estilo={{ flex: 1 }} />
                                            <Texto tipo='Light' texto={item.reservado ? item.reservado : ''} estilo={{ width: 40, textAlign: 'center' }} />
                                            <Texto tipo='Light' texto={item.saida ? item.saida : ''} estilo={{ width: 40, textAlign: 'center' }} />
                                            <Texto tipo='Light' texto={item.estoque - item.saida} estilo={{ width: 40, textAlign: 'center' }} />

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
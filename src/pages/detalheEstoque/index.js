import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import api from '../../services/api';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Texto from '../../components/Texto';
import Load from '../../components/Load';

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

    if (load) return <Load/>

    return (
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                titulo= {route.params?.referencia?.referencia + " - " + route.params?.referencia?.nome} />
            <Tela>
                <View style={{ justifyContent: "space-between", flexDirection: 'row', height: 50, alignItems: 'center' }}>
                    <Texto tipo='Medium' texto='Cor' estilo={{ flex: 1 }} />
                    <Texto tipo='Medium' texto='Tam.' estilo={{ width: 40, textAlign: 'right' }} />
                    <Texto tipo='Medium' texto='Est.' estilo={{ width: 40, textAlign: 'right' }} />
                    <Texto tipo='Medium' texto='Ven.' estilo={{ width: 50, textAlign: 'right' }} />

                </View>

                <FlatList
                    data={produtos?.sort((a, b) => b.saida - a.saida)}
                    ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 12 }} />}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        return (
                            <Pressable onPress={() => navigation.navigate('RegistraEstoque', { 
                                codigoDeBarras: item.codigoDeBarras,
                                id: item.id,
                                referencia: item.referencia,
                                tamanho: item.tamanho,
                                estoque: item.estoque,
                                cor: item.cor
                                
                                })} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Texto tipo='Light' texto={item.cor.nome} estilo={{ flex: 1 }} />
                                <Texto tipo='Light' texto={item.tamanho} estilo={{ width: 40, textAlign: 'right' }} />
                                <Texto tipo='Light' texto={item.estoque - item.saida} estilo={{ width: 40, textAlign: 'right' }} />
                                <Texto tipo='Light' texto={item.saida} estilo={{ width: 50, textAlign: 'right' }} />
                            </Pressable>
                        )
                    }}
                />
            </Tela>
        </>
    );
}
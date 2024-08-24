import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import api from '../../services/api';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Texto from '../../components/Texto';

export default function DetalheEstoque() {

    const route = useRoute()
    const navigation = useNavigation()

    const [produtos, setProdutos] = useState([])

    useEffect(() => {
        BuscaPorReferencia()
        navigation.setOptions({
            title: route.params?.referencia?.referencia + " - " + route.params?.referencia?.nome
        })
    }, [route])

    async function BuscaPorReferencia(params) {
        try {
            const res = await api.get(`/busca/produto/referencia?referencia=${route.params?.referencia?.referencia}`)
            setProdutos(res.data)
        } catch (error) {
            console.log(error.data);
        }
    }

    return (
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                titulo='' />
            <Tela>
                <View style={{ flexDirection: "row", justifyContent: "space-between", height: 40, alignItems: "center" }}>
                    <Texto tipo='Medium' texto='Cor' estilo={{ flex: 1 }} />
                    <Texto tipo='Medium' texto='T' estilo={{ width: 50, textAlign: 'right' }} />
                    <Texto tipo='Medium' texto='E' estilo={{ width: 50, textAlign: 'right' }} />
                    <Texto tipo='Medium' texto='V' estilo={{ width: 50, textAlign: 'right' }} />

                </View>
                <FlatList
                    data={produtos?.sort((a, b) => a.cor.nome.localeCompare(b.cor.nome))}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        return (
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Texto tipo='Light' texto={item.cor.nome} estilo={{ flex: 1 }} />
                                <Texto tipo='Light' texto={item.tamanho} estilo={{ width: 50, textAlign: 'right' }} />
                                <Texto tipo='Light' texto={item.estoque - item.saida} estilo={{ width: 50, textAlign: 'right' }} />
                                <Texto tipo='Light' texto={item.saida} estilo={{ width: 50, textAlign: 'right' }} />
                            </View>
                        )
                    }}
                />
            </Tela>
        </>
    );
}
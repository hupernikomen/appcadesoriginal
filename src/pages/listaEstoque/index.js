import { View, Text, Pressable, FlatList, Dimensions } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Load from '../../components/Load';

export default function ListaEstoque() {

    const [listaEstoque, setListaEstoque] = useState([])
    const navigation = useNavigation()
    const [totalEstoque, setTotalEstoque] = useState('')
    const [load, setLoad] = useState(true)

    useEffect(() => {
        ListaEstoque()

    }, [])

    async function ListaEstoque() {
        try {
            const res = await api.get('/lista/produtos')

            const uniqueReferences = {};
            res.data.forEach(item => {

                if (!uniqueReferences[item.referencia]) {
                    uniqueReferences[item.referencia] = {
                        referencia: item.referencia,
                        estoque: 0,
                        nome: item.nome,
                        saida: 0,
                        saidaTotal: 0
                    };
                }
                uniqueReferences[item.referencia].estoque += item.estoque;
                uniqueReferences[item.referencia].saida += item.saida;
                uniqueReferences[item.referencia].saidaTotal += item.saida;
            });

            const listaEstoque = Object.keys(uniqueReferences).map(key => {
                return {
                    referencia: key,
                    estoque: uniqueReferences[key].estoque,
                    nome: uniqueReferences[key].nome,
                    saidaTotal: uniqueReferences[key].saidaTotal
                };
            });
            setListaEstoque(listaEstoque);

            const maxStock = listaEstoque.reduce((acc, current) => acc + current.estoque, 0);
            setTotalEstoque(maxStock);

        } catch (error) {
            console.log(error.response);
        } finally {
            setLoad(false)
        }
    }

    function Produtos({ data }) {
        return (
            <Pressable onPress={() => navigation.navigate('DetalheEstoque', { referencia: data })} style={{ flexDirection: 'row', justifyContent: "space-between" }}>
                <View style={{ flexDirection: 'row', alignItems: "flex-start" }}>

                    <Texto estilo={{ width: 40 }} texto={data.referencia} tipo='Light' />
                    <View >
                        <Texto texto={data.nome} tipo='Light' />
                        <Texto tipo='Light' texto={`${((data.estoque / totalEstoque) * 100).toFixed(2)}% do estoque total`} />
                        <Texto texto={`${data.saidaTotal} itens vendidos`} tipo='Light' />
                    </View>
                </View>

                <Texto texto={data.estoque} tipo='Light' />
            </Pressable>
        )
    }

    const EstoqueCabecalho = () => {
        return (
            <View style={{ justifyContent: "space-between", flexDirection: 'row', height: 50, alignItems: 'center' }}>

                <View style={{ flexDirection: 'row' }}>
                    <Texto tipo='Medium' texto={'Ref.'} estilo={{ width: 40 }} />
                    <Texto tipo='Medium' texto={'Informações'} />
                </View>
                <Texto tipo='Medium' texto={'Estoque'} />
            </View>
        )
    }

    if (load) return <Load/>


    return (
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                iconeRight={{ nome: 'add-sharp', acao: () => navigation.navigate('RegistraEstoque') }}
                titulo='Estoque' />

            <Tela>

                <Texto texto={'Obs.: Esta lista está ordenada da referência mais vendida para a menos vendida. Itens clicáveis'} tipo='Light' estilo={{marginVertical:12}}/>

                <FlatList
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 12 }} />}
                    data={listaEstoque.sort((a, b) => b.saidaTotal - a.saidaTotal)}
                    renderItem={({ item }) => <Produtos data={item} />}
                    ListHeaderComponent={<EstoqueCabecalho />}
                />
            </Tela>
        </>
    );
}
import { View, Text, Pressable, FlatList, Dimensions } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';
import api from '../../services/api';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Load from '../../components/Load';
import MaskOfInput from '../../components/MaskOfInput';

import { AppContext } from '../../contexts/appContext';

export default function ListaEstoque() {

    const navigation = useNavigation()
    const { colors } = useTheme()
    const [listaEstoque, setListaEstoque] = useState([])
    const [totalEstoque, setTotalEstoque] = useState('')
    const [load, setLoad] = useState(true)
    const [busca, setBusca] = useState('')

    const {FormatarTexto} = useContext(AppContext)

    useEffect(() => {
        ListaEstoque()

    }, [])


    // Testar Erros no estoque 
    function verificaIntegridadeDoEstoque(itens) {
        const itemFalha = itens.find((item) => {
            const { reservado, saida, estoque } = item;
            return (
                reservado < 0 ||
                reservado + saida > estoque ||
                saida > estoque
            );
        });
        return { resultado: !!itemFalha, itemFalha };
    }

    async function ListaEstoque() {
        try {
            const res = await api.get('/lista/produtos')

            

            // Varre o estoque atras de algumas falhas, se houver falha, retorna TRUE e o item da falha
            const { resultado, itemFalha } = verificaIntegridadeDoEstoque(res.data);

            resultado && console.log(itemFalha, "Item com inconsistência no estoque");


            const uniqueReferences = {};
            res.data.forEach(item => {

                if (!uniqueReferences[item.referencia]) {
                    uniqueReferences[item.referencia] = {
                        referencia: item.referencia,
                        estoque: 0,
                        nome: item.nome,
                        saida: 0,
                        saidaTotal: 0,
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
                    nome: FormatarTexto(uniqueReferences[key].nome),
                    saidaTotal: uniqueReferences[key].saidaTotal,
                    erro: key === itemFalha?.referencia ? true : false
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
                <View style={{ flexDirection: 'row', alignItems: "baseline" }}>

                    <View style={{ backgroundColor: colors.detalhe, marginRight: 10, borderRadius: 10, paddingHorizontal: 6, alignItems: 'center' }}>
                        <Texto tamanho={12} texto={data.referencia} cor='#fff' tipo='Light' />
                    </View>

                    <View >
                        <Texto texto={data.nome} tipo='Light' />
                        <Texto tipo='Light' texto={`${((data.estoque / totalEstoque) * 100).toFixed(2)}% do estoque`} />
                        {data.saidaTotal === 0 ? null : <Texto texto={`${data.saidaTotal} ite${data.saidaTotal > 1 ? 'ns' : 'm'} vendido${data.saidaTotal > 1 ? 's' : ''}`} tipo='Light' />}
                        {!data.erro ? null : <Texto tipo='Light' texto={data.erro ? 'Inconsistência no estoque' : ''} cor={colors.detalhe} />}
                    </View>
                </View>
                <Texto texto={data.estoque} tipo='Light' />
            </Pressable>
        )
    }

    if (load) return <Load />

    return (
        <>

            <Topo
                posicao='center'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                iconeRight={{ nome: 'add-sharp', acao: () => navigation.navigate('RegistraEstoque') }}
                titulo='Estoque Atual' />

            <Tela>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 20 }} />}
                    data={
                        busca
                            ? listaEstoque.filter((item) => item.referencia === busca)
                            : listaEstoque.sort((a, b) => b.saidaTotal - a.saidaTotal)
                    }
                    renderItem={({ item }) => <Produtos data={item} />}
                    ListHeaderComponent={<MaskOfInput type='numeric' setValue={setBusca} value={busca} title={'Busca por Referência'} style={{ marginBottom: 30 }} />}
                />
            </Tela>
        </>
    );
}
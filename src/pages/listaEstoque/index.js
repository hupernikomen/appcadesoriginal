import { View, Text, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign'
import api from '../../services/api';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';

export default function ListaEstoque() {

    const [listaEstoque, setListaEstoque] = useState([])
    const navigation = useNavigation()

    useEffect(() => {
        ListaEstoque()

    }, [])

    async function ListaEstoque() {
        try {
            const res = await api.get('/lista/produtos')
            const uniqueReferences = {};
            res.data.forEach(item => {
                if (!uniqueReferences[item.referencia]) {
                    uniqueReferences[item.referencia] = { referencia: item.referencia, estoque: 0, nome: item.nome };
                }
                uniqueReferences[item.referencia].estoque += item.estoque;
            });
            const listaEstoque = Object.keys(uniqueReferences).map(key => {
                return { referencia: key, estoque: uniqueReferences[key].estoque, nome: uniqueReferences[key].nome };
            });
            setListaEstoque(listaEstoque);

        } catch (error) {
            console.log(error.response);
        }
    }

    function Produtos({ data }) {
        return (
            <Pressable onPress={() => navigation.navigate('DetalheEstoque', { referencia: data })} style={{ justifyContent: "space-between", flexDirection: 'row' }}>

                <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    <Texto estilo={{ width: 40 }} texto={data.referencia} tipo='Light' />
                    <Texto texto={data.nome} tipo='Light' />
                </View>
                <Texto texto={data.estoque} tipo='Light' />
            </Pressable>
        )
    }

    const EstoqueCabecalho = () => {
        return (
            <View style={{ justifyContent: "space-between", flexDirection: 'row', height:50, alignItems:'center' }}>

                <View style={{ flexDirection: 'row'}}>
                    <Texto tipo='Medium' texto={'Ref.'} estilo={{ width: 40 }} />
                    <Texto tipo='Medium' texto={'Descrição'} />
                </View>
                <Texto tipo='Medium' texto={'Estoque'} />
            </View>
        )
    }


    return (
        <>
            <Topo
                posicao='left'
                iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
                iconeRight={{ nome: 'add-sharp', acao: () => navigation.navigate('RegistraEstoque') }}
                titulo='Estoque' />

            <Tela>

                <FlatList
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 12 }} />}
                    data={listaEstoque.sort((a, b) => a.referencia.localeCompare(b.referencia))}
                    renderItem={({ item }) => <Produtos data={item} />}
                    ListHeaderComponent={<EstoqueCabecalho />}
                />
            </Tela>
        </>
    );
}
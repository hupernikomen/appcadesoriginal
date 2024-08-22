import { View, Text, Pressable, FlatList } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign'
import api from '../../services/api';
import Texto from '../../components/Texto';
import ContainerItem from '../../components/ContainerItem';

export default function ListaEstoque() {

    const [listaEstoque, setListaEstoque] = useState([])
    const navigation = useNavigation()

    useEffect(() => {
        ListaEstoque()
        navigation.setOptions({
            headerRight: () => (
                <View>
                    <Pressable style={{ width: 40, height: 55, alignItems: 'center', justifyContent: "center", marginRight: -10 }} onPress={() => navigation.navigate('RegistraEstoque')}>
                        <AntDesign name='plus' color='#fff' size={20} />
                    </Pressable>
                </View>
            )
        })
    }, [])

    async function ListaEstoque() {
        try {
            const res = await api.get('/lista/produtos')
            setListaEstoque(res.data)

        } catch (error) {
            console.log(error.response);

        }
    }

    function Produtos({ data }) {
        return (
            <View>
                <View style={{ justifyContent: "space-between", flexDirection: 'row' }}>

                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        <Texto estilo={{width:40}} texto={data.referencia} tipo='Light' />
                        <Texto texto={data.nome} tipo='Light'/>
                    </View>
                    <Texto texto={data.estoque - data.saida} tipo='Light' />
                </View>
            </View>
        )
    }

    const EstoqueCabecalho = () => {
        return (
            <View style={{paddingVertical: 10, marginBottom: 20, borderBottomColor: '#e9e9e9', borderBottomWidth: 1 }}>
                <View style={{ justifyContent: "space-between", flexDirection: 'row' }}>

                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        <Texto texto={'Ref.'} estilo={{width:40}}/>
                        <Texto texto={'Descrição'} />
                    </View>
                    <Texto texto={'Estoque'} />
                </View>
            </View>
        )
    }


    return (
        <View>
            <FlatList
                contentContainerStyle={{ padding: 10, paddingBottom:20 }}
                ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical:18 }} />}
                data={listaEstoque?.sort((a, b) => a.referencia.localeCompare(b.referencia))}
                renderItem={({ item }) => <Produtos data={item} />}
                ListHeaderComponent={<EstoqueCabecalho/>}
            />
        </View>
    );
}
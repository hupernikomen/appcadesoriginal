import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';

import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import SelectDropdown from 'react-native-select-dropdown'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { AppContext } from '../../contexts/appContext';
export default function Budget() {

    const { credential, Toast } = useContext(AppContext)
    const route = useRoute()
    const navigation = useNavigation()

    const [productsScan, setProductsScan] = useState([])
    const [budgets, setBudgets] = useState([])
    const [quantidade, setQuantidade] = useState('')
    const [tamanhoFilter, setTamanhoFilter] = useState('')


    useEffect(() => {
        Promise.all([HandleBudget()])

        setProductsScan(route.params?.product)

        navigation.setOptions({
            title: 'Orçamento - ' + route.params?.pedidoId?.substr(0, 6).toUpperCase()
        })


    }, [route])



    async function HandleBudget() {
        try {
            const res = await api.get(`/orcamentos/pedido?pedidoId=${route.params?.pedidoId}`)
            setBudgets(res.data)

        } catch (error) {
            console.log(error.response, "erro: HandleBudget");
        }
    }

    async function AddItemOrder(data) {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credential?.token}`
            }

            const item = {
                pedidoId: route.params?.pedidoId,
                referencia: data?.referencia,
                quantidade: 0,
                cor: data?.cor,
                tamanho: data?.tamanho
            }

            await api.post('/orcamento', item, { headers }).then(() => HandleBudget()).then(() => setProductsScan([]))

            setTamanhoFilter('')

        } catch (error) {
            console.log(error.response);
        }

    }



    const RenderItem = ({ data }) => {

        console.log(data);

        if (Number(data?.entrada) - Number(data?.saida) - Number(data?.separado) <= 0) {
            return
        }

        return (
            <Pressable onPress={() => AddItemOrder(data)} style={{ flexDirection: 'row', gap: 6, flex: 1, paddingVertical: 16 }}>
                <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
                    <Text style={{ fontWeight: '300', color: '#000' }}>{data?.referencia}</Text>
                    <Text style={{ fontWeight: '300', color: '#000', marginLeft: 4 }}>{data?.quantidade > 0 ? data?.quantidade + 'x' : ''}</Text>
                    <Text style={{ fontWeight: '300', color: '#000' }}>{data?.nome}</Text>
                    <Text style={{ fontWeight: '300', color: '#000' }}>{data?.tamanho}</Text>
                    <Text style={{ fontWeight: '300', color: '#000' }}>{data?.cor}</Text>
                </View>
                <Text style={{ fontWeight: '300', color: '#000' }}>{data?.valorAtacado}</Text>
            </Pressable>
        )
    }

    const RenderBudgets = ({ data }) => {
        return (
            <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', flex: 1, paddingVertical: 16 }}>
                <View style={{ flexDirection: 'row', gap: 6, flex: 1 }}>
                    <Text style={{ fontWeight: '300', color: '#000' }}>{data.Produto.referencia}</Text>
                    <Text style={{ fontWeight: '300', color: '#000', marginLeft: 4 }}>{data.quantidade > 0 ? data.quantidade + 'x' : ''}</Text>
                    <Text style={{ fontWeight: '300', color: '#000' }}>{data.Produto.nome}</Text>
                    <Text style={{ fontWeight: '300', color: '#000' }}>{data.Produto.tamanho}</Text>
                    <Text style={{ fontWeight: '300', color: '#000' }}>{data.Produto.cor}</Text>
                </View>
                <Text style={{ fontWeight: '300', color: '#000' }}>{data.Produto.valorAtacado}</Text>
            </View>
        )
    }


    const listProductsTamsUnique = getUniqueTamanhos(productsScan);


    function getUniqueTamanhos(products) {
        return ['', ...new Set(products?.map(produto => produto.tamanho))];
    }


    function getItemsNotInB(a, b) {
        Toast("Referencia ja inserida no orçamento")
        return a.filter(item => !b.find(itemB => itemB.Produto.id === item.id));
    }



    return (
        <View style={{ flex: 1 }}>

            {productsScan?.length > 0 ?
   
                    <SelectDropdown
                        data={listProductsTamsUnique}
                        onSelect={(selectedItem, index) => {
                            setTamanhoFilter(selectedItem)
                        }}
                        renderButton={(selectedItem, isOpened) => {
                            return (
                                <View style={styles.dropdownButtonStyle}>
                                    <Text style={styles.dropdownButtonTxtStyle}>
                                        {(selectedItem && selectedItem) || 'Filtro'}
                                    </Text>
                                </View>
                            );
                        }}
                        renderItem={(item, index, isSelected) => {
                            return (
                                <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
                                    <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                                </View>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                        dropdownStyle={styles.dropdownMenuStyle}
                    />
                : null
            }

            {productsScan?.length > 0 ?
                <FlatList
                    ItemSeparatorComponent={<View style={{ borderBottomWidth: 1, borderColor: '#ccc' }} />}
                    contentContainerStyle={{ paddingHorizontal: 14, backgroundColor:'#fff', margin:10, elevation:10 }}
                    data={getItemsNotInB(productsScan.filter((item) => tamanhoFilter ? item.tamanho === tamanhoFilter : item), budgets)}
                    renderItem={({ item }) => <RenderItem data={item} />}
                />
                :
                <FlatList
                    ItemSeparatorComponent={<View style={{ borderBottomWidth: 1, borderColor: '#ccc' }} />}
                    contentContainerStyle={{ paddingHorizontal: 14 }}
                    data={budgets}
                    renderItem={({ item }) => <RenderBudgets data={item} />}
                />
            }

            <View style={{
                position: 'absolute',
                right: 14,
                bottom: 30,
                gap: 10
            }}>

                {productsScan?.length > 0 ? <Pressable style={{
                    width: 65,
                    aspectRatio: 1,
                    elevation: 5,
                    backgroundColor: "#fff",
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: "center"
                }} onPress={() => setProductsScan([])}><AntDesign name={'close'} size={26} color='#222' /></Pressable> : null}

                <Pressable onPress={() => {
                    navigation.navigate('Scanner', route.params?.pedidoId)
                }} style={{
                    width: 65,
                    aspectRatio: 1,
                    elevation: 5,
                    backgroundColor: "#fff",
                    borderRadius: 40,
                    alignItems: 'center',
                    justifyContent: "center"
                }}><AntDesign name={'barcode'} size={26} color='#222' /></Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    dropdownButtonStyle: {
        width: 150,
        height: 45,
        backgroundColor: '#ddd',
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        margin:6
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#151E26',
        textAlign: 'center'
    },
    dropdownButtonArrowStyle: {
        fontSize: 28,
    },
    dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
    dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: 8,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
    },
    dropdownItemIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
});
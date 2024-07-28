import { View, Text, FlatList, Pressable, StyleSheet, Dimensions, ActivityIndicator, TextInput } from 'react-native';

import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import Input from '../../components/Input';
import { Picker } from '@react-native-picker/picker';


import api from '../../services/api';
import { AppContext } from '../../contexts/appContext';

export default function UpdateItemBudget() {

    const { width } = Dimensions.get('window')

    const { credential, Toast } = useContext(AppContext)

    const route = useRoute()
    const navigation = useNavigation()
    const {colors} = useTheme()

    const [productsBudgets, setProductsBudgets] = useState([])


    const [amountUpdate, setAmountUpdate] = useState('')
    const [sizeSelect, setSizeSelect] = useState('')
    const [colorSelect, setColorSelect] = useState('')
    const [productSelect, setProductSelect] = useState('')
    const [stockNow, setStockNow] = useState('')


    useEffect(() => {

        GetProducts(route.params?.product?.ref)
        setSizeSelect(route.params?.product?.size)
        setColorSelect(route.params?.product?.color)
        setAmountUpdate(String(route.params?.amount))

        navigation.setOptions({
            title: route.params?.product?.ref + " - " + route.params?.product?.name,
        })


    }, [])



    useEffect(() => {

        const productFilter = productsBudgets.find((item) => item.size === sizeSelect && item.color === colorSelect)
        setProductSelect(productFilter)

    }, [sizeSelect, colorSelect])


    useEffect(() => {

        setStockNow(productSelect?.stock - (productSelect?.reserved + productSelect?.out) || route.params?.product?.stock - (route.params?.product?.reserved + route.params?.product?.out))

    }, [productSelect])


    async function DelBudget() {
        try {
            await api.delete(`/delbudget?budgetID=${route.params?.id}`)
            navigation.goBack()
        }
        catch (error) {
            console.log(error.response)
        }
    }

    async function UpdateItem() {

        if (amountUpdate === '0') {
            DelBudget()
            return
        }


        if (amountUpdate > stockNow) {
            Toast(`Estoque insuficiente. ${stockNow} unid. restantes`)
            return
        }


        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credential?.token}`
        }

        try {
            await api.put(`/budget?budgetID=${route.params?.id}`, { amount: Number(amountUpdate < 1 ? 1 : amountUpdate), productID: productSelect?.id }, { headers })


        }
        catch (error) { console.log(error.response) }
        finally { navigation.goBack() }

    }

    async function GetProducts(ref) {

        try {
            const products = await api.get(`/getproduct/ref?ref${ref}`)
            setProductsBudgets(products.data)
        } catch (error) {
            console.log(error.response);
        }

    }



    return (
        <View style={{ padding: 10, flex: 1 }}>

            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: .8 }}>

                    <Text style={{ marginLeft: 14, fontWeight: '300', color: '#000' }}>Tam.:</Text>
                    <View style={{
                        height: 55,
                        borderWidth: .7,
                        borderColor: '#777',
                        borderRadius: 12,
                        margin: 2,

                    }}>
                        <Picker
                            mode="dialog"
                            style={{ fontWeight: '300', color: '#222', height: 55 }}
                            selectedValue={sizeSelect}
                            onValueChange={(itemValue) => {
                                setSizeSelect(itemValue);
                            }}>

                            <Picker.Item label='' />
                            {Object.values(productsBudgets.filter((item) => item.ref === route.params?.product?.ref)
                                .reduce((acc, current) => {
                                    acc[current.size] = current;
                                    return acc;
                                }, {})
                            ).map((item) => {

                                return (
                                    <Picker.Item
                                        key={item.id}
                                        value={item.size}
                                        label={item.size}
                                        style={{ fontWeight: '300', color: '#222', marginTop: 12, height: 40 }}
                                    />
                                );
                            })}
                        </Picker>
                    </View>
                </View>
                <View style={{ flex: 1 }}>

                    <Text style={{ marginLeft: 14, fontWeight: '300', color: '#000' }}>Cor:</Text>
                    <View style={{
                        height: 55,
                        borderWidth: .7,
                        borderColor: '#777',
                        borderRadius: 12,
                        margin: 2,


                    }}>
                        <Picker
                            mode="dialog"
                            style={{ fontWeight: '300', color: '#222', height: 55 }}
                            selectedValue={colorSelect}
                            onValueChange={(itemValue) => {
                                setColorSelect(itemValue);

                            }}>

                            <Picker.Item label='' />

                            {productsBudgets.filter((item) => item.size === sizeSelect && item.ref === route.params?.product?.ref).map((item) => {

                                return (
                                    <Picker.Item
                                        key={item.id}
                                        value={item.color}
                                        label={item.color}
                                        style={{ fontWeight: '300',  color: '#222', marginTop: 12, height: 40 }}
                                    />
                                );
                            })}
                        </Picker>
                    </View>

                </View>
                <View style={{ flex: .4 }}>
                    <Text style={{ marginLeft: 14, fontWeight: '300', color: '#000' }}>Qtd.:</Text>
                    <Input type='numeric' maxlength={3} setValue={setAmountUpdate} value={amountUpdate} />
                </View>
            </View>



            <View style={{ marginTop: 20, position: "absolute", bottom: 0, width: width }}>

                <Pressable style={{ height: 60, elevation:5, margin: 14, borderRadius:6, justifyContent: "center", alignItems: 'center', backgroundColor:colors.theme }} onPress={() => UpdateItem()}>
                    <Text style={{color:'#fff'}}>Atualizar</Text>
                </Pressable>

            </View>
        </View>
    );
}
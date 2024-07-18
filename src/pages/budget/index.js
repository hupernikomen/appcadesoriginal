import { View, Text, FlatList, Pressable, StyleSheet, Dimensions, ActivityIndicator, TextInput } from 'react-native';

import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import AntDesign from 'react-native-vector-icons/AntDesign'
import SelectDropdown from 'react-native-select-dropdown';
import { Picker } from '@react-native-picker/picker';

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
export default function Budget() {

   const { width } = Dimensions.get('window')

   const { credential } = useContext(AppContext)
   const { HandleBudget, budgets } = useContext(CrudContext)

   const route = useRoute()
   const navigation = useNavigation()
   const { colors } = useTheme()

   const [load, setLoad] = useState(false)
   const [amountEditVisible, setAmountEditVisible] = useState(false)

   const [budgetID, setBudgetID] = useState('')


   const [formPayment, setFormPayment] = useState('Cartão')
   const droplist = ["Cartão", "Boleto", "A vista", "Cheque"]

   const [productsBudgets, setProductsBudgets] = useState([])


   const [amountUpdate, setAmountUpdate] = useState('')
   const [sizeSelect, setSizeSelect] = useState('')
   const [colorSelect, setColorSelect] = useState('')
   const [productID, setProductID] = useState('')
   const [total, setTotal] = useState('')

   const listAmount = Array(50).fill(0).map((_, index) => ({ id: index + 1 }));


   useEffect(() => {

      navigation.setOptions({
         title: 'Orçamento - ' + route.params?.salesformID?.substr(0, 6).toUpperCase(),
         headerRight: () => (
            route.params?.stateSalesform !== 'Concluded' ?
               <View style={{ width: 50, aspectRatio: 1, marginRight: -14, alignItems: 'center', justifyContent: "center" }}>

                  {/* Colocar modal confirmando ação */}

                  <Pressable onPress={() => StateBudget(route.params?.salesformID)}>
                     {route.params?.stateSalesform !== 'Created' ?
                        <AntDesign name='folderopen' color='#fff' size={22} /> :
                        <AntDesign name='folder1' color='#fff' size={22} />
                     }
                  </Pressable>
               </View> : null
         )

      })

      HandleBudget(route.params?.salesformID)

   }, [route])

   useEffect(() => {
      setTotal(budgets.reduce((acc, current) => acc + current.total, 0).toFixed(2))
   }, [budgets])


   useEffect(() => {
      return () => {
         if (budgets?.length === 0) {
            DelSalesform(route.params?.salesformID)
         }
      }

   }, [])

   async function DelSalesform(salesformID) {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credential?.token}`
      }

      try { await api.delete(`/delsalesform?salesformID=${salesformID}`, { headers }) }
      catch (error) { console.log(error.response) }
   }


   async function StateBudget(salesformID, total) {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credential?.token}`
      }

      try { await api.put(`/putstock?salesformID=${salesformID}`, { total: total }, { headers }) }
      catch (error) { console.log(error.response) }
      finally { navigation.navigate('Home') }
   }


   async function DelBudget() {
      try { await api.delete(`/delbudget?budgetID=${budgetID}`) }
      catch (error) { console.log(error.response) }
      finally { HandleBudget(route.params?.salesformID) }
   }



   async function PutAmount() {

      if (!amountEditVisible) return

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credential?.token}`
      }

      try {
         await api.put(`/budget?budgetID=${budgetID}`, { amount: Number(amountUpdate < 1 ? 1 : amountUpdate), productID: productID }, { headers })

      }
      catch (error) { console.log(error.response) }
      finally { HandleBudget(route.params?.salesformID) }

   }




   const Dropdown = () => {
      return (
         <SelectDropdown
            data={droplist}
            onSelect={(selectedItem, index) => {
               setFormPayment(selectedItem, index);
            }}
            renderButton={(selectedItem, isOpened) => {
               return (
                  <View style={styles.dropdownButtonStyle}>

                     <Text style={styles.dropdownButtonTxtStyle}>
                        {(selectedItem && selectedItem) || <AntDesign name='filter' size={20} />}
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
         />
      )
   }

   async function GetProducts(ref) {
      try {
         const products = await api.get(`/getproduct/ref?ref${ref}`)
         setProductsBudgets(products.data)
      } catch (error) {
         console.log(error.response);
      }

   }



   function RenderBudgets({ data }) {

      return (
         <View style={{ height: 70, overflow: 'hidden', justifyContent: "center", backgroundColor: '#e7e7e7' }}>

            {/* FUNDO */}
            <View style={{ gap: 1, flexDirection: 'row', position: 'absolute', left: 0, height: 70, width: width - 55 }}>

               <View style={{ flex: .9, marginTop: 14 }}>
                  <Text style={{ marginLeft: 14, fontWeight: '300', fontSize: 13, color: '#000', position: "absolute", top: -4 }}>Tamanho</Text>
                  <Picker
                     mode="dialog"
                     style={{ fontWeight: '300', color: '#222', height: 40 }}
                     selectedValue={sizeSelect}
                     onValueChange={(itemValue) => {
                        setSizeSelect(itemValue);
                     }}>

                     {productsBudgets.filter((item) => item.ref === data.product?.ref).map((item) => {
                        return (
                           <Picker.Item
                              key={item.id}
                              value={item.size}
                              label={item.size}
                              style={{ fontWeight: '300', fontSize: 13, color: '#222', marginTop: 12, height: 40 }}
                           />
                        );
                     })}
                  </Picker>
               </View>


               <View style={{ flex: .9, marginTop: 14 }}>
                  <Text style={{ marginLeft: 14, fontWeight: '300', fontSize: 13, color: '#000', position: "absolute", top: -4 }}>Cor</Text>
                  <Picker
                     mode="dialog"
                     style={{ fontWeight: '300', color: '#222', height: 40 }}
                     selectedValue={colorSelect}
                     onValueChange={(itemValue) => {
                        setColorSelect(itemValue);
                     }}>
                     {productsBudgets.filter((item) => item.size === sizeSelect).map((item) => {

                        return (
                           <Picker.Item
                              key={item.id}
                              value={item.color}
                              label={item.color}
                              style={{ fontWeight: '300', fontSize: 13, color: '#222', marginTop: 12, height: 40 }}
                           />
                        );
                     })}
                  </Picker>
               </View>

               <View style={{ flex: .9, marginTop: 14 }}>
                  <Text style={{ marginLeft: 14, fontWeight: '300', fontSize: 13, color: '#000', position: "absolute", top: -4 }}>Quantidade</Text>
                  <Picker
                     mode="dropdown"
                     style={{ fontWeight: '300', color: '#222', height: 40 }}
                     selectedValue={amountUpdate}
                     onValueChange={(itemValue) => {
                        setAmountUpdate(itemValue);
                     }}>
                     {listAmount.map((item) => {
                        return (
                           <Picker.Item
                              key={item.id}
                              value={item.id}
                              label={item.id}
                              style={{ fontWeight: '300', fontSize: 13, color: '#222', marginTop: 12, height: 40 }}
                           />
                        );
                     })}
                  </Picker>
               </View>


            </View>


            {/* BOTÃO */}
            <Pressable
               onLongPress={() => DelBudget()}
               onPress={() => {
                  PutAmount()
                  setBudgetID(data.id)
                  setProductID(data.product.id)
                  setSizeSelect(data.product.size)
                  setColorSelect(data.product.color)
                  setAmountEditVisible(!amountEditVisible)
                  GetProducts(data.ref)
               }} style={{ borderRadius: amountEditVisible ? 14 : 0, marginVertical: .5, elevation: 15, backgroundColor: "#fff", paddingHorizontal: 14, transform: [{ translateX: amountEditVisible && data.id === budgetID ? width - 55 : 0 }], flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', flex: 1 }}>

               {load && !amountEditVisible ? <ActivityIndicator /> :
                  <View style={{ flexDirection: 'row', gap: 6, flex: 1, alignItems: 'flex-start' }}>
                     <Text style={{ fontWeight: '300', color: '#000' }}>{data.product?.ref}</Text>
                     <Text style={{ fontWeight: '300', color: '#000' }}>{data.amount > 0 ? data.amount + 'x' : ''}</Text>
                     <Text numberOfLines={2} style={{ fontWeight: '300', color: '#000', flex: 1, paddingRight: 18 }}>{data.product?.name} {data.product.size} {data.product.color}. unid. {data.product?.valueResale}</Text>
                     <Text style={{ fontWeight: '300', color: '#000' }}>{data.total}</Text>
                  </View>
               }

            </Pressable>
         </View>
      )
   }



   if (load) return <ActivityIndicator size={30} color={colors.theme} style={{ marginTop: 50 }} />


   return (
      <View style={{ flex: 1 }}>

         {route.params?.stateSalesform === 'Reserved' ? <Dropdown /> : null}


         <FlatList
            data={budgets}
            renderItem={({ item }) => <RenderBudgets data={item} />}
            ListFooterComponent={
               budgets.length > 0 ? <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '300', color: '#222', alignItems: "flex-start" }}>
                     <Text>Valor a pagar: </Text>
                     <Text style={{ fontWeight: '400', fontSize: 16 }}> {total}</Text>
                  </Text>
               </View> : null}
            ListFooterComponentStyle={{
               marginTop: 14,
               padding: 14,

            }}
         />

         <View style={{
            position: 'absolute',
            right: 14,
            bottom: 30,
            gap: 10
         }}>
            {route.params?.stateSalesform !== 'Concluded' && route.params?.stateSalesform !== 'Reserved' ?
               <Pressable onPress={() => {
                  navigation.navigate('Scanner', route.params?.salesformID)
               }} style={{
                  width: 65,
                  aspectRatio: 1,
                  elevation: 5,
                  backgroundColor: "#fff",
                  borderRadius: 40,
                  alignItems: 'center',
                  justifyContent: "center"
               }}><AntDesign name={'barcode'} size={26} color='#222' /></Pressable> : null
            }
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
      margin: 6
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


import { View, Text, FlatList, Pressable, StyleSheet, Modal, ActivityIndicator, TextInput } from 'react-native';

import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import AntDesign from 'react-native-vector-icons/AntDesign'

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
export default function Budget() {

   const { credential } = useContext(AppContext)
   const { HandleBudget, budgets } = useContext(CrudContext)

   const route = useRoute()
   const navigation = useNavigation()
   const { colors } = useTheme()

   const [load, setLoad] = useState(false)
   const [amountEditVisible, setAmountEditVisible] = useState(false)

   const [amountUpdate, setAmountUpdate] = useState('')
   const [budgetID, setBudgetID] = useState('')
   const [productID, setProductID] = useState('')


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
      // Promise.all(HandleBudget(route.params?.salesformID))



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

      try {
         await api.delete(`/delsalesform?salesformID=${salesformID}`, { headers })

      } catch (error) {
         console.log(error.response);

      }
   }


   async function StateBudget(salesformID) {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credential?.token}`
      }

      try {
         await api.put(`/putstock?salesformID=${salesformID}`, { headers })

      } catch (error) {
         console.log(error.response);

      } finally {
         navigation.navigate('Home')
      }
   }


   async function PutAmount() {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credential?.token}`
      }

      try {
         if (amountUpdate > 0) {

            await api.put(`/budget?productID=${productID}&budgetID=${budgetID}`, { amount: Number(amountUpdate) }, { headers })
         }

      } catch (error) {
         console.log(error.response);
      } finally {
         setAmountEditVisible(false)
         HandleBudget(route.params?.salesformID)
      }

   }


   const AmountInput = () => {
      return (
         <View style={{ borderRadius: 20, flexDirection: 'row', alignItems: 'center', padding: 2, gap: 6, backgroundColor: '#fff' }}   >

            <TextInput
               value={amountUpdate}
               keyboardType='numeric'
               onChangeText={setAmountUpdate}
               autoFocus
               maxLength={3}
               style={{
                  backgroundColor: '#eee',
                  borderRadius: 20,
                  height: 30,
                  color: '#222',
                  paddingVertical: 0,
                  textAlign: 'center',
                  paddingHorizontal: 10
               }}

            />

            <Pressable style={{ backgroundColor: 'green', borderRadius: 20, height: 30, aspectRatio: 1, alignItems: 'center', justifyContent: "center" }}
               onPress={() => PutAmount()}><AntDesign name='reload1' size={16} color={'#fff'} /></Pressable>
         </View>
      )
   }

   const RenderBudgets = ({ data }) => {
      return (
         <Pressable onPress={() => {
            setProductID(data.product.id)
            setBudgetID(data.id)
            setAmountEditVisible(true)
         }} style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', flex: 1, paddingVertical: 16 }}>
            <View style={{ flexDirection: 'row', gap: 6, flex: 1, alignItems: 'center' }}>
               <Text style={{ fontWeight: '300', color: '#000' }}>{data.product.ref}</Text>
               {amountEditVisible && data.id === budgetID ? <AmountInput /> :
                  <Text style={{ fontWeight: '300', color: '#000', marginLeft: 4 }}>{data.amount > 0 ? data.amount + 'x' : ''}</Text>
               }
               <Text numberOfLines={1} style={{ fontWeight: '300', color: '#000', flex: 1, paddingRight: 20 }}>{data.product.name} {data.product.size} {data.product.color}</Text>
            </View>
            <Text style={{ fontWeight: '300', color: '#000' }}>{data.product.valueResale}</Text>
         </Pressable>
      )
   }



   if (load) return <ActivityIndicator size={30} color={colors.theme} style={{ marginTop: 50 }} />


   return (
      <View style={{ flex: 1 }}>
         <FlatList
            ItemSeparatorComponent={<View style={{ borderBottomWidth: 1, borderColor: '#ccc' }} />}
            contentContainerStyle={{ paddingHorizontal: 14 }}
            data={budgets}
            renderItem={({ item }) => <RenderBudgets data={item} />}
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


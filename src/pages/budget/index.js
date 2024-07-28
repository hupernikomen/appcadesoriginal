import { View, Text, FlatList, Pressable, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';

import { useRoute, useNavigation, useTheme, useIsFocused } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Material from 'react-native-vector-icons/MaterialCommunityIcons'

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import Load from '../../components/Load';
export default function Budget() {

   const { credential, Toast } = useContext(AppContext)
   const { HandleBudget, budgets, load, setLoad } = useContext(CrudContext)

   const focus = useIsFocused()
   const route = useRoute()
   const navigation = useNavigation()
   const { colors } = useTheme()

   const droplist = ["Cartão", "Boleto", "A vista", "Cheque"]

   const [total, setTotal] = useState('')

   useEffect(() => {

      navigation.setOptions({
         title: 'Orçamento - ' + route.params?.salesformID?.substr(0, 6).toUpperCase(),
         headerRight: () => {
            return (
               route.params?.stateSalesform !== 'Entregue' && route.params?.stateSalesform !== 'Separado' ?
                  <Pressable onPress={() => {
                     navigation.navigate('Scanner', route.params?.salesformID)
                  }}><Material name={'barcode-scan'} size={26} color='#fff' /></Pressable> : null

            )
         }

      })

      HandleBudget(route.params?.salesformID)


   }, [route, focus])

   useEffect(() => {
      setTotal(budgets.reduce((acc, current) => acc + current.total, 0).toFixed(2))
   }, [budgets])


   useEffect(() => {
      setLoad(true)

      return () => {
         if (budgets?.length === 0) {
            DelSalesform(route.params?.salesformID)
         }
      }

   }, [])

   // Ao sair da pagina e não tiver itens cadastrados, o Salesform será excluido do BD 
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

      try {
         await api.put(`/putstock?salesformID=${salesformID}`, { total: total.toFixed(2) }, { headers })

         switch (route.params?.stateSalesform) {
            case 'Aberto':
               Toast("Pedido Criado")
               break;
            case 'Criado':
               Toast("Pedido Separado")
               break;
            case 'Separado':
               Toast("Pedido Finalizado")
               break;

            default:
               break;
         }
         navigation.goBack()
      }
      catch (error) { console.log(error.response) }
   }



   function RenderBudgets({ data }) {

      return (
         <View style={{
            backgroundColor: '#f3f3f3',
            elevation: 5,
            flexDirection: 'row',
            height: 70,
            margin: 1,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#fff',
         }}>


            <Pressable
               onPress={() => {
                  if (route.params?.stateSalesform === 'Entregue') return
                  navigation.navigate('UpdateItemBudget', data)
               }} style={{ marginVertical: .5, paddingHorizontal: 14, flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', flex: 1 }}>

               <View style={{ flexDirection: 'row', gap: 6, flex: 1, alignItems: 'flex-start' }}>
                  <Text style={{ fontWeight: '300', color: '#000' }}>{data.product?.ref}</Text>
                  <Text style={{ fontWeight: '300', color: '#000' }}>{data.amount > 0 ? data.amount + 'x' : ''}</Text>
                  <View style={{ flex: 1, paddingRight: 18 }}>
                     <Text numberOfLines={2} style={{ fontWeight: '300', color: '#000' }}>{data.product?.name} {data.product.size} {data.product.color}</Text>
                     <Text numberOfLines={2} style={{ fontWeight: '300', color: '#000' }}>{data.product?.valueResale} unid.</Text>
                  </View>
                  <Text style={{ fontWeight: '300', color: '#000' }}>{data.total.toFixed(2).replace('.', ',')}</Text>
               </View>

            </Pressable>
         </View>
      )
   }



   if (load) return <Load />


   return (
      <View style={{ flex: 1 }}>

         <FlatList
            contentContainerStyle={{ padding: 10 }}
            data={budgets}
            renderItem={({ item }) => <RenderBudgets data={item} />}
            ListFooterComponent={
               budgets.length > 0 ? <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '300', color: '#222', alignItems: "flex-start", margin: 14 }}>
                     <Text>Valor a pagar: </Text>
                     <Text style={{ fontWeight: '400', fontSize: 16 }}> {total.replace('.', ',')}</Text>
                  </Text>

                  {route.params?.stateSalesform !== 'Entregue' ? <Pressable onPress={() => StateBudget(route.params?.salesformID)} style={{
                     backgroundColor: colors.black,
                     elevation: 5,
                     flexDirection: 'row',
                     padding: 10,
                     margin: 1,
                     alignItems: 'center',
                     borderWidth: 1,
                     borderColor: '#fff',
                  }}><Text style={{ color: '#fff' }}>Fechar</Text></Pressable> : null}
               </View> : null}
            ListFooterComponentStyle={{
               marginTop: 10,
            }}
         />

      </View>
   );
}

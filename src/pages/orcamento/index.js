import { View, Text, FlatList, Pressable, Keyboard, ActivityIndicator, } from 'react-native';

import { useRoute, useNavigation, useTheme, useIsFocused } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import AntDesign from 'react-native-vector-icons/AntDesign'

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import Load from '../../components/Load';
import Input from '../../components/Input';
import Texto from '../../components/Texto';

export default function Orcamento() {

   const { credencial, Toast } = useContext(AppContext)
   const { BuscaItemDoPedido, itensDoPedido, load, AdicionarItemAoPedido, SubtraiUmItemDoPedido } = useContext(CrudContext)
   const focus = useIsFocused()
   const route = useRoute()
   const navigation = useNavigation()
   const { colors } = useTheme()

   const [referencia, setReferencia] = useState([])
   const [produtoEncontrado, setProdutoEncontrado] = useState([])

   const [tamanhoSelecionado, setTamanhoSelecionado] = useState("")

   const listaDeTamanhos = ["PP", "P", "M", "G", "GG"];

   const [total, setTotal] = useState('')

   useEffect(() => {
      navigation.setOptions({
         title: 'Pedido ' + route.params?.ordemDeCompra?.estado + " - " + route.params?.ordemDeCompra?.id?.substr(0, 6).toUpperCase() ,
      })
   }, [route, total])

   useEffect(() => {
      BuscaItemDoPedido(route.params?.ordemDeCompra?.id)
   }, [])

   useEffect(() => {
      setTotal(itensDoPedido.reduce((acc, current) => acc + current.total, 0).toFixed(2))
   }, [itensDoPedido])

   useEffect(() => {
      if (referencia.length === 4) {
         BuscaProduto()
         setTamanhoSelecionado('')

         Keyboard.dismiss()
      } else { setProdutoEncontrado([]) }
   }, [referencia])


   async function BuscaProduto() {
      try {
         const res = await api.get(`/busca/produto/referencia?referencia=${referencia}`)
         setProdutoEncontrado(res.data)
      } catch (error) {
         console.log(error.response);
      }
   }

   function RenderBudgets({ data }) {
      return (
         <Pressable onPress={() => {
            route.params?.ordemDeCompra?.estado !== "Entregue" && SubtraiUmItemDoPedido(data.id, data.produto.id, data.quantidade, route.params?.ordemDeCompra?.id)
         }}
            style={{ flexDirection: "row" }}>
            <View style={{
               flex: 1,
               backgroundColor: '#f3f3f3',
               elevation: 5,
               flexDirection: 'row',
               padding: 14,
               height: 80,
               margin: 1,
               alignItems: 'center',
               borderWidth: 2,
               borderColor: '#fff',
            }}>
               <View style={{ marginVertical: .5, paddingHorizontal: 6, flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', flex: 1 }}>
                  <View style={{ flexDirection: 'row', gap: 6, flex: 1, alignItems: 'flex-start' }}>

                     <Texto texto={data.quantidade > 0 ? data.quantidade + 'x' : ''} />
                     <Texto estilo={{ paddingHorizontal: 10, flex: 1 }} tipo={'Light'} texto={`${data.produto?.referencia} - ${data.produto?.nome} ${data.produto?.tamanho} ${data.produto?.cor} (R$ ${data.produto?.valorAtacado})`} />
                     <Texto texto={data.total.toFixed(2).replace('.', ',')} />

                  </View>
               </View>
            </View>
         </Pressable>
      )
   }


   function StatusButton(estado) {

      switch (estado) {
         case 'Aberto':
            return {
               icone: 'creditcard',
               texto: 'Pagamento',
               caminho: () => navigation.navigate('FinalizaVenda', { ordemDeCompraID: route.params?.ordemDeCompra?.id, total: total }),
            }
         case 'Criado':
            return {
               icone: 'inbox',
               texto: 'Separado',
               caminho: () => StateBudget()
            }
         case 'Separado':
            return {
               icone: 'swap',
               texto: 'Entregue',
               caminho: () => StateBudget()
            }
      }
   }


   async function StateBudget() {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credencial?.token}`
      }

      try {
         await api.put(`/putstock?ordemDeCompraID=${route.params?.ordemDeCompra?.id}`, { headers })
         navigation.goBack()
      }
      catch (error) { console.log(error.response) }
   }


   const HeaderBudget = () => {


      return (
         <View style={{ flexDirection: "row", alignSelf: 'flex-end', justifyContent: "space-between", marginVertical: 30 }}>
            {StatusButton(route.params?.ordemDeCompra?.estado)?.caminho && <Pressable onPress={StatusButton(route.params?.ordemDeCompra?.estado)?.caminho} style={{
               flexDirection: "row",
               gap: 6,
               alignItems: 'center',
               borderWidth: .7,
               borderColor: '#777',
               padding: 14,
               borderRadius: 6
            }}>
               <AntDesign name={StatusButton(route.params?.ordemDeCompra?.estado)?.icone} color='#000' size={18} />
               <Texto texto={StatusButton(route.params?.ordemDeCompra?.estado)?.texto} tamanho={13} />
            </Pressable>}


         </View>
      )
   }

   const converteData = (date) => {
      const data = new Date(date);
      const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      return formatoData.format(data);

   }


   return (
      <View style={{ flex: 1 }}>

         {route.params?.ordemDeCompra?.estado !== 'Entregue' ?
            <View style={{ gap: 6, padding: 10 }}>
               <Input title={produtoEncontrado[0]?.nome || 'Informe uma Referência'} setValue={setReferencia} value={referencia} type='numeric' maxlength={4} />

               <View style={{ flexDirection: "row", gap: 6 }}>

                  {listaDeTamanhos.map((tamanho, index) => {
                     const tamanhoExiste = [...new Set(produtoEncontrado.filter(item => (item.estoque - (item.reservado + item.saida)) > 0).map(item => item.tamanho))]
                     return (
                        <Pressable disabled={!tamanhoExiste.includes(tamanho)} onPress={() => setTamanhoSelecionado(tamanho)} key={index}
                           style={{
                              display: tamanhoExiste.includes(tamanho) ? 'flex' : 'none',
                              width: 50,
                              aspectRatio: 1,
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 12,
                              borderColor: tamanhoSelecionado === tamanho ? colors.theme : "#777",
                              borderWidth: tamanhoSelecionado.includes(tamanho) ? 2 : .7,
                           }}>
                           <Texto texto={tamanho} cor={tamanhoSelecionado === tamanho ? colors.theme : "#222"} />
                        </Pressable>
                     )
                  })}

               </View>


               <View style={{ flexDirection: "row", marginVertical: 6 }}>
                  {[...new Set(produtoEncontrado.filter(item => item.tamanho === tamanhoSelecionado)
                     .filter(item => item.estoque > (item.reservado + item.saida))
                     .map((item, index) => {
                        return (
                           <Pressable onPress={() => AdicionarItemAoPedido({ produtoID: item.id, ordemDeCompraID: route.params?.ordemDeCompra?.id })
                           } key={index}
                              style={{
                                 alignItems: "center",
                                 justifyContent: "center",
                                 borderRadius: 12,
                                 borderColor: '#777',
                                 borderWidth: .7,
                                 height: 50,
                                 paddingHorizontal: 18,

                              }}>

                              <View style={{ position: "absolute", right: 6, top: -6, paddingHorizontal: 6, backgroundColor: colors.background, borderRadius: 6 }}>
                                 <Texto texto={item.estoque - (item.reservado + item.saida)} tipo={'Light'} tamanho={10} />
                              </View>

                              <Texto texto={item.cor} tipo={'Regular'} />
                           </Pressable>
                        )
                     }))]}
               </View>
            </View> : null}

         {route.params?.ordemDeCompra?.estado !== 'Aberto' ? <View style={{ alignSelf: 'flex-end', paddingHorizontal: 18, marginVertical: 12 }}>
            <Texto cor={'#777'} tipo={'Light'} tamanho={13} texto={`Atualizado em ${converteData(route.params?.ordemDeCompra?.atualizadoEm)}`} />
         </View> : null}


         <FlatList
            data={itensDoPedido}
            contentContainerStyle={{ borderTopWidth: 1, borderColor: '#ddd', padding: 10 }}
            renderItem={({ item }) => <RenderBudgets data={item} />}
            ListHeaderComponent={load ?
               <View style={{ padding: 6, flexDirection: "row", alignItems: 'center', gap: 12 }}>
                  <ActivityIndicator color={colors.theme} />
                  <Texto texto={'Atualizando'} tipo={'Light'} tamanho={15} />
               </View> :
               <View style={{ padding: 6, flexDirection: "row", justifyContent: "space-between", alignItems: 'center', gap: 12 }}>
                  <Texto texto={'Orçamento'} tipo={'Medium'} tamanho={15} />
                  <Texto texto={`Total R$ ${total.replace('.', ',')}`} tipo={'Medium'} tamanho={15} />
               </View>
            }
            ListFooterComponent={itensDoPedido?.length > 0 ? <HeaderBudget /> : null}
         />


      </View >
   );
}

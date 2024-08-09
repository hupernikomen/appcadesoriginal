import { View, Text, FlatList, Pressable, Keyboard, ActivityIndicator, Alert, Modal, StyleSheet } from 'react-native';

import { useRoute, useNavigation, useTheme, useFocusEffect } from '@react-navigation/native';
import { useEffect, useState, useContext, useCallback } from 'react';
import api from '../../services/api';
import AntDesign from 'react-native-vector-icons/AntDesign'

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import Input from '../../components/Input';
import Texto from '../../components/Texto';
import ContainerItem from '../../components/ContainerItem';
import Load from '../../components/Load';

export default function Orcamento() {
   const navigation = useNavigation()
   const [modalVisible, setModalVisible] = useState(false);
   const { credencial, Toast } = useContext(AppContext)
   const { BuscaItemDoPedido, itensDoPedido, load, AdicionarItemAoPedido, SubtraiUmItemDoPedido, ListaOrdemDeCompras } = useContext(CrudContext)
   const { params: rota } = useRoute()
   const { colors } = useTheme()

   const [referencia, setReferencia] = useState([])
   const [produtoEncontrado, setProdutoEncontrado] = useState([])

   const [tamanhoSelecionado, setTamanhoSelecionado] = useState("")

   const [loadPage, setLoadPage] = useState(true)
   const listaDeTamanhos = ["PP", "P", "M", "G", "GG"];

   const [total, setTotal] = useState('')

   useEffect(() => {
      navigation.setOptions({
         title: 'Pedido ' + rota?.ordemDeCompra?.estado + " - " + rota?.ordemDeCompra?.id?.substr(0, 6).toUpperCase(),
      })
   }, [rota, total])

   useEffect(() => {
      BuscaItemDoPedido(rota?.ordemDeCompra?.id)
      setLoadPage(false)
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

   function ItemDaLista({ data }) {

      console.log(data, "data");
      
      return (
         <ContainerItem onpress={() => {
            rota?.ordemDeCompra?.estado === "Aberto" && SubtraiUmItemDoPedido(data.id, data.produto.id, data.quantidade, rota?.ordemDeCompra?.id)
         }}>

            <View style={{ marginVertical: .5, paddingHorizontal: 6, flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', flex: 1 }}>
               <View style={{ flexDirection: 'row', gap: 6, flex: 1, alignItems: 'flex-start' }}>

                  <Texto texto={data.quantidade > 0 ? data.quantidade + 'x' : ''} />
                  <Texto estilo={{ paddingHorizontal: 10, flex: 1 }} tipo={'Light'} texto={`${data.produto?.referencia} - ${data.produto?.nome} ${data.produto?.tamanho} ${data.produto?.cor?.nome} #${data.produto?.valorAtacado}`} />
                  <Texto texto={data.total.toFixed(2).replace('.', ',')} />

               </View>
            </View>
         </ContainerItem>
      )
   }


   function StatusButton(estado) {

      switch (estado) {
         case 'Aberto':
            return {
               icone: 'creditcard',
               texto: 'Pagamento',
               caminho: () => navigation.navigate('FinalizaVenda', { ordemDeCompraID: rota?.ordemDeCompra?.id, total: total }),
            }
         case 'Criado':
            return {
               icone: 'export',
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
         await api.put(`/atualiza/estoque?ordemDeCompraID=${rota?.ordemDeCompra?.id}`, { headers })
         navigation.goBack()
      }
      catch (error) { console.log(error.response) }
   }

   async function CancelarCompra(ordemDeCompraID) {
      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credencial?.token}`
      }

      try {
         await api.delete(`/cancelaCompra?ordemDeCompraID=${ordemDeCompraID}`, { headers })
         await BuscaItemDoPedido(rota?.ordemDeCompra?.id)
         await ListaOrdemDeCompras()
         navigation.goBack()

      } catch (error) {
         console.log(error.response);

      } finally {
         setModalVisible(!modalVisible)
      }
   }


   const HeaderBudget = () => {

      return (
         <View style={{ gap: 12, flexDirection: "row", alignSelf: 'flex-end', justifyContent: "space-between", marginVertical: 30 }}>

            {StatusButton(rota?.ordemDeCompra?.estado)?.caminho && <Pressable onPress={StatusButton(rota?.ordemDeCompra?.estado)?.caminho} style={{
               flexDirection: "row",
               gap: 12,
               alignItems: 'center',
               borderWidth: .7,
               borderColor: '#777',
               padding: 18,
               borderRadius: 6
            }}>
               <AntDesign name={StatusButton(rota?.ordemDeCompra?.estado)?.icone} color='#000' size={20} />
               <Texto texto={StatusButton(rota?.ordemDeCompra?.estado)?.texto} />
            </Pressable>}

            {rota?.ordemDeCompra?.estado !== 'Aberto' && rota?.ordemDeCompra?.estado !== 'Entregue' ? <Pressable onPress={() => setModalVisible(true)} style={{
               flexDirection: "row",
               gap: 12,
               alignItems: 'center',
               borderWidth: .7,
               borderColor: '#777',
               padding: 18,
               borderRadius: 6
            }}>
               <AntDesign name={'delete'} color='#000' size={20} />
            </Pressable> : null}

         </View>
      )
   }

   const converteData = (date) => {
      const data = new Date(date);
      const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      return formatoData.format(data);

   }


   if (loadPage) return <Load />


   return (
      <View style={{ flex: 1 }}>

         {rota?.ordemDeCompra?.estado === 'Aberto' ?
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
                        console.log(item);
                        
                        return (
                           <Pressable onPress={() => AdicionarItemAoPedido({ produtoID: item.id, ordemDeCompraID: rota?.ordemDeCompra?.id })
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
                              <Texto texto={item.cor.nome} tipo={'Regular'} />
                           </Pressable>
                        )
                     }))]}
               </View>

            </View> : null}

         {rota?.ordemDeCompra?.estado !== 'Entregue' ? <View style={{ paddingHorizontal: 18, marginVertical: 12 }}>

            {rota?.ordemDeCompra?.valorAdiantado > 0 ?
               <Texto cor={'#777'} tipo={'Light'} texto={`Entrada: R$ ${parseFloat(rota?.ordemDeCompra?.valorAdiantado).toFixed(2).replace('.', ',')}`} /> : null}

            {rota?.ordemDeCompra?.formaDePagamento === "Cartão de Crédito" || rota?.ordemDeCompra?.tempoDePagamento > 0 ?
               <Texto cor={'#777'} tipo={'Light'} texto={`Parcelado em ${rota?.ordemDeCompra?.tempoDePagamento}x de R$ ${(parseFloat((total - rota?.ordemDeCompra?.valorAdiantado) / rota?.ordemDeCompra?.tempoDePagamento)).toFixed(2).replace('.', ',')}`} /> : null}


            {!!rota?.ordemDeCompra?.observacao ?
               <Texto cor={'#777'} tipo={'Light'} texto={`Obs. ${rota?.ordemDeCompra?.observacao}`} /> : null}

         </View> : null}

         {rota?.ordemDeCompra?.estado !== 'Aberto' ? <View style={{ alignSelf: 'flex-end', paddingHorizontal: 18, marginVertical: 12 }}>
            <Texto cor={'#777'} tipo={'Light'} texto={`Atualizado em ${converteData(rota?.ordemDeCompra?.atualizadoEm)}`} />
         </View> : null}


         <FlatList
            data={itensDoPedido}
            contentContainerStyle={{ borderTopWidth: 1, borderColor: '#ddd', padding: 10 }}
            renderItem={({ item }) => <ItemDaLista data={item} />}
            ListHeaderComponent={load ?
               <View style={{ padding: 6, flexDirection: "row", alignItems: 'center', gap: 12 }}>
                  <ActivityIndicator color={colors.theme} />
                  <Texto texto={'Atualizando'} tipo={'Light'} tamanho={15} />
               </View> :
               <View style={{ padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: 'center' }}>
                  <Texto texto={'Orçamento'} tipo={'Medium'} tamanho={15} />
                  <Texto texto={`Total R$ ${total.replace('.', ',')}`} tipo={'Medium'} tamanho={15} />
               </View>
            }
            ListFooterComponent={itensDoPedido?.length > 0 ? <HeaderBudget /> : null}
         />


         <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}>

            <View style={styles.centeredView}>
               <View style={styles.modalView}>
                  <Text style={{ marginBottom: 12 }}>Cancelar Pedido: {rota?.ordemDeCompra?.id?.substr(0, 6).toUpperCase()}?</Text>

                  <View style={{ flexDirection: "row", gap: 12, marginVertical: 12 }}>

                     <Pressable
                        style={[styles.button, { backgroundColor: colors.theme }]}
                        onPress={() => CancelarCompra(rota?.ordemDeCompra?.id)}>
                        <Text style={styles.textStyle}>Sim, Cancelar</Text>
                     </Pressable>
                     <Pressable
                        style={[styles.button, { backgroundColor: '#fff' }]}
                        onPress={() => setModalVisible(!modalVisible)}>
                        <Text style={{ color: '#222' }}>Desistir</Text>
                     </Pressable>
                  </View>
               </View>
            </View>
         </Modal>

      </View >
   );
}


const styles = StyleSheet.create({
   centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
   },
   modalView: {
      backgroundColor: '#f1f1f1',
      borderRadius: 12,
      padding: 35,
      alignItems: 'center',
      elevation: 12,
   },
   textStyle: { color: '#fff' },
   button: {
      borderRadius: 12,
      padding: 10,
   },

});
import { View, Text, FlatList, Pressable, Keyboard, ActivityIndicator, Modal, StyleSheet } from 'react-native';

import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import AntDesign from 'react-native-vector-icons/AntDesign'

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import Texto from '../../components/Texto';
import ContainerItem from '../../components/ContainerItem';
import Load from '../../components/Load';
import MaskOfInput from '../../components/MaskOfInput';
import Icone from '../../components/Icone';

export default function Orcamento() {
   const navigation = useNavigation()
   const { colors } = useTheme()
   const [modalVisible, setModalVisible] = useState(false);
   const { credencial } = useContext(AppContext)
   const { BuscaItemDoPedido, itensDoPedido, load, AdicionarItemAoPedido, SubtraiUmItemDoPedido, ListaOrdemDeCompras } = useContext(CrudContext)
   const { params: rota } = useRoute()


   const [referencia, setReferencia] = useState([])
   const [produtoEncontrado, setProdutoEncontrado] = useState([])
   const [orcamento, setOrcamento] = useState({})

   const [tamanhoSelecionado, setTamanhoSelecionado] = useState("")

   const [loadPage, setLoadPage] = useState(true)
   const listaDeTamanhos = ["PP", "P", "M", "G", "GG"];


   useEffect(() => {
      Promise.all([BuscaOrdemDecompra(), AtualizaOrdemDecompra()]).then(() => setLoadPage(false))

   }, [itensDoPedido])

   useEffect(() => {
      BuscaItemDoPedido(rota.ordemDeCompraID)
   }, [rota])


   useEffect(() => {
      if (referencia.length === 4) {
         BuscaProduto()
         setTamanhoSelecionado('')

         Keyboard.dismiss()
      } else { setProdutoEncontrado([]) }
   }, [referencia])



   async function BuscaOrdemDecompra() {

      try {
         const res = await api.get(`/busca/ordemDeCompra?ordemDeCompraID=${rota?.ordemDeCompraID}`)
         setOrcamento(res.data)

         const { estado, id } = res.data

         navigation.setOptions({
            title: 'Pedido ' + estado + " - " + id.substr(0, 6).toUpperCase(),
            headerRight: () => (
               <View style={{ flexDirection: 'row', marginRight: -10 }}>

                  <Pressable onPress={StatusButton(res.data?.estado)?.caminho} style={{
                     alignItems: 'center',
                     width: 40,
                     height: 55,
                     alignItems: 'center',
                     justifyContent: "center"
                  }}>
                     <AntDesign name={StatusButton(res.data?.estado)?.icone} color='#fff' size={22} />
                  </Pressable >

                  {estado !== 'Aberto' && estado !== 'Entregue' ?
                     <Icone onpress={() => setModalVisible(true)} nomeDoIcone={'delete'} /> : null}
               </View>
            )
         })


      } catch (error) {
         console.log(error.response);

      }
   }


   async function AtualizaOrdemDecompra() {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credencial?.token}`
      }

      const totalDaNota = itensDoPedido.reduce((acc, current) => {
         return acc + (current.quantidade * current.valorUnitario);
      }, 0);

      try {
         await api.put(`/atualiza/ordemDeCompra?ordemDeCompraID=${orcamento?.id}`, { totalDaNota }, { headers })
         await BuscaOrdemDecompra()

      } catch (error) {
         console.log(error.response);

      }
   }


   // BUSCA O PRODUTO DA REFERENCIA DIGITADA
   async function BuscaProduto() {
      try {
         const res = await api.get(`/busca/produto/referencia?referencia=${referencia}`)
         setProdutoEncontrado(res.data)

      } catch (error) {
         console.log(error.response);

      }
   }

   function ItemDaLista({ data }) {

      const { id, referencia, nome, tamanho, cor, valorAtacado, valorVarejo } = data.produto

      return (
         <ContainerItem onpress={() => {
            orcamento?.estado === "Aberto" && SubtraiUmItemDoPedido(data.id, id, data.quantidade, orcamento?.id)
         }}>

            <View style={{ marginVertical: .5, paddingHorizontal: 6, flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', flex: 1 }}>
               <View style={{ flexDirection: 'row', gap: 6, flex: 1, alignItems: 'flex-start' }}>

                  <Texto texto={data.quantidade > 0 ? data.quantidade + 'x' : ''} />
                  <Texto estilo={{ paddingHorizontal: 10, flex: 1 }} tipo={'Light'} texto={`${referencia} - ${nome} ${tamanho} ${cor?.nome} #${valorAtacado}`} />
                  {/* <Texto texto={data.total.toFixed(2).replace('.', ',')} /> */}

               </View>
            </View>
         </ContainerItem>
      )
   }


   function StatusButton(estado) {

      switch (estado) {
         // case 'Aberto':
         //    return {
         //       icone: 'creditcard',
         //       texto: 'Pagamento',
         //       caminho: () => navigation.navigate('FinalizaVenda', { ordemDeCompraID: orcamento?.id }),
         //    }
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
         await api.put(`/atualiza/estoque?ordemDeCompraID=${orcamento?.id}`, { headers })
         navigation.navigate('HistoricoDeVendas')
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
         await BuscaItemDoPedido(orcamento?.id)
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
         <View style={{ justifyContent: "space-between", padding: 14, alignItems: 'flex-end' }}>


            {load ? <ActivityIndicator color={colors.theme} /> :
               <View style={{ alignItems: "flex-end" }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                     <View style={{ gap: 6, flex: 1, flexDirection: 'row', alignItems: "center", gap: 6 }}>
                        <AntDesign name='sync' />
                        <Texto estilo={{ flex: 1 }} tipo={'Light'} texto={`${converteData(orcamento?.atualizadoEm)}`} />
                     </View>

                     <Texto texto={`Total R$ ${parseFloat(orcamento?.totalDaNota).toFixed(2).replace('.', ',')}`} tipo={'Light'} />
                  </View>

                  {!!orcamento?.tempoDePagamento || !!orcamento?.desconto || !!orcamento?.valorAdiantado ?
                     <View>
                        <Texto
                           texto={!!orcamento?.tempoDePagamento ? `${orcamento?.tempoDePagamento}x R$ ${(parseFloat((orcamento?.totalDaNota - orcamento?.valorAdiantado) / orcamento?.tempoDePagamento)).toFixed(2).replace('.', ',')}` || `R$ ${((orcamento?.totalDaNota - orcamento?.valorAdiantado) * (1 - orcamento?.desconto / 100)).toFixed(2).replace('.', ',')}` : ` ${orcamento?.desconto}% à vista: R$ ${((orcamento?.totalDaNota - orcamento?.valorAdiantado) * (1 - orcamento?.desconto / 100)).toFixed(2).replace('.', ',')}`}
                           tipo={'Regular'}
                           tamanho={15}
                        />
                     </View> : null
                  }

                  {credencial.cargo === 'Socio' && orcamento?.estado !== "Entregue" &&
                     <Pressable style={{ paddingVertical: 6 }} onPress={() => navigation.navigate('FinalizaVenda', { ordemDeCompraID: rota.ordemDeCompraID })}>
                        <Texto texto={'Condições de Pagamento'} />
                     </Pressable>}

               </View>
            }
         </View>
      )
   }

   const converteData = (date) => {
      const data = new Date(date);
      const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      return formatoData?.format(data);

   }


   if (loadPage) return <Load />


   return (
      <View style={{ flex: 1 }}>

         {orcamento?.estado === 'Aberto' ?
            <View style={{ gap: 6, padding: 10 }}>

               <MaskOfInput title={produtoEncontrado[0]?.nome || 'Informe uma Referência'} value={referencia} setValue={setReferencia} maxlength={4} type='numeric' />

               <View style={{ flexDirection: "row", gap: 6 }}>

                  {listaDeTamanhos.map((tamanho, index) => {
                     const tamanhoExiste = [...new Set(produtoEncontrado.filter(item => (item.estoque - (item.reservado + item.saida)) > 0).map(item => item.tamanho))]
                     return (
                        <Pressable disabled={!tamanhoExiste.includes(tamanho)} onPress={() => setTamanhoSelecionado(tamanho)} key={index}
                           style={{
                              display: tamanhoExiste.includes(tamanho) ? 'flex' : 'none',
                              width: 40,
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
                           <Pressable disabled={load} onPress={() => AdicionarItemAoPedido({ produtoID: item.id, ordemDeCompraID: orcamento?.id })
                           } key={index}
                              style={{
                                 alignItems: "center",
                                 justifyContent: "center",
                                 borderRadius: 12,
                                 borderColor: '#777',
                                 borderWidth: .7,
                                 height: 40,
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

         {orcamento?.estado !== 'Entregue' ? <View style={{ paddingHorizontal: 18, marginVertical: 12 }}>

            {!!orcamento?.observacao ?
               <Texto cor={'#777'} tipo={'Light'} texto={`Obs. ${orcamento?.observacao}`} /> : null}

         </View> : null}



         <FlatList
            data={itensDoPedido}
            contentContainerStyle={{ padding: 10 }}
            renderItem={({ item }) => <ItemDaLista data={item} />}
            ListFooterComponent={itensDoPedido?.length > 0 ? <HeaderBudget /> : null}
         />


         <Modal
            animationType="none"
            transparent={true}
            visible={modalVisible}>

            <View style={styles.centeredView}>
               <View style={styles.modalView}>
                  <Text style={{ marginBottom: 12 }}>Cancelar Pedido: {orcamento?.id?.substr(0, 6).toUpperCase()}?</Text>

                  <View style={{ flexDirection: "row", gap: 12, marginVertical: 12 }}>

                     <Pressable
                        style={[styles.button, { backgroundColor: colors.theme }]}
                        onPress={() => CancelarCompra(orcamento?.id)}>
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
import { View, Text, FlatList, Pressable, Keyboard, ActivityIndicator, Modal, StyleSheet, BackHandler, Alert } from 'react-native';

import { useRoute, useNavigation, useTheme, CommonActions } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import { CredencialContext } from '../../contexts/credencialContext';

import api from '../../services/api';

import Texto from '../../components/Texto';
import Load from '../../components/Load';
import MaskOfInput from '../../components/MaskOfInput';
import Icone from '../../components/Icone';

import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Topo from '../../components/Topo';


export default function CriaOrcamento() {
   const { colors } = useTheme()
   const { credencial } = useContext(CredencialContext)
   const { listaDeTamanhos, Toast } = useContext(AppContext)

   const { FecharNota, load } = useContext(CrudContext)

   const navigation = useNavigation()
   const { params: rota } = useRoute()

   const [modalVisible, setModalVisible] = useState(false);
   const [referencia, setReferencia] = useState([])
   const [produtoEncontrado, setProdutoEncontrado] = useState([])
   const [orcamento, setOrcamento] = useState([])
   const [tamanhoSelecionado, setTamanhoSelecionado] = useState("")
   const [loadPage, setLoadPage] = useState(true)

   const [itensNoPedido, setItensNoPedido] = useState([]);
   const tipoC = orcamento?.tipo?.substr(0, 1)


   useEffect(() => {

      const backHandler = BackHandler.addEventListener(
         'hardwareBackPress',
         backAction,
      );

      return () => backHandler.remove();
   }, []);

   
   
   useEffect(() => {
      BuscaOrdemDecompra()

      if (referencia.length === 4) {
         BuscaProduto()
         setTamanhoSelecionado('')
         Keyboard.dismiss()

      } else { setProdutoEncontrado([]) }
   }, [referencia])



   const backAction = () => {
      itensNoPedido.length > 0 ?
         Alert.alert('', 'Pedido não finalizado! Saindo, será excluído. Finalize em CONDIÇÕES.', [
            {
               text: 'Voltar',
               onPress: () => null,
               style: 'cancel',
            },
            { text: 'Sair', onPress: () => navigation.goBack() },
         ]) : navigation.goBack()
      return true;
   };

   const acaoExcluir = () => {
      Alert.alert('', `Deseja excluir pedido: ${tipoC}-${orcamento?.id?.slice(0, 6).toUpperCase()} ?`, [
         { text: 'Excluir', onPress: () => CancelarCompra(orcamento?.id) },
         {
            text: 'Cancelar',
            onPress: () => null,
            style: 'cancel',
         },
      ]);
      return true;
   };


   async function BuscaOrdemDecompra() {
      try {
         const res = await api.get(`/busca/ordemDeCompra?ordemDeCompraID=${rota?.ordemDeCompraID}`)
         setOrcamento(res.data)

      } catch (error) {
         console.log(error.response);

      } finally {
         setLoadPage(false)

      }
   }



   // BUSCA O PRODUTO DA REFERENCIA DIGITADA
   async function BuscaProduto() {
      try {
         const res = await api.get(`/busca/produto/referencia?referencia=${referencia}`)
         setProdutoEncontrado(res.data)

      } catch (error) {
         console.log(error.response)
      }
   }



   async function CancelarCompra(ordemDeCompraID) {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credencial?.token}`
      }

      try {

         await api.delete(`/cancelaCompra?ordemDeCompraID=${ordemDeCompraID}`, { headers })
         await api.delete(`/deleta/ordemDeCompra?ordemDeCompraID=${ordemDeCompraID}`, { headers })
         navigation.navigate('Home')

      } catch (error) {
         console.log(error.response);

      } finally {
         setModalVisible(!modalVisible)

      }
   }



   const SomaItem = ({ produto, ordemDeCompraID }) => {

      const itemExistente = itensNoPedido.find((item) => item.produto === produto);

      if (itemExistente) {

         const novaQuantidade = itemExistente.quantidade + 1;

         setItensNoPedido((prevItens) =>
            prevItens.map((item) =>
               item.produto === produto ? { ...item, quantidade: novaQuantidade } : item
            )
         );

      } else {
         setItensNoPedido((prevItens) => [...prevItens, { produto, ordemDeCompraID, quantidade: 1 }]);

      }
   };



   const SubtraiUmItemDoPedido = ({ produto }) => {

      const itemExistente = itensNoPedido.find((item) => item.produto.id === produto.id);

      if (itemExistente) {

         const novaQuantidade = itemExistente.quantidade - 1;

         if (novaQuantidade > 0) {
            setItensNoPedido((prevItens) =>
               prevItens.map((item) =>
                  item.produto.id === produto.id ? { ...item, quantidade: novaQuantidade } : item
               )
            );

         } else {
            setItensNoPedido((prevItens) => prevItens.filter((item) => item.produto.id !== produto.id));

         }
      }
   };


   function ItemDaLista({ data }) {


      return (
         <View>
            <View style={{ flexDirection: 'row', alignItems: "center" }}>

               <View style={{ backgroundColor: colors.detalhe, marginRight: 10, borderRadius: 10, paddingHorizontal: 6 }}>
                  <Texto tamanho={12} texto={`${data.produto?.referencia} `} tipo='Light' cor='#fff' />
               </View>

               <Texto estilo={{ flex: 1, paddingHorizontal: 6 }} tipo={'Light'} texto={`${data.produto?.nome} T. ${data.produto?.tamanho} ${data.produto?.cor?.nome} #${tipoC === 'A' ? data.produto?.valorAtacado : data.produto?.valorVarejo}`} />

               <View style={{ flexDirection: 'row', alignItems: "center" }}>

                  <Pressable style={[styles.btnQtd]}
                     onPress={() => SubtraiUmItemDoPedido({ produto: data.produto, quantidade: data.quantidade, orcamentoID: orcamento?.id })}>
                     <Texto texto='-' />
                  </Pressable>

                  <Texto estilo={{ width: 26, textAlign: 'center' }} texto={data.quantidade} />

                  <Pressable style={[styles.btnQtd]}
                     disabled={data.quantidade >= (data.produto.estoque - data.produto.saida)}
                     onPress={() => SomaItem({ produto: data.produto, ordemDeCompraID: orcamento?.id })}>
                     <Texto texto='+' />
                  </Pressable>

               </View>
            </View>
         </View>
      )
   }



   const calcularTotal = () => {
      const getValor = (item) => {
         const valorString = tipoC === 'A' ? item.produto.valorAtacado : item.produto.valorVarejo;
         return parseFloat(valorString.replace(',', '.'));
      };

      const getSubtotal = (item) => getValor(item) * item.quantidade;

      return itensNoPedido.reduce((total, item) => total + getSubtotal(item), 0);
   };



   const HeaderBudget = () => {

      let totalQuantidade = 0;
      itensNoPedido.forEach(item => totalQuantidade += item.quantidade);

      return (
         <View style={{ marginVertical: 20 }}>
            {load ? <ActivityIndicator color={colors.theme} /> :
               <View style={{ alignItems: "flex-end", borderTopWidth: 1, borderColor: '#e9e9e9', padding: 10 }}>

                  {!!orcamento?.desconto || !!orcamento?.tempoDePagamento ? <Texto texto={`Valor da Nota: R$ ${parseFloat(calcularTotal()).toFixed(2)}`} tipo={'Light'} /> : null}
                  {!!orcamento?.desconto ? <Texto tipo='Light' texto={`Desconto de ${orcamento?.desconto}%: -R$ ${parseFloat(!!orcamento?.desconto ? calcularTotal() * (orcamento?.desconto / 100) : calcularTotal()).toFixed(2)}`} /> : null}
                  {!!orcamento?.valorAdiantado ? <Texto tipo='Light' texto={`Adiantamento: R$ ${parseFloat(orcamento?.valorAdiantado).toFixed(2)}`} /> : null}
                  {!!orcamento?.tempoDePagamento ? <Texto tipo='Light' texto={`Parcelado em ${orcamento?.tempoDePagamento}x R$ ${parseFloat(!!orcamento?.tempoDePagamento ? (calcularTotal() - orcamento?.valorAdiantado) / orcamento?.tempoDePagamento : calcularTotal()).toFixed(2)}`} /> : null}
                  <Texto tipo='Light' texto={`Total de itens: ${totalQuantidade}`} />
                  <Texto estilo={{ marginTop: 12 }} texto={`Total a pagar: R$ ${parseFloat(!!orcamento?.desconto || !!orcamento?.valorAdiantado ? (calcularTotal() - orcamento?.valorAdiantado) - (calcularTotal() * (orcamento?.desconto / 100)) : calcularTotal()).toFixed(2)}`} />

               </View>
            }
         </View>
      )
   }

   if (loadPage) return <Load />

   const getIconeProps = (label, iconName, onPress, disabled = false) => {
      return {
         label,
         tamanhoDoIcone: 18,
         onpress: onPress,
         nomeDoIcone: iconName,
         corDoIcone: '#fff',
         disabled,
      };
   };

   return (
      <>
         <Topo
            posicao='left'
            iconeLeft={{ nome: 'arrow-back-outline', acao: () => backAction() }}
            titulo={`Pedido ${orcamento?.estado}  ${tipoC}-${orcamento?.id.substr(0, 6).toUpperCase()}`} >
            <Animated.View entering={FadeInUp.duration(400).delay(300)}
               style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  gap: 6,
                  backgroundColor: colors.theme,
               }}
            >
               {orcamento?.estado !== 'Entregue' && orcamento?.estado !== 'Processando' && (
                  <Icone
                     {...getIconeProps(
                        'CONDIÇÕES',
                        'wallet-outline',
                        async () => {
                           await FecharNota(itensNoPedido);

                           navigation.dispatch(
                              CommonActions.reset({
                                 index: 1,
                                 routes: [
                                    // { name: 'Home' },
                                    {
                                       name: 'FinalizaVenda',
                                       params: {
                                          ordemDeCompraID: rota.ordemDeCompraID,
                                          total: calcularTotal(),
                                       },
                                    },
                                 ],
                              })
                           )



                        },
                        !itensNoPedido.length > 0
                     )}
                  />
               )}

               {orcamento?.estado !== 'Aberto' && (
                  <Icone {...getIconeProps('PDF', 'share-social-outline', gerarPDF)} />
               )}

               {orcamento?.estado !== 'Aberto' && orcamento?.estado !== 'Entregue' && (
                  <Icone {...getIconeProps('STATUS', 'arrow-redo-outline', AtualizaEstoque)} />
               )}

               {orcamento?.estado !== 'Entregue' && (
                  <Icone {...getIconeProps('EXCLUIR', 'trash-outline', () => acaoExcluir())} />
               )}
            </Animated.View>
         </Topo>

         <FlatList
            ListHeaderComponent={
               <View style={{ marginVertical: 14 }}>
                  {orcamento?.estado !== 'Entregue' ?
                     <View style={{ marginBottom: 18, gap: 12 }}>
                        <View>
                           <MaskOfInput title={produtoEncontrado[0]?.nome || 'Informe uma Referência'} value={referencia} setValue={setReferencia} maxlength={4} type='numeric' />
                        </View>

                        <View style={{ flexDirection: "row", gap: 6, }}>
                           {listaDeTamanhos.map((tamanho, index) => {
                              const tamanhoExiste = [...new Set(produtoEncontrado
                                 .filter(item => (item?.estoque - (item?.reservado + item?.saida)) > 0)
                                 .map(item => item.tamanho))]
                              if (!tamanhoExiste) return
                              return (
                                 <Pressable disabled={!tamanhoExiste.includes(tamanho)} onPress={() => setTamanhoSelecionado(tamanho)} key={index}
                                    style={{
                                       display: tamanhoExiste.includes(tamanho) ? 'flex' : 'none',
                                       width: 40,
                                       aspectRatio: 1,
                                       alignItems: "center",
                                       justifyContent: "center",
                                       backgroundColor: colors.fundo,
                                       elevation: 5,
                                       opacity: .7,
                                       borderRadius: 12,
                                    }}>
                                    <Texto texto={tamanho} tipo='Medium' cor='#222' />
                                 </Pressable>
                              )
                           })}

                        </View>

                        <FlatList
                           horizontal
                           ItemSeparatorComponent={<View style={{ marginHorizontal: 3 }} />}
                           contentContainerStyle={{ paddingHorizontal: 2 }}
                           data={[...new Set(produtoEncontrado?.filter(item => item.tamanho === tamanhoSelecionado)
                              .filter(item => item.estoque > (item.reservado + item.saida)))]}
                           renderItem={({ item, index }) => {

                              return (
                                 <Pressable disabled={load} onPress={() => SomaItem({ produto: item, ordemDeCompraID: orcamento?.id })
                                 } key={index}
                                    style={{
                                       alignItems: "center",
                                       justifyContent: "center",
                                       borderRadius: 12,
                                       height: 40,
                                       backgroundColor: colors.fundo,
                                       elevation: 5,
                                       opacity: .7,
                                       paddingHorizontal: 12,
                                       marginVertical: 12,
                                    }}>

                                    <View style={{ position: "absolute", right: 6, top: -6, paddingHorizontal: 6, backgroundColor: colors.background, borderRadius: 6 }}>
                                       <Texto texto={item?.estoque - (item?.reservado + item?.saida)} tipo={'Light'} tamanho={10} />
                                    </View>
                                    <Texto texto={item?.cor?.nome} tipo={'Regular'} />
                                 </Pressable>
                              )
                           }}
                        />
                     </View> : null}

                  {orcamento?.estado !== 'Entregue' && !!orcamento?.observacao ? <View style={{ marginVertical: 12 }}>

                     {!!orcamento?.observacao ?
                        <Texto texto={`Obs. ${orcamento?.observacao}`} /> : null}

                  </View> : null}
               </View>
            }
            data={itensNoPedido}
            ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 12 }} />}
            contentContainerStyle={{ paddingHorizontal: 14, }}
            renderItem={({ item }) => <ItemDaLista data={item} />}
            ListFooterComponent={itensNoPedido?.length > 0 ? <HeaderBudget /> : null}
         />

      </>
   );
}

const styles = StyleSheet.create({

   btnQtd: {
      elevation: 3,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: 'center',
      width: 25,
      height: 40,
      backgroundColor: '#fff'
   }
});

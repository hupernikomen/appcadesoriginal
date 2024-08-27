import { View, Text, FlatList, Pressable, Keyboard, ActivityIndicator, Modal, StyleSheet, ScrollView, TextBase } from 'react-native';

import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';

import api from '../../services/api';

import Texto from '../../components/Texto';
import ContainerItem from '../../components/ContainerItem';
import Load from '../../components/Load';
import MaskOfInput from '../../components/MaskOfInput';
import Icone from '../../components/Icone';

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import Topo from '../../components/Topo';


export default function Orcamento() {
   const { colors } = useTheme()
   const { credencial, listaDeTamanhos } = useContext(AppContext)
   const { BuscaItemDoPedido, itensDoPedido, load, AdicionarItemAoPedido, SubtraiUmItemDoPedido, ListaOrdemDeCompras } = useContext(CrudContext)

   const navigation = useNavigation()
   const { params: rota } = useRoute()

   const [modalVisible, setModalVisible] = useState(false);
   const [referencia, setReferencia] = useState([])
   const [produtoEncontrado, setProdutoEncontrado] = useState([])
   const [orcamento, setOrcamento] = useState([])
   const [tamanhoSelecionado, setTamanhoSelecionado] = useState("")
   const [loadPage, setLoadPage] = useState(true)

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

   const tipoC = orcamento?.tipo?.substr(0, 1)


   async function BuscaOrdemDecompra() {
      try {
         const res = await api.get(`/busca/ordemDeCompra?ordemDeCompraID=${rota?.ordemDeCompraID}`)
         setOrcamento(res.data)

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
         console.log(error.response)
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


   const gerarPDF = async () => {

      const options = {
         html: htmlDoc,
         fileName: 'CadesOriginal_',
      };

      const file = await RNHTMLtoPDF.convert(options);
      const shareOptions = {
         message: 'Compartilhar PDF',
         url: `file://${file.filePath}`,
         subject: 'PDF gerado',
      };

      try {
         await Share.open(shareOptions);
      } catch (error) {
         if (error.code === 'E_SHARE_CANCELLED') {
            console.log('Usuário cancelou o compartilhamento');
         } else {
            console.log('Erro ao compartilhar PDF:', error);
         }
      }
   };


   const htmlDoc = `
<div style="display: flex; flex-direction: column; padding: 30px">
  <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; margin-bottom: 20px">
    <div style="display: flex; align-self: center; font-size: 1em; font-weight: 600;">Cades Original</div>
    <div style="display: flex; align-self: center; font-weight: 300; font-size: 13px;">Rua Lourival Mesquita, 3328 - Santa Maria da Codipe - Teresina - Piaui</div>
    <div style="display: flex; align-self: center; font-weight: 300; font-size: 13px;">CNPJ: 15.302.980/0001-54 - Contato: (86) 99491-8984</div>
  </div>

  <div style="display: flex; align-self: center; font-weight: 400; padding: 20px;">Ordem de Compra nº ${tipoC}-${orcamento?.id.slice(0, 6).toUpperCase()}</div>

  <div style="border-color: #eee; border-bottom: 1px solid #eee; padding: 10px;">

    <div style="font-size: 13px; display: flex; justify-content: space-between;">
      <div style="display: flex; gap: 6px;">Cliente: <div style="font-weight: 300;">${orcamento?.cliente?.nome}</div></div>
      <div style="display: flex; gap: 6px;">Data Nasc.: <div style="font-weight: 300;">${orcamento?.cliente?.dataNascimento}</div></div>
      <div style="display: flex; gap: 6px;">CPF/CNPJ: <div style="font-weight: 300;">${orcamento?.cliente?.cpf_cnpj}</div></div>
    </div>
    <div style="font-size: 13px; display: flex; gap: 6px;">Contato: <div style="font-weight: 300;">${orcamento?.cliente?.whatsapp}</div></div>
    <div style="font-size: 13px; display: flex; gap: 6px;">Endereço: <div style="font-weight: 300;">${orcamento?.cliente?.endereco} - ${orcamento?.cliente?.bairro} - ${orcamento?.cliente?.cidade} - ${orcamento?.cliente?.estado} - CEP: ${orcamento?.cliente?.CEP}</div></div>
  </div>

  <div style="padding: 10px; border-color: #eee; border-bottom: 1px solid #eee;">

    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="flex: 1; font-size: 13px">Qtd.</div>
      <div style="flex: 1; font-size: 13px">Ref.</div>
      <div style="flex: 7; font-size: 13px">Descrição</div>
      <div style="flex: 1; font-size: 13px">Tam.</div>
      <div style="flex: 3; font-size: 13px">Cor</div>
      <div style="flex: 1; font-size: 13px">Unid.</div>
      <div style="flex: 1; text-align: end; font-size: 13px">Total</div>
    </div>

           ${orcamento?.itemDoPedido?.map((item, index) => {

      return (
         `<div key={index} style="display: flex; align-items: center; justify-content: space-between">

              <div style="flex: 1; font-weight: 300; font-size: 13px">${item?.quantidade}</div>
              <div style="flex: 1; font-weight: 300; font-size: 13px">${item?.produto?.referencia}</div>
              <div style="flex: 7; font-weight: 300; font-size: 13px">${item?.produto?.nome}</div>
              <div style="flex: 1; font-weight: 300; font-size: 13px">${item?.produto?.tamanho}</div>
              <div style="flex: 3; font-weight: 300; font-size: 13px">${item?.produto?.cor?.nome}</div>
              <div style="flex: 1; font-weight: 300; font-size: 13px">${parseFloat(item?.valorUnitario).toFixed(2)}</div>
              <div style="flex: 1; text-align: end; font-weight: 300; font-size: 13px">${parseFloat(item?.quantidade * item?.valorUnitario).toFixed(2)}</div>
            </div>`
      )
   }).join("")}
      </div>

      <div style=" margin-top: 20px; flex-direction: row; display: flex; justify-content: space-between ">
        <div style="padding-left: 10px; color: '#333' ">

          <div style="font-size: 10px; font-weight: 500; marginBottom: 6 ">Atenção</div>
          <div style="font-size: 10px; font-weight: 300 ">* Não aceitamos cheque</div>
          <div style="font-size: 10px; font-weight: 300 ">* Confira a nota na entrega não aceitaremos reclamações posteriores</div>
        </div>

        <div style="align-items: end; display: flex; flex-direction: column; padding-right: 10px">
          <div style="font-weight: 300; display: flex; font-size: 13px; text-align: end ">Valor da Nota:
            <div style="width: 80px">R$ ${parseFloat(orcamento?.totalDaNota).toFixed(2)}</div>
          </div>

          ${!!orcamento?.desconto ? `<div style="font-weight: 300; display: flex; font-size: 13px; text-align: end ">Desconto de ${orcamento?.desconto}%
            <div style="width: 80px ">-R$ ${parseFloat(!!orcamento?.desconto ? orcamento?.totalDaNota * (orcamento?.desconto / 100) : orcamento?.totalDaNota).toFixed(2)}</div>
          </div>` : ''}

          ${!!orcamento?.valorAdiantado ? `<div style="font-weight: 300; display: flex; font-size: 13px; text-align: end">Adiantamento:
            <div style="width: 80px">R$ ${parseFloat(orcamento?.valorAdiantado).toFixed(2)}</div>
          </div>` : ''}

          ${!!orcamento?.tempoDePagamento ? `<div style="font-weight: 300; display: flex; font-size: 13px; text-align: end ">Parcelado em ${orcamento?.tempoDePagamento}x
            <div style="width: 80px ">R$ ${parseFloat(!!orcamento?.tempoDePagamento ? (orcamento?.totalDaNota - orcamento?.valorAdiantado) / orcamento?.tempoDePagamento : orcamento?.totalDaNota).toFixed(2)}</div>
          </div>` : ''}

          <div style="font-size: 13px; display: flex; text-align: end; margin-top:10px ">Total a pagar:
            <div style="width: 80px ">R$ ${parseFloat(!!orcamento?.desconto || !!orcamento?.valorAdiantado ? (orcamento?.totalDaNota - orcamento?.valorAdiantado) - (orcamento?.totalDaNota * (orcamento?.desconto / 100)) : orcamento?.totalDaNota).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  `


  
  function ItemDaLista({ data }) {

   const { id, referencia, nome, tamanho, cor, valorAtacado, valorVarejo } = data.produto

   return (
      <ContainerItem altura={50}>
         <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', flex: 1 }}>

            <Texto texto={`${referencia} `} tipo='Light' />
            <Texto estilo={{ flex: 1, paddingHorizontal: 6 }} tipo={'Light'} texto={`${nome} T. ${tamanho} ${cor?.nome} #${parseFloat(tipoC === 'A' ? valorAtacado : valorVarejo).toFixed(2)}`} />

            <View style={{ flexDirection: 'row', alignItems: "center" }}>

               <Pressable disabled={orcamento?.estado !== "Aberto"} style={[styles.btnQtd, { opacity: orcamento?.estado === 'Aberto' ? .7 : .5 }]}
                  onPress={() => orcamento?.estado === "Aberto" && SubtraiUmItemDoPedido(data.id, id, data.quantidade, orcamento?.id)}>
                  <Texto texto='-' />
               </Pressable>

               <Texto estilo={{ width: 20, textAlign: 'center' }} texto={data.quantidade} />

               <Pressable disabled={orcamento?.estado !== "Aberto"} style={[styles.btnQtd, { opacity: orcamento?.estado === 'Aberto' ? .7 : .5 }]}
                  onPress={() => AdicionarItemAoPedido({ produtoID: data.produto?.id, ordemDeCompraID: orcamento?.id })}>
                  <Texto texto='+' />
               </Pressable>

            </View>
         </View>
      </ContainerItem>
   )
}


const HeaderBudget = () => {

   return (
      <View style={{ marginTop: 20 }}>
         {load ? <ActivityIndicator color={colors.theme} /> :
            <View style={{ alignItems: "flex-end", borderTopWidth: 1, borderColor: '#e9e9e9', padding: 10 }}>

               {!!orcamento?.desconto || !!orcamento?.tempoDePagamento ? <Texto texto={`Valor da Nota: R$ ${parseFloat(orcamento?.totalDaNota).toFixed(2)}`} tipo={'Light'} /> : null}
               {!!orcamento?.desconto ? <Texto tipo='Light' texto={`Desconto de ${orcamento?.desconto}%: -R$ ${parseFloat(!!orcamento?.desconto ? orcamento?.totalDaNota * (orcamento?.desconto / 100) : orcamento?.totalDaNota).toFixed(2)}`} /> : null}
               {!!orcamento?.valorAdiantado ? <Texto tipo='Light' texto={`Adiantamento: R$ ${parseFloat(orcamento?.valorAdiantado).toFixed(2)}`} /> : null}
               {!!orcamento?.tempoDePagamento ? <Texto tipo='Light' texto={`Parcelado em ${orcamento?.tempoDePagamento}x R$ ${parseFloat(!!orcamento?.tempoDePagamento ? (orcamento?.totalDaNota - orcamento?.valorAdiantado) / orcamento?.tempoDePagamento : orcamento?.totalDaNota).toFixed(2)}`} /> : null}
               <Texto estilo={{ marginTop: 12 }} texto={`Total a pagar: R$ ${parseFloat(!!orcamento?.desconto || !!orcamento?.valorAdiantado ? (orcamento?.totalDaNota - orcamento?.valorAdiantado) - (orcamento?.totalDaNota * (orcamento?.desconto / 100)) : orcamento?.totalDaNota).toFixed(2)}`} />

            </View>
         }
      </View>
   )
}

if (loadPage) return <Load />

   return (
      <>
         <Topo
            posicao='left'
            iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
            titulo={`Pedido ${orcamento?.estado}  ${tipoC}-${orcamento?.id.substr(0, 6).toUpperCase()}`} >

            <View
               style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  gap: 6,
                  backgroundColor: '#292929',
               }}
            >
               {orcamento?.estado !== 'Entregue' && orcamento?.estado !== 'Criado' && (
                  <Icone
                     disabled={!itensDoPedido.length > 0}
                     label="CONDIÇÕES"
                     tamanhoDoIcone={18}
                     onpress={() =>
                        navigation.navigate('FinalizaVenda', {
                           ordemDeCompraID: rota.ordemDeCompraID,
                        })
                     }
                     nomeDoIcone={'wallet-outline'}
                     corDoIcone="#fff"
                  />
               )}

               {orcamento?.estado !== 'Aberto' && (
                  <Icone
                     label="PDF"
                     tamanhoDoIcone={18}
                     onpress={gerarPDF}
                     nomeDoIcone={'share-social-outline'}
                     corDoIcone="#fff"
                  />
               )}

               {orcamento?.estado !== 'Aberto' && orcamento?.estado !== 'Entregue' && (
                  <Icone
                     label="STATUS"
                     tamanhoDoIcone={18}
                     onpress={StateBudget}
                     nomeDoIcone={'arrow-redo-outline'}
                     corDoIcone="#fff"
                  />
               )}

               {orcamento?.estado !== 'Entregue' && (
                  <Icone
                     label="EXCLUIR"
                     tamanhoDoIcone={18}
                     onpress={() => setModalVisible(true)}
                     nomeDoIcone={'trash-outline'}
                     corDoIcone="#fff"
                  />
               )}
            </View>
         </Topo>

         {orcamento?.estado === 'Aberto' ?
            <View style={{  }}>
               <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                  <MaskOfInput title={produtoEncontrado[0]?.nome || 'Informe uma Referência'} value={referencia} setValue={setReferencia} maxlength={4} type='numeric' />
               </View>

               <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 14 }}>
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
                              backgroundColor: colors.detail2,
                              elevation: 6,
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
                  contentContainerStyle={{ paddingHorizontal: 14 }}
                  data={[...new Set(produtoEncontrado?.filter(item => item.tamanho === tamanhoSelecionado)
                     .filter(item => item.estoque > (item.reservado + item.saida)))]}
                  renderItem={({ item, index }) => {
                     return (
                        <Pressable disabled={load} onPress={() => AdicionarItemAoPedido({ produtoID: item.id, ordemDeCompraID: orcamento?.id })
                        } key={index}
                           style={{
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 12,
                              height: 40,
                              backgroundColor: '#FFF3E0',
                              elevation: 6,
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


         {orcamento?.estado !== 'Entregue' && !!orcamento?.observacao ? <View style={{ paddingHorizontal: 18, marginVertical: 12 }}>

            {!!orcamento?.observacao ?
               <Texto cor={'#777'} tipo={'Light'} texto={`Obs. ${orcamento?.observacao}`} /> : null}

         </View> : null}

         <FlatList
            data={itensDoPedido}
            contentContainerStyle={{ padding: 14 }}
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
      </>
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
   btnQtd: {
      elevation: 3,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: 'center',
      width: 25,
      height: 30,
      backgroundColor: '#fff'
   }
});

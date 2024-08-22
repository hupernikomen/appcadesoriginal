import { View, Text, FlatList, Pressable, Keyboard, ActivityIndicator, Modal, StyleSheet, ScrollView } from 'react-native';

import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import api from '../../services/api';

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import Texto from '../../components/Texto';
import ContainerItem from '../../components/ContainerItem';
import Load from '../../components/Load';
import MaskOfInput from '../../components/MaskOfInput';
import Icone from '../../components/Icone';


import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

export default function Orcamento() {
   const navigation = useNavigation()
   const { colors } = useTheme()
   const [modalVisible, setModalVisible] = useState(false);
   const { credencial } = useContext(AppContext)
   const { BuscaItemDoPedido, itensDoPedido, load, AdicionarItemAoPedido, SubtraiUmItemDoPedido, ListaOrdemDeCompras } = useContext(CrudContext)
   const { params: rota } = useRoute()


   const [referencia, setReferencia] = useState([])
   const [produtoEncontrado, setProdutoEncontrado] = useState([])
   const [orcamento, setOrcamento] = useState([])

   const [tamanhoSelecionado, setTamanhoSelecionado] = useState("")

   const [loadPage, setLoadPage] = useState(true)
   const listaDeTamanhos = ["PP", "P", "M", "G", "GG", "G1", "G2", "G3", "G4", "G5", "2", "4", "6", "8", "10", "12", "14"];



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
         <ContainerItem altura={55} onpress={() => {
            orcamento?.estado === "Aberto" && SubtraiUmItemDoPedido(data.id, id, data.quantidade, orcamento?.id)
         }}>

            <View style={{ marginVertical: .5, paddingHorizontal: 6, flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', flex: 1 }}>
               <View style={{ flexDirection: 'row', gap: 6, flex: 1, alignItems: 'flex-start' }}>

                  <Texto texto={data.quantidade > 0 ? data.quantidade + 'x' : ''} />
                  <Texto estilo={{ paddingHorizontal: 10, flex: 1 }} tipo={'Light'} texto={`${referencia} - ${nome} ${tamanho} ${cor?.nome} #${orcamento.tipo === 'Atacado' ? valorAtacado : valorVarejo}`} />

               </View>
            </View>
         </ContainerItem>
      )
   }


   function StatusButton(estado) {

      switch (estado) {
         case 'Criado':
            return {
               icone: 'like2',
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
            console.log('Usuário cancelou a compartilhagem');
         } else {
            console.log('Erro ao compartilhar PDF:', error);
         }
      }

   };

   const HeaderBudget = () => {

      return (
         <View style={{ marginTop: 30 }}>

            {load ? <ActivityIndicator color={colors.theme} /> :
               <View style={{ alignItems: "flex-end",  borderTopWidth: 1, borderColor: '#e9e9e9',padding:10 }}>
                  {!!orcamento?.desconto || !!orcamento?.tempoDePagamento ? <Texto texto={`Valor da Nota: R$ ${parseFloat(orcamento?.totalDaNota).toFixed(2)}`} tipo={'Light'} />: null}

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


   const htmlDoc = `
<div style="display: flex; flex-direction: column; padding: 30px">
  <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; margin-bottom: 20px">
    <div style="display: flex; align-self: center; font-size: 1em; font-weight: 600;">Cades Original</div>
    <div style="display: flex; align-self: center; font-weight: 300; font-size: 13px;">Rua Lourival Mesquita, 3328 - Santa Maria da Codipe - Teresina - Piaui</div>
    <div style="display: flex; align-self: center; font-weight: 300; font-size: 13px;">CNPJ: 15.302.980/0001-54 - Contato: (86) 99491-8984</div>
  </div>

  <div style="display: flex; align-self: center; font-weight: 400; padding: 20px;">Ordem de Compra nº ${orcamento?.id.slice(0, 6).toUpperCase()} - ${orcamento?.tipo}</div>

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

   return (
      <View style={{ flex: 1 }}>

         {orcamento?.estado === 'Aberto' ?
            <View style={{ gap: 6 }}>
               <View style={{ padding: 10 }}>
                  <MaskOfInput title={produtoEncontrado[0]?.nome || 'Informe uma Referência'} value={referencia} setValue={setReferencia} maxlength={4} type='numeric' />
               </View>

               <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 12 }}>
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
                              borderWidth: 1,
                           }}>
                           <Texto texto={tamanho} cor={tamanhoSelecionado === tamanho ? colors.theme : "#222"} />
                        </Pressable>
                     )
                  })}

               </View>

               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row", marginHorizontal: 6, paddingHorizontal: 6 }}>
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
                                 marginRight: 5,
                                 marginVertical: 4
                              }}>

                              <View style={{ position: "absolute", right: 6, top: -6, paddingHorizontal: 6, backgroundColor: colors.background, borderRadius: 6 }}>
                                 <Texto texto={item.estoque - (item.reservado + item.saida)} tipo={'Light'} tamanho={10} />
                              </View>
                              <Texto texto={item?.cor?.nome} tipo={'Regular'} />
                           </Pressable>
                        )
                     }))]}
               </ScrollView>

            </View> : null}

         {orcamento?.estado !== 'Entregue' && !!orcamento?.observacao ? <View style={{ paddingHorizontal: 18, marginVertical: 12 }}>

            {!!orcamento?.observacao ?
               <Texto cor={'#777'} tipo={'Light'} texto={`Obs. ${orcamento?.observacao}`} /> : null}

         </View> : null}



         <FlatList
            data={itensDoPedido}
            contentContainerStyle={{ padding: 10 }}
            renderItem={({ item }) => <ItemDaLista data={item} />}
            ListFooterComponent={itensDoPedido?.length > 0 ? <HeaderBudget /> : null}
            ListHeaderComponent={
               
            <View style={{ flexDirection: 'row', justifyContent: 'space-around',  gap: 6,marginBottom:6 }}>
            <Icone label='CONDIÇÕES' tamanhoDoIcone={20} disable={orcamento?.estado === 'Entregue' || orcamento?.estado === 'Criado'} onpress={() => navigation.navigate('FinalizaVenda', { ordemDeCompraID: rota.ordemDeCompraID })} nomeDoIcone={'wallet'} corDoIcone={orcamento?.estado === 'Entregue' || orcamento?.estado === 'Criado' ? '#ccc':'#222'} />
            {orcamento?.estado !== 'Aberto' && <Icone label='STATUS' tamanhoDoIcone={20} disable={orcamento?.estado === 'Entregue'} onpress={StatusButton(orcamento?.estado)?.caminho} nomeDoIcone={'sync'} corDoIcone={orcamento?.estado === 'Entregue'? '#ccc':'#222'} />}
            <Icone label='PDF' tamanhoDoIcone={20} disable={orcamento?.estado === 'Aberto'} onpress={() => gerarPDF()} nomeDoIcone={'sharealt'} corDoIcone={orcamento?.estado === 'Aberto' ? '#ccc': '#222'} />
            <Icone  label='EXCLUIR' tamanhoDoIcone={20} disable={orcamento?.estado === 'Aberto' || orcamento?.estado === 'Entregue'} onpress={() => setModalVisible(true)} nomeDoIcone={'delete'} corDoIcone={orcamento?.estado === 'Aberto' || orcamento?.estado === 'Entregue'? '#ccc':'#222'} />
         </View>
            }
         />
         {/* 
         {orcamento?.estado !== 'Aberto' ? <Pressable onPress={StatusButton(orcamento?.estado)?.caminho} style={{
            height: 55,
            margin: 10,
            backgroundColor: colors.theme,
            borderRadius: 6,
            marginVertical: 12,
            padding: 14,
            justifyContent: "center",
            alignItems: "center"
         }}>
            <Texto texto={StatusButton(orcamento?.estado)?.texto} cor='#fff' tamanho={16} />
         </Pressable > : null}

         {orcamento?.estado === 'Aberto' &&
            <Pressable style={{
               height: 55,
               margin: 10,
               backgroundColor: colors.theme,
               borderRadius: 6,
               marginVertical: 12,
               padding: 14,
               justifyContent: "center",
               alignItems: "center"
            }} onPress={() => navigation.navigate('FinalizaVenda', { ordemDeCompraID: rota.ordemDeCompraID })}>
               <Texto cor='#fff' texto={'Condições de Pagamento'} />
            </Pressable>} */}


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

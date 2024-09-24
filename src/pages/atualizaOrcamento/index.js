import { View, Text, FlatList, Pressable, Keyboard, ActivityIndicator, Modal, StyleSheet, Alert, ScrollView } from 'react-native';

import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import { CredencialContext } from '../../contexts/credencialContext';

import api from '../../services/api';

import Texto from '../../components/Texto';
import MaskOfInput from '../../components/MaskOfInput';
import Icone from '../../components/Icone';

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import Topo from '../../components/Topo';

import Animated, { FadeInUp } from 'react-native-reanimated';
import ItemDoPedido from '../../components/ItemDoPedido';


export default function AtualizaOrcamento() {
   const { colors } = useTheme()
   const { credencial } = useContext(CredencialContext)
   const { listaDeTamanhos, formatCurrency, load } = useContext(AppContext)

   const { ListaOrdemDeCompras } = useContext(CrudContext)

   const navigation = useNavigation()
   const { params: rota } = useRoute()

   const [referencia, setReferencia] = useState([])
   const [produtoEncontrado, setProdutoEncontrado] = useState([])
   const [orcamento, setOrcamento] = useState([])
   const [status, setStatus] = useState('')

   const [itensNoPedido, setItensNoPedido] = useState([]);

   const [pagamento, setPagamento] = useState([])

   const tipoC = orcamento?.tipo?.substr(0, 1)

   const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
   const [cores, setCores] = useState({});




   useEffect(() => {
      Promise.all([BuscaItemDoPedido(), BuscaOrdemDecompra(), BuscaPagamento()])

   }, [rota])




   useEffect(() => {

      const tamanhos = [...new Set(produtoEncontrado.map(item => item.tamanho))];
      const coresPorTamanho = {};

      tamanhos.forEach(tamanho => {
         const coresParaTamanho = produtoEncontrado.filter(item => item.tamanho === tamanho).map(item => item.cor.nome);
         const estoquePorTamanho = produtoEncontrado.filter(item => item.tamanho === tamanho).map(item => item.estoque - (item.reservado + item.saida));
         const produtosPorTamanho = produtoEncontrado.filter(item => item.tamanho === tamanho);
         coresPorTamanho[tamanho] = { cores: [...new Set(coresParaTamanho)], estoque: estoquePorTamanho, produtos: produtosPorTamanho };
      });

      setCores(coresPorTamanho);

   }, [produtoEncontrado]);



   const handleTamanhoSelecionado = tamanho => {
      setTamanhoSelecionado(tamanho);
   };




   useEffect(() => {
      if (referencia.length === 4) {
         BuscaProduto()
         setTamanhoSelecionado('')
         Keyboard.dismiss()

      } else { setProdutoEncontrado([]) }

   }, [referencia])



   const calcularTotal = () => {
      const getValor = (item) => {
         const valorString = tipoC === 'A' ? item.produto.valorAtacado : item.produto.valorVarejo;
         return parseFloat(valorString?.replace(',', '.'));
      };

      const getSubtotal = (item) => getValor(item) * item.quantidade;

      return itensNoPedido.reduce((total, item) => total + getSubtotal(item), 0);
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



   // BUSCA PAGAMENTO PARA EXIBIR INFORMAÇÕES INICIAIS NA TELA

   async function BuscaPagamento() {
      try {
         const response = await api.get(`/busca/pagamento?ordemDeCompraID=${rota.ordemDeCompraID}`)
         const pagamento = response.data

         setPagamento(pagamento);

      } catch (error) {
         console.log(error.response);

      }
   }



   // BUSCA ORDEM DE COMPRAS PARA EXIBIR INFORMAÇÕES INICIAIS NA TELA

   async function BuscaOrdemDecompra() {
      try {
         const response = await api.get(`/busca/ordemDeCompra?ordemDeCompraID=${rota?.ordemDeCompraID}`)
         const orcamento = response.data
         setOrcamento(orcamento)

         switch (orcamento?.estado) {
            case 'Aberto':
               setStatus('Processando')
               break;

            case 'Processando':
               setStatus('Embalado')
               break;

            case 'Embalado':
               setStatus('Entregue')
               break;

            default:
               setStatus('Entregue')
               break;
         }

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



   // AVANÇA PARA O PROXIMO ESTADO E ATUALIZA INFORMAÇÕES ALTERADAS

   async function AvancaEstado() {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credencial?.token}`
      }


      // SE TIVER HAVIDO ALGUMA ALTERAÇÃO NO TOTAL DA NOTA ...

      if (pagamento.totalDaNota !== calcularTotal() || orcamento?.estado === "Processando") {

         await AtualizaItemDoPedido()
         await api.put(`/atualiza/estoque?ordemDeCompraID=${orcamento?.id}`, { headers })
         navigation.navigate('FinalizaVenda', {
            ordemDeCompraID: rota.ordemDeCompraID,
            total: calcularTotal(),
            estado: status
         })

      } else {

         try {
            await api.put(`/atualiza/estoque?ordemDeCompraID=${orcamento?.id}`, { headers })
            navigation.navigate('HistoricoDeVendas')
         }

         catch (error) { console.log(error.response) }
      }

   }


   async function AtualizaItemDoPedido() {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credencial?.token}`
      }

      try {
         for (const item of itensNoPedido) {

            await api.put(`/atualiza/itemDoPedido?itemDoPedidoID=${item?.id}`, {
               produtoID: item.produto.id,
               quantidade: item.quantidade
            }, { headers })

         }
      } catch (error) {
         console.log(error.response);

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
         await BuscaItemDoPedido(orcamento?.id)
         await ListaOrdemDeCompras()
         navigation.navigate('Home')

      } catch (error) {
         console.log(error.response);

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

  <div style="display: flex; align-self: center; font-weight: 400; padding: 20px;">Ordem de Compra nº ${tipoC}-${orcamento?.id?.slice(0, 6).toUpperCase()}</div>

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
            <div style="width: 80px">R$ ${formatCurrency(calcularTotal())}</div>
          </div>

          ${!!pagamento?.desconto ? `<div style="font-weight: 300; display: flex; font-size: 13px; text-align: end ">Desconto de ${pagamento?.desconto}%
            <div style="width: 80px ">-R$ ${formatCurrency(!!pagamento?.desconto ? calcularTotal() * (pagamento?.desconto / 100) : calcularTotal())}</div>
          </div>` : ''}

          ${!!pagamento?.valorAdiantado ? `<div style="font-weight: 300; display: flex; font-size: 13px; text-align: end">Adiantamento:
            <div style="width: 80px">R$ ${formatCurrency(pagamento?.valorAdiantado)}</div>
          </div>` : ''}

          ${!!pagamento?.parcelas ? `<div style="font-weight: 300; display: flex; font-size: 13px; text-align: end ">Parcelado em ${pagamento?.parcelas}x
            <div style="width: 80px ">R$ ${formatCurrency(!!pagamento?.parcelas ? (calcularTotal() - pagamento?.valorAdiantado) / pagamento?.parcelas : calcularTotal())}</div>
          </div>` : ''}

          <div style="font-size: 13px; display: flex; text-align: end; margin-top:10px ">Total a pagar:
            <div style="width: 80px ">R$ ${formatCurrency(!!pagamento?.desconto || !!pagamento?.valorAdiantado ? (calcularTotal() - pagamento?.valorAdiantado) - (calcularTotal() * (pagamento?.desconto / 100)) : calcularTotal())}</div>
          </div>
        </div>
      </div>
    </div>
  `


   async function BuscaItemDoPedido() {

      try {
         const response = await api.get(`/busca/itemDoPedido?ordemDeCompraID=${rota.ordemDeCompraID}`)
         const itemDoPedido = response.data

         setItensNoPedido(itemDoPedido)

      } catch (error) {
         console.log(error.response);
      }
   }

   // ACRESCENTA ITEM AO PEDIDO, CASO ELE JA EXISTA NO PEDIDO, SOME + 1

   const AdicionaItem = ({ produto, ordemDeCompraID }) => {

      const itemExistente = itensNoPedido.find(item => item.produto.id === produto.id);

      if (itemExistente) {
         return

      } else {
         setItensNoPedido(prevItens => [...prevItens, { produto, ordemDeCompraID, quantidade: 1 }]);

      }
   };


   const Resultado = () => {

      let totalQuantidade = 0;
      itensNoPedido.forEach((item) => {
         totalQuantidade += item.quantidade;
      });

      return (
         <View style={{ marginVertical: 20 }}>
            {load ? <ActivityIndicator color={colors.theme} /> :
               <View style={{ alignItems: "flex-end", borderTopWidth: 1, borderColor: '#e9e9e9', padding: 10 }}>

                  <Texto tipo='Light' texto={`Total de itens: ${totalQuantidade}`} estilo={{ marginBottom: 12 }} />
                  <Texto texto={`Valor da Nota: R$ ${formatCurrency(calcularTotal())}`} tipo={'Light'} />
                  {!!pagamento?.desconto ? <Texto tipo='Light' texto={`Desconto de ${pagamento?.desconto}%: -R$ ${formatCurrency(!!pagamento?.desconto ? calcularTotal() * (pagamento?.desconto / 100) : calcularTotal())}`} /> : null}
                  {!!pagamento?.valorAdiantado ? <Texto tipo='Light' texto={`Adiantamento: -R$ ${formatCurrency(pagamento?.valorAdiantado)}`} /> : null}
                  {!!pagamento?.parcelas ? <Texto tipo='Light' texto={`Parcelado em ${pagamento?.parcelas}x R$ ${formatCurrency(!!pagamento?.parcelas ? (calcularTotal() - pagamento?.valorAdiantado) / pagamento?.parcelas : calcularTotal())}`} /> : null}
                  {pagamento?.obs ? <Texto estilo={{ marginTop: 12 }} tipo='Light' texto={`Obs.: ${pagamento?.obs}`} /> : null}
                  <Texto estilo={{ marginTop: 12 }} texto={`Total a pagar: R$ ${(!!pagamento?.desconto || !!pagamento?.valorAdiantado ? formatCurrency((calcularTotal() - pagamento?.valorAdiantado) - (calcularTotal() * (pagamento?.desconto / 100))) : formatCurrency(calcularTotal()))}`} />
               </View>
            }
         </View>
      )
   }


   const CoresPorTamanho = ({ tamanhoSelecionado, cores }) => {
      const coresParaTamanho = cores[tamanhoSelecionado].cores;
      const estoqueParaTamanho = cores[tamanhoSelecionado].estoque;
      const produtosParaTamanho = cores[tamanhoSelecionado].produtos;

      return (
         <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 6, marginBottom: 24 }}
            ItemSeparatorComponent={<View style={{ margin: 4 }} />}
            data={coresParaTamanho}
            renderItem={({ item, index }) => (
               <Pressable
                  onPress={() => AdicionaItem({ produto: produtosParaTamanho[index], ordemDeCompraID: orcamento?.id })}
                  key={index}
                  style={{
                     alignItems: "center",
                     justifyContent: "center",
                     borderRadius: 12,
                     height: 40,
                     backgroundColor: colors.fundo,
                     elevation: 5,
                     opacity: 0.7,
                     paddingHorizontal: 12,
                     marginVertical: 12,
                  }}
               >
                  <View style={{ position: "absolute", right: 6, top: -6, paddingHorizontal: 6, backgroundColor: colors.background, borderRadius: 6 }}>
                     <Texto texto={`${estoqueParaTamanho[index]}`} tipo={'Light'} tamanho={10} />
                  </View>
                  <Texto texto={item} tipo="Regular" />
               </Pressable>
            )}
         />
      );
   };







   return (
      <>
         <Topo
            iconeLeft={{ nome: 'chevron-back', acao: () => navigation.goBack() }}
            titulo={`Pedido ${orcamento?.estado}  ${tipoC}-${orcamento?.id?.substr(0, 6).toUpperCase()}`} >

            <Animated.View entering={FadeInUp.duration(400).delay(300)}
               style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  gap: 6,
                  backgroundColor: colors.theme,
               }}
            >
               <Icone
                  estilo={{ flex: 1 }}
                  disabled={!itensNoPedido.length > 0 || orcamento?.estado !== 'Entregue' || orcamento?.estado !== 'Processando'}
                  label="CONDIÇÕES"
                  tamanhoDoIcone={18}
                  onpress={() =>
                     navigation.navigate('FinalizaVenda', {
                        ordemDeCompraID: rota.ordemDeCompraID,
                     })
                  }
                  nomeDoIcone={'wallet-outline'}
                  corDoIcone="#000"
               />

               <Icone
                  disabled={orcamento?.estado === 'Aberto'}
                  estilo={{ flex: 1 }}
                  label="PDF"
                  tamanhoDoIcone={18}
                  onpress={gerarPDF}
                  nomeDoIcone={'share-social-outline'}
                  corDoIcone="#000"
               />

               <Icone
                  disabled={orcamento?.estado === 'Aberto' || orcamento?.estado === 'Entregue'}
                  estilo={{ flex: 1 }}
                  label={status?.toUpperCase()}
                  tamanhoDoIcone={18}
                  onpress={AvancaEstado}
                  nomeDoIcone={'arrow-redo-outline'}
                  corDoIcone="#000"
               />

               <Icone
                  disabled={orcamento?.estado === 'Entregue'}
                  estilo={{ flex: 1 }}
                  label="EXCLUIR"
                  tamanhoDoIcone={18}
                  onpress={() => acaoExcluir()}
                  nomeDoIcone={'trash-outline'}
                  corDoIcone="#000"
               />
            </Animated.View>
         </Topo>


         <View style={{ margin: 14, gap: 6 }}>
               <MaskOfInput title={produtoEncontrado[0]?.nome || 'Informe uma Referência'} value={referencia} setValue={setReferencia} maxlength={4} type='numeric' />

            <ScrollView horizontal>
               {Object.keys(cores).sort((a, b) => listaDeTamanhos.indexOf(a) - listaDeTamanhos.indexOf(b)).map(tamanho => (
                  <Pressable
                     key={tamanho}
                     onPress={() => handleTamanhoSelecionado(tamanho)}
                     style={{
                        width: 40,
                        aspectRatio: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.fundo,
                        elevation: 5,
                        opacity: 0.7,
                        borderRadius: 12,
                        margin: 6

                     }}
                  >
                     <Texto texto={tamanho} tipo="Medium" cor="#222" />
                  </Pressable>
               ))}
            </ScrollView>
            {tamanhoSelecionado && (
               <CoresPorTamanho tamanhoSelecionado={tamanhoSelecionado} cores={cores} />
            )}
         </View>



         <FlatList
            data={itensNoPedido}
            ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 6 }} />}
            contentContainerStyle={{ paddingHorizontal: 14, }}
            renderItem={({ item }) => <ItemDoPedido lista={item} listaInicial={orcamento} listaPedido={itensNoPedido} setListaPedido={setItensNoPedido} />}
            ListFooterComponent={itensNoPedido?.length > 0 ? <Resultado /> : null}
         />
      </>
   );
}

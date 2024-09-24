import { View, FlatList, Pressable, Keyboard, ActivityIndicator, ScrollView, BackHandler, Alert } from 'react-native';

import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import { CredencialContext } from '../../contexts/credencialContext';

import api from '../../services/api';

import Texto from '../../components/Texto';
import MaskOfInput from '../../components/MaskOfInput';
import Icone from '../../components/Icone';
import Topo from '../../components/Topo';
import ItemDoPedido from '../../components/ItemDoPedido';


export default function CriaOrcamento() {
   const { colors } = useTheme()
   const { credencial } = useContext(CredencialContext)
   const { listaDeTamanhos, formatCurrency } = useContext(AppContext)

   const { FecharNota } = useContext(CrudContext)

   const navigation = useNavigation()
   const { params: rota } = useRoute()

   const [referencia, setReferencia] = useState([])
   const [produtoEncontrado, setProdutoEncontrado] = useState([])
   const [orcamento, setOrcamento] = useState([])

   const [itensNoPedido, setItensNoPedido] = useState([]);
   const tipoC = orcamento?.tipo?.substr(0, 1)


   const [tamanhoSelecionado, setTamanhoSelecionado] = useState(null);
   const [cores, setCores] = useState({});




   useEffect(() => {
      BuscaOrdemDecompra()

      if (referencia.length === 4) {
         BuscaProduto()
         setTamanhoSelecionado('')
         Keyboard.dismiss()

      } else {
         setProdutoEncontrado([])
      }
   }, [referencia])




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
      const backHandler = BackHandler.addEventListener(
         'hardwareBackPress',
         acaoVoltar,
      );

      // AO CLICAR NO BOTAO VOLTAR

      return () => backHandler.remove();
   }, []);


   function Alerta(mensagem) {
      Alert.alert('', mensagem, [
         {
            text: 'Ok',
            onPress: () => null,
         },
      ])
   }


   const acaoVoltar = () => {

      // SE TIVER ITEM JA ADICIONADO MOSTRAR POPUP, SE NAO VOLTAR A PAGINA ANTERIOR

      itensNoPedido.length > 0 ?
         Alert.alert('', 'Seu pedido não foi finalizado...', [
            { text: 'Cancelar Pedido', onPress: () => CancelarCompra(orcamento?.id) },
            {
               text: 'Continuar',
               onPress: () => null,
            },
         ]) : navigation.goBack()
      return true;
   };



   const acaoAvancar = () => {

      // MOSTRAR POPUP ALERTANDO SOBRE A IMPOSSIBILIDADE DE VOLTAR APOS AVANCAR PARA PAGAMENTO

      Alert.alert('', 'Confirme para gerar pedido', [
         { text: 'Revisar', onPress: () => null },
         {
            text: 'Confirmar',
            onPress: () => navigation.navigate('FinalizaVenda',
               {
                  ordemDeCompraID: rota.ordemDeCompraID,
                  total: calcularTotal(),
                  estado: orcamento?.estado
               }
            ),
         },
      ])
      return false;
   };




   // BUSCAR ORDEM DE COMPRAS PARA EXIBIR INFORMAÇÕES EM TELA

   async function BuscaOrdemDecompra() {
      try {
         const res = await api.get(`/busca/ordemDeCompra?ordemDeCompraID=${rota?.ordemDeCompraID}`)
         setOrcamento(res.data)

      } catch (error) {
         console.log(error.response);

      }
   }



   // BUSCA O PRODUTO DA REFERENCIA DIGITADA PARA REGISTRO DE ITENS

   async function BuscaProduto() {
      try {
         const res = await api.get(`/busca/produto/referencia?referencia=${referencia}`)
         setProdutoEncontrado(res.data)




      } catch (error) {
         console.log(error.response)

      }
   }



   // ACRESCENTA ITEM AO PEDIDO, CASO ELE JA EXISTA NO PEDIDO, SOME + 1

   const AdicionaItem = ({ produto, ordemDeCompraID }) => {

      const itemExistente = itensNoPedido.find(item => item.produto === produto);

      if (itemExistente) {
         return

      } else {
         setItensNoPedido(prevItens => [...prevItens, { produto, ordemDeCompraID, quantidade: 1 }]);

      }
   };




   // CANCELA A COMPRA EXCLUINDO DO BANCO RETORNANDO OS ITENS AO ESTOQUE, E EXCLUI A ORDEM DE COMPRA JA VAZIA

   async function CancelarCompra(ordemDeCompraID) {

      const headers = {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${credencial?.token}`
      }

      try {
         await api.delete(`/cancelaCompra?ordemDeCompraID=${ordemDeCompraID}`, { headers })
         await api.delete(`/deleta/ordemDeCompra?ordemDeCompraID=${ordemDeCompraID}`, { headers })


      } catch (error) {
         console.log(error.response);

      } finally {
         navigation.navigate('Home')

      }
   }


   // CALCULA O TOTAL DOS ITENS ACRESCENTADOS NA NOTA

   const calcularTotal = () => {
      const getValor = (item) => {
         const valorString = tipoC === 'A' ? item.produto.valorAtacado : item.produto.valorVarejo;
         return parseFloat(valorString.replace(',', '.'));
      };

      const getSubtotal = (item) => getValor(item) * item.quantidade;

      return itensNoPedido.reduce((total, item) => total + getSubtotal(item), 0);
   };





   const Resultados = () => {

      let totalQuantidade = 0;
      itensNoPedido.forEach(item => totalQuantidade += item.quantidade);
      const total = calcularTotal()

      return (
         <View style={{ marginVertical: 20 }}>
            {load ? <ActivityIndicator color={colors.theme} /> :
               <View style={{ alignItems: "flex-end", borderTopWidth: 1, borderColor: '#e9e9e9', padding: 10 }}>
                  <Texto tipo='Light' texto={`Total de itens: ${totalQuantidade}`} />
                  <Texto estilo={{ marginTop: 12 }} texto={`Total a pagar: R$ ${formatCurrency(total)}`} />
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
            contentContainerStyle={{ paddingHorizontal: 6 }}
            ItemSeparatorComponent={<View style={{ margin: 4 }} />}
            data={coresParaTamanho}
            renderItem={({ item, index }) => (
               <Pressable
                  onPress={() => estoqueParaTamanho[index] > 0 ? AdicionaItem({ produto: produtosParaTamanho[index], ordemDeCompraID: orcamento?.id }) : Alerta(`Cor ${item} - Estoque Zerado `)}
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
            posicao='left'
            iconeLeft={{ nome: 'arrow-back-outline', acao: () => acaoVoltar() }}
            titulo={`Pedido ${orcamento?.estado}  ${tipoC}-${orcamento?.id?.substr(0, 6).toUpperCase()}`} >
            <View
               style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: colors.theme,
               }} >
               {orcamento?.estado !== 'Entregue' && orcamento?.estado !== 'Processando' &&
                  <Icone disabled={!itensNoPedido.length > 0} nomeDoIcone={'wallet-outline'} label='CONDIÇÕES' onpress={() => {
                     FecharNota(itensNoPedido)
                     acaoAvancar()

                  }} />
               }
            </View>
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
            ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 12 }} />}
            contentContainerStyle={{ paddingHorizontal: 14, }}
            renderItem={({ item }) => <ItemDoPedido lista={item} listaInicial={orcamento} listaPedido={itensNoPedido} setListaPedido={setItensNoPedido} />}
            ListFooterComponent={itensNoPedido?.length > 0 ? <Resultados /> : null}
         />

      </>
   );
}


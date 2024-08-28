import { Pressable, View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';

import { useTheme, useRoute } from '@react-navigation/native';
import { useEffect, useContext, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaskOfInput from '../../components/MaskOfInput';
import { createNumberMask } from 'react-native-mask-input';
import { useNavigation } from '@react-navigation/native';

import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { AppContext } from '../../contexts/appContext';
import api from '../../services/api';
import Load from '../../components/Load';
import Pick from '../../components/Picker';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Icone from '../../components/Icone';

export default function RegistraEstoque() {

  const navigation = useNavigation()
  const { params: rota } = useRoute()

  const CurrencyMask = createNumberMask({
    delimiter: '.',
    separator: ',',
    precision: 2,
  });

  const { credencial, Toast } = useContext(AppContext)
  const { colors } = useTheme()

  const [load, setLoad] = useState(false)
  const [loadBusca, setLoadBusca] = useState(false)
  const [itensAAdcionar, setItensAAdicionar] = useState([])

  const [codigoDeBarras, setCodigoDeBarras] = useState('')
  const [referencia, setReferencia] = useState('')
  const [nome, setNome] = useState('')
  const [tamanho, setTamanho] = useState('')
  const [estoque, setEstoque] = useState('')
  const [valorAtacado, setValorAtacado] = useState('') // valor Atacado
  const [valorVarejo, setValorVarejo] = useState('') // valor Varejo

  const [listaDeCores, setListaDeCores] = useState([])
  const [corSelecionada, setCorSelecionada] = useState({})
  const [finalizarLista, setFinalizarLista] = useState(true)

  const listaTamanhos = [
    { codigo: '01', tamanho: 'PP' || 'Pp' || 'pp' },
    { codigo: '02', tamanho: 'P' || 'p' },
    { codigo: '03', tamanho: 'M' || 'm' },
    { codigo: '04', tamanho: 'G' || 'g' },
    { codigo: '05', tamanho: 'GG' || 'Gg' || 'gg' },
    { codigo: '06', tamanho: 'G1' },
    { codigo: '07', tamanho: 'G2' },
    { codigo: '08', tamanho: 'G3' },
    { codigo: '09', tamanho: 'G4' },
    { codigo: '10', tamanho: 'G5' },
    { codigo: '11', tamanho: '2' },
    { codigo: '12', tamanho: '4' },
    { codigo: '13', tamanho: '6' },
    { codigo: '14', tamanho: '8' },
    { codigo: '15', tamanho: '10' },
    { codigo: '16', tamanho: '12' },
    { codigo: '17', tamanho: '14' },
  ]

  useEffect(() => {

    if (!!rota) BuscaProdutosPorCodigo(rota?.codigoDeBarras)
  }, [])

  useEffect(() => {

    if (!rota) Promise.all([BuscaProdutos(referencia), ListaCores()])

  }, [referencia])


  useEffect(() => {

    const ean12 = `789${buscaCodigoDeTamanho(tamanho)}${corSelecionada?.codigo}0${referencia}`
    const chave = codigoDeVerificacaoEAN13(ean12)

    isNaN(chave) ? setCodigoDeBarras("") : setCodigoDeBarras(ean12 + chave)

  }, [tamanho, corSelecionada, referencia])



  async function ListaCores() {
    try {
      const res = await api.get("/listaCores")
      setListaDeCores(res.data)

    } catch (error) {
      console.log(error.response);

    }
  }

  async function BuscaProdutosPorCodigo(codigoDeBarras) {

    setLoadBusca(true)

    try {
      const res = await api.get(`/busca/produto/codigo?codigoDeBarras${codigoDeBarras}`)
      const produto = res.data.find((item) => item.codigoDeBarras === codigoDeBarras)

      setReferencia(produto?.referencia)
      setNome(produto?.nome)
      setValorAtacado(String(produto?.valorAtacado))
      setValorVarejo(String(produto?.valorVarejo))
      setTamanho(produto?.tamanho)
      setEstoque(String(produto?.estoque))
      setCorSelecionada(produto?.cor)

    } catch (error) {
      console.log(error.response);

    } finally {
      setLoadBusca(false)
    }

  }


  async function BuscaProdutos(referencia) {

    if (!!rota) {
      return
    }

    setLoadBusca(true)

    try {
      const res = await api.get(`/busca/produto/referencia?referencia${referencia}`)
      const produto = res.data.find((item) => item.referencia === referencia)

      if (!!produto) {
        setNome(produto.nome)
        setValorAtacado(produto.valorAtacado)
        setValorVarejo(produto.valorVarejo)

      }
    } catch (error) {
      console.log(error.response);

    } finally {
      setLoadBusca(false)
    }

  }

  const buscaCodigoDeTamanho = (tamanho) => {
    for (let i = 0; i < listaTamanhos.length; i++) {
      if (listaTamanhos[i].tamanho?.toUpperCase() === tamanho?.toUpperCase()) {
        return listaTamanhos[i].codigo;
      }
    }
    return null;
  };

  function codigoDeVerificacaoEAN13(ean12) {
    const weights = [1, 3];
    let sum = 0;
    let weightIndex = 0;

    for (let i = 0; i < 12; i++) {
      const digit = parseInt(ean12.charAt(i));
      sum += digit * weights[weightIndex];
      weightIndex = (weightIndex + 1) % 2;
    }

    const remainder = sum % 10;
    const checksum = remainder === 0 ? 0 : 10 - remainder;

    return checksum;
  }

  async function AtualizaProduto() {

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`
    }

    try {
      await api.put(`/atualiza/produto?produtoID=${rota?.id}`, {
        nome, valorAtacado, valorVarejo
      }, { headers })

      navigation.navigate('ListaEstoque')

    } catch (error) {
      console.log(error.response);

    } finally {
      Toast('Produto Atualizado')
    }

  }

  async function RegistraProduto() {

    setLoad(true)

    if (itensAAdcionar.length < 1) {
      Toast('Preenchimento incompleto')
      return
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`
    }

    itensAAdcionar.map(async (item) => {
      try {

        await api.post('/cria/produto', {
          codigoDeBarras: item.codigoDeBarras,
          referencia: item.referencia,
          nome: item.nome,
          tamanho: item.tamanho.toUpperCase(),
          corID: item?.corSelecionada?.id,
          estoque: Number(item.estoque),
          valorAtacado: item.valorAtacado,
          valorVarejo: item.valorVarejo,
        }, { headers })

      } catch (error) {
        console.log(error.response);
        Toast(error.response.data.error)

      } finally {
        setLoad(false)
        setCodigoDeBarras('')
        setReferencia('')
        setNome('')
        setTamanho('')
        setCorSelecionada({})
        setEstoque('')
        setValorAtacado('')
        setValorVarejo('')
        setItensAAdicionar([])
      }
    })
  }

  if (load) return <Load />

  return (

    <>
      <Topo
        posicao='left'
        iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
        titulo='Produto' />
      <Tela>

        <ScrollView style={{ marginTop: 10 }}>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

            <MaskOfInput load={loadBusca} style={{ flex: 1 }} title='Código de Barras' value={codigoDeBarras} editable={false} />

            {!!rota ? null : <Pressable onPress={() => navigation.navigate('ListaDeCores')} style={{ margin: 2, width: 60, height: 60, borderRadius: 12, backgroundColor: '#e9e9e9', alignItems: "center", justifyContent: "center" }}>
              <Icone onpress={() => navigation.navigate('ListaDeCores')} nomeDoIcone='contrast' label='CORES' corDoIcone='#222' />
            </Pressable>}

          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <MaskOfInput editable={!rota} type='numeric' style={{ width: 80 }} title='Ref.' value={referencia} setValue={setReferencia} maxlength={4} />
            <MaskOfInput load={loadBusca} style={{ flex: 1 }} title='Descrição' value={nome} setValue={setNome} maxlength={30} info={nome?.length + '/30'} />
          </View>

          <View style={{ flexDirection: 'row' }}>
            <MaskOfInput type='numeric' load={loadBusca} style={{ flex: 1 }} title='Valor Atacado' value={valorAtacado} setValue={setValorAtacado} mask={CurrencyMask} />
            <MaskOfInput type='numeric' load={loadBusca} style={{ flex: 1 }} title='Valor Varejo' value={valorVarejo} setValue={setValorVarejo} mask={CurrencyMask} />
          </View>

          <View >
            <View style={{ flexDirection: 'row' }}>
              <MaskOfInput editable={!rota} maxlength={3} style={{ width: 75 }} title='Tam.' value={tamanho} setValue={setTamanho} info={buscaCodigoDeTamanho(tamanho)} />
              <Pick itemTopo={corSelecionada?.nome || ''} title={'Cor'} data={listaDeCores?.sort((a, b) => a.nome.localeCompare(b.nome))} setValue={setCorSelecionada} value={corSelecionada} style={{ flex: 1 }} selectedValue={corSelecionada} info={corSelecionada?.codigo} />
              <MaskOfInput editable={!rota} maxlength={3} style={{ width: 75 }} title='Qtd.' value={estoque} setValue={setEstoque} type='numeric' />

            </View>

            {!!codigoDeBarras && !rota ? <Pressable
              style={{
                alignItems: "center",
                justifyContent: 'center',
                padding: 18,
                backgroundColor: "#f5f5f5",
                flexDirection: 'row',
                gap: 6

              }}
              onPress={() => {
                if (!tamanho || !corSelecionada || !estoque || !codigoDeBarras) {
                  Toast('Preenchimento incompleto')
                  return
                }

                if (!listaTamanhos.find((item) => item.tamanho === tamanho.toUpperCase())?.codigo || !listaDeCores.find((item) => item.nome === corSelecionada.nome)?.codigo) {
                  Toast('Tamanho ou cor invalida')
                  return

                }

                setItensAAdicionar(arr => [...arr, {
                  referencia,
                  codigoDeBarras,
                  nome,
                  valorAtacado,
                  valorVarejo,
                  tamanho: tamanho.toUpperCase(),
                  corSelecionada,
                  estoque
                }])
                setCorSelecionada('')
                setEstoque('')
                setCodigoDeBarras('')
              }

              }>
              <Texto texto={'Adicionar à lista'} />
              <AntDesign name='enter' size={18} />
            </Pressable> : null}
          </View>

          {itensAAdcionar.length ?
            <View style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              marginVertical: 18,
              borderTopWidth: .7,
              borderColor: '#aaa',
            }}>

              <View style={{ flexDirection: 'row', justifyContent: "space-between", marginBottom: 14 }}>
                <Texto texto={'Descrição'} tipo='Medium' />
                <Texto texto={'Qtd.'} tipo='Medium' />
              </View>

              {itensAAdcionar.map((item, index) => {
                const filteredProdutos = itensAAdcionar.filter(produto => produto.codigoDeBarras !== item.codigoDeBarras);
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                    <Pressable style={{ flex: 1, }} onPress={() => {
                      Alert.alert(
                        '',
                        `Excluir o item: ${item.nome}?`,
                        [
                          {
                            text: 'Cancelar',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                          },
                          {
                            text: 'Excluir',
                            onPress: () => {
                              setItensAAdicionar(filteredProdutos);
                            },
                          },
                        ],
                        { cancelable: false }
                      );
                    }}>
                      <Animated.View entering={FadeInUp.duration(200).delay(200)} key={index} style={{ flex: 1, flexDirection: 'row', justifyContent: "space-between", alignItems: 'center' }}>
                        <Text style={{ fontWeight: '300', color: '#000', paddingVertical: 6 }}>{item.referencia}</Text>
                        <Text style={{ fontWeight: '300', color: '#000', flex: 1, marginLeft: 6 }}>{item.nome} {item.tamanho} {item.corSelecionada.nome}</Text>
                        <Text style={{ width: 30, textAlign: 'right' }}>{item.estoque}</Text>
                      </Animated.View>
                    </Pressable>
                  </View>
                )
              })}
              {/* 
              <FlatList data={itensAAdcionar}
                ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9', marginVertical: 12 }} />}
                renderItem={({ item, index }) => {
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                      <Pressable style={{ flex: 1, }} onPress={() => {
                        Alert.alert(
                          '',
                          `Excluir o item: ${item.nome}?`,
                          [
                            {
                              text: 'Cancelar',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel',
                            },
                            {
                              text: 'Excluir',
                              onPress: () => {
                                setItensAAdicionar(filteredProdutos);
                              },
                            },
                          ],
                          { cancelable: false }
                        );
                      }}>
                        <Animated.View entering={FadeInUp.duration(200).delay(200)} key={index} style={{ flex: 1, flexDirection: 'row', justifyContent: "space-between" }}>
                          <Text style={{ fontWeight: '300', color: '#000' }}>{item.referencia}</Text>
                          <Text style={{ fontWeight: '300', color: '#000', flex: 1, marginLeft: 6 }}>{item.nome} {item.tamanho} {item.corSelecionada.nome}</Text>
                          <Text style={{ width: 30, textAlign: 'right' }}>{item.estoque}</Text>
                        </Animated.View>
                      </Pressable>
                    </View>
                  )
                }}
              /> */}



              <Pressable style={{
                alignItems: "center",
                justifyContent: 'center',
                padding: 18,
                backgroundColor: "#f5f5f5",

              }} onPress={() => setFinalizarLista(!finalizarLista)}>
                {finalizarLista ?
                  <View style={{
                    flexDirection: 'row',
                    gap: 6
                  }}>
                    <Texto texto={'Finalizar Lista'} />
                    <AntDesign name='check' size={18} />
                  </View>
                  :
                  <View style={{
                    flexDirection: 'row',
                    gap: 6
                  }}>
                    <AntDesign name='back' size={18} />
                    <Texto texto={'Continuar adicionando...'} />
                  </View>
                }
              </Pressable>

            </View> : null
          }

        </ScrollView>
        {itensAAdcionar.length && !finalizarLista ?

          <Pressable onPress={() => RegistraProduto()}
            style={[styles.botaoCadastrar, { backgroundColor: colors.theme }]}>

            {load ? <ActivityIndicator color={'#fff'} /> : <Text style={{ color: '#fff', fontSize: 16 }}>Cadastrar</Text>}

          </Pressable>
          : null
        }

        {!!rota &&
          <Pressable onPress={() => AtualizaProduto()}
            style={[styles.botaoCadastrar, { backgroundColor: colors.theme }]}>

            {load ? <ActivityIndicator color={'#fff'} /> : <Text style={{ color: '#fff', fontSize: 16 }}>Atualizar</Text>}

          </Pressable>
        }
      </Tela>
    </>
  );
}

const styles = StyleSheet.create({
  botaoCadastrar: {
    height: 60,
    borderRadius: 6,
    marginVertical: 12,
    padding: 14,
    justifyContent: "center",
    alignItems: "center"
  },
  boxPicker: {
    margin: 2,
    height: 60,
    paddingVertical: 8,
    borderWidth: .4,
    borderColor: '#777',
    borderRadius: 6,
  },
  titlePicker: {
    marginLeft: 18,
    fontWeight: '300',
    fontSize: 13,
    color: '#000',
    position: "absolute",
    top: 8
  },

})
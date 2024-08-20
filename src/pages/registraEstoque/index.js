import { Pressable, View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { useEffect, useContext, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Material from 'react-native-vector-icons/MaterialCommunityIcons'
import MaskOfInput from '../../components/MaskOfInput';
import { createNumberMask } from 'react-native-mask-input';
import { useNavigation } from '@react-navigation/native';

import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { AppContext } from '../../contexts/appContext';
import api from '../../services/api';
import Load from '../../components/Load';
import Pick from '../../components/Picker';
import Texto from '../../components/Texto';

export default function RegistraEstoque() {

  const navigation = useNavigation()

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

    Promise.all([BuscaProdutos(referencia), ListaCores()])

  }, [referencia])


  useEffect(() => {

    const ean12 = `789${buscaCodigoDeTamanho(tamanho)}${corSelecionada?.codigo}0${referencia}`
    const chave = codigoDeVerificacaoEAN13(ean12)

    isNaN(chave) ? setCodigoDeBarras("") : setCodigoDeBarras(ean12 + chave)

  }, [tamanho, corSelecionada, referencia])


  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View style={{ flexDirection: 'row', gap: 6, marginRight: -10 }}>
            <Pressable onPress={() => navigation.navigate('ListaDeCores')} style={{ height: 55, width: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Material name='invert-colors' size={22} color={colors.text} />
            </Pressable>
          </View>
        )
      }
    })
  }, [])





  async function ListaCores() {
    try {
      const res = await api.get("/listaCores")
      setListaDeCores(res.data)

    } catch (error) {
      console.log(error.response);

    }
  }

  async function BuscaProdutos(referencia) {


    setLoadBusca(true)

    try {
      const response = await api.get(`/busca/produto/referencia?referencia${referencia}`)
      const produto = response.data.find((item) => item.referencia === referencia)

      if (!!produto) {
        setNome(produto.nome)
        setValorAtacado(produto.valorAtacado)
        setValorVarejo(produto.valorVarejo)

      } else {
        setNome('')
        setValorAtacado('')
        setValorVarejo('')

      }
    } catch (error) {
      console.log(error.response);

    } finally {
      setLoadBusca(false)
    }

  }

  const buscaCodigoDeTamanho = (tamanho) => {
    for (let i = 0; i < listaTamanhos.length; i++) {
      if (listaTamanhos[i].tamanho.toUpperCase() === tamanho.toUpperCase()) {
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
    <View style={{ flex: 1, padding: 10 }}>

      <ScrollView>

        <MaskOfInput load={loadBusca} style={{ flex: 1 }} title='Código de Barras' value={codigoDeBarras} editable={false} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <MaskOfInput type='numeric' style={{ width: 80 }} title='Ref.' value={referencia} setValue={setReferencia} maxlength={4} />
          <MaskOfInput load={loadBusca} style={{ flex: 1 }} title='Descrição' value={nome} setValue={setNome} maxlength={30} info={nome?.length + '/30'} />
        </View>


        <View style={{ flexDirection: 'row' }}>
          <MaskOfInput load={loadBusca} style={{ flex: 1 }} title='Valor Atacado' value={valorAtacado} setValue={setValorAtacado} mask={CurrencyMask} />
          <MaskOfInput load={loadBusca} style={{ flex: 1 }} title='Valor Varejo' value={valorVarejo} setValue={setValorVarejo} mask={CurrencyMask} />
        </View>

        <View >
          <View style={{ flexDirection: 'row' }}>
            <MaskOfInput maxlength={3} style={{ width: 75 }} title='Tam.' value={tamanho} setValue={setTamanho} info={buscaCodigoDeTamanho(tamanho)} />
            <Pick title={'Cor'} data={listaDeCores} setValue={setCorSelecionada} value={corSelecionada} style={{ flex: 1 }} selectedValue={corSelecionada} info={corSelecionada?.codigo} />
            <MaskOfInput maxlength={3} style={{ width: 75 }} title='Qtd.' value={estoque} setValue={setEstoque} type='numeric' />

          </View>

          {!!codigoDeBarras ? <Pressable
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
            paddingHorizontal: 18,
            marginVertical: 18,
            borderTopWidth: .7,
            borderColor: '#aaa',

          }}>

            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
              <Texto texto={'Descrição'} tipo='Medium' />
              <Texto texto={'Qtd.'} tipo='Medium' />
            </View>


            {itensAAdcionar.map((item, index) => {
              return (
                <Animated.View entering={FadeInUp.duration(200).delay(200)} key={index} style={{ flexDirection: 'row', justifyContent: "space-between", borderBottomColor: '#ddd', borderBottomWidth: .7, paddingVertical: 6 }}>
                  <Text style={{ fontWeight: '300', color: '#000', flex: 1 }}>{item.referencia} - {item.nome} {item.tamanho} {item.corSelecionada.nome}</Text>
                  <Text style={{ width: 30, textAlign: 'right' }}>{item.estoque}</Text>
                </Animated.View>
              )
            })}

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
      {itensAAdcionar.length && !finalizarLista ? <Pressable
        style={[styles.botaoCadastrar, { backgroundColor: colors.theme }]}
        onPress={() => RegistraProduto()}
      >
        {load ? <ActivityIndicator color={'#fff'} /> :
          <Text style={{ color: '#fff', fontSize: 16 }}>Cadastrar</Text>
        }

      </Pressable> : null}
    </View>
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
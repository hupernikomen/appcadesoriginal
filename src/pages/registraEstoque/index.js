import { Pressable, View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { useEffect, useContext, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Material from 'react-native-vector-icons/MaterialCommunityIcons'
import Input from '../../components/Input';
import MaskOfInput from '../../components/MaskOfInput';
import { createNumberMask } from 'react-native-mask-input';
import { useNavigation } from '@react-navigation/native';

import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { AppContext } from '../../contexts/appContext';
import api from '../../services/api';
import Load from '../../components/Load';
import Pick from '../../components/Picker';

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

  const listaTamanhos = [
    { codigo: '1', tamanho: 'PP' || 'Pp' || 'pp' },
    { codigo: '2', tamanho: 'P' || 'p' },
    { codigo: '3', tamanho: 'M' || 'm' },
    { codigo: '4', tamanho: 'G' || 'g' },
    { codigo: '5', tamanho: 'GG' || 'Gg' || 'gg' },
  ]



  useEffect(() => {

    Promise.all([BuscaProdutos(referencia),ListaCores()])
    
  }, [referencia])


  useEffect(() => {

    const ean12 = `7890${buscaCodigoDeTamanho(tamanho)}${corSelecionada?.codigo}0${referencia}`
    const chave = codigoDeVerificacaoEAN13(ean12)

    isNaN(chave) ? setCodigoDeBarras("") : setCodigoDeBarras(ean12 + chave)

    console.log(corSelecionada, "SEL");
    

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

    console.log(itensAAdcionar);
    


    itensAAdcionar.map(async (item) => {
      console.log(item);
      
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

        <View style={{ height: 40, alignItems: "center", justifyContent: "center", marginVertical: 12 }}>
          <Animated.Text entering={FadeInDown.duration(300)} style={{ display: !!codigoDeBarras ? 'flex' : 'none', marginTop: -50, fontFamily: 'Barcode', fontSize: 85, color: '#000', alignSelf: 'center' }}>{codigoDeBarras}</Animated.Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
          <Input type='numeric' styleInput={{ width: 60 }} value={referencia} setValue={setReferencia} title={'Ref.'} maxlength={4} />
          <Input load={loadBusca} styleContainer={{ flex: 1 }} value={nome} setValue={setNome} title={'Descrição'} maxlength={30} info={nome?.length + '/30'} />

        </View>


        <View style={{ flexDirection: 'row', gap: 4 }}>
          <MaskOfInput load={loadBusca} style={{ flex: 1 }} title={'Valor Atacado'} value={valorAtacado} setValue={setValorAtacado} mask={CurrencyMask} />
          <MaskOfInput load={loadBusca} style={{ flex: 1 }} title={'Valor Varejo'} value={valorVarejo} setValue={setValorVarejo} mask={CurrencyMask} />
        </View>

        <View style={{ borderRadius: 6 }}>
          <View style={{ flexDirection: 'row', gap: 4 }}>

            <Input styleInput={{ width: 40 }} value={tamanho} setValue={setTamanho} title={'Tam.'} maxlength={4} info={buscaCodigoDeTamanho(tamanho)} />
            {/* <Input styleContainer={{ flex: 1 }} value={cor} setValue={setCor} title={'Cor'} maxlength={15} info={buscaCodigoDeCor(cor)} /> */}

            <Pick title={'Cor'} data={listaDeCores} setValue={setCorSelecionada} value={corSelecionada} style={{ flex: 1 }} selectedValue={corSelecionada} />

            <Input maxlength={3} type='numeric' title={'Qtd.'} styleInput={{ width: 40 }} value={estoque} setValue={setEstoque} />


            <Pressable onPress={() => {
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
              setTamanho('')
              setCorSelecionada('')
              setEstoque('')
              setCodigoDeBarras('')
            }

            } style={{ flex: .3, alignItems: 'center', justifyContent: 'center', borderRadius: 6, }}>
              <AntDesign name='enter' color={colors.black} size={26} />
            </Pressable>

          </View>
        </View>

        {itensAAdcionar.length ?
          <View style={{
            paddingVertical: 8,
            borderWidth: .7,
            borderColor: '#777',
            borderRadius: 12,
            paddingHorizontal: 18,
            marginVertical: 12
          }}>

            <View style={{ flexDirection: 'row', justifyContent: "space-between", }}>
              <View style={{ flexDirection: 'row' }}>

                <Text style={{ fontSize: 13, fontWeight: '400', color: '#000' }}>Descrição</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '400', color: '#000' }}>Qtd.</Text>
            </View>


            {itensAAdcionar.map((item, index) => {
              return (


                <Animated.View entering={FadeInUp.duration(200).delay(200)} key={index} style={{ flexDirection: 'row', justifyContent: "space-between", paddingVertical: 4 }}>
                  <Text style={{ fontWeight: '300', color: '#000' }}>{item.referencia} - {item.nome} {item.tamanho} {item.cor}</Text>
                  <Text>{item.estoque}</Text>
                </Animated.View>

              )
            })}

          </View> : null
        }

      </ScrollView>
      {itensAAdcionar.length ? <Pressable
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
    height: 55,
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
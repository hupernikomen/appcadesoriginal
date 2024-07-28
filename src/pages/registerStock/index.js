import { Pressable, View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { useEffect, useContext, useState } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Input from '../../components/Input';
import MaskOfInput from '../../components/MaskOfInput';
import { createNumberMask } from 'react-native-mask-input';
import { useNavigation } from '@react-navigation/native';

import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { AppContext } from '../../contexts/appContext';
import api from '../../services/api';
import Load from '../../components/Load';

export default function RegisterStock() {

  const navigation = useNavigation()

  const CurrencyMask = createNumberMask({
    delimiter: '.',
    separator: ',',
    precision: 2,
  });

  const { credential, Toast } = useContext(AppContext)
  const { colors } = useTheme()

  const [load, setLoad] = useState(false)
  const [stockGrid, setStockGrid] = useState([])

  const [code, setCode] = useState('')
  const [ref, setRef] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [stock, setStock] = useState('')
  const [valueResale, setValeuResale] = useState('') // valor Atacado
  const [valueRetail, setValueRetail] = useState('') // valor Varejo

  const listSizes = [
    { code: '1', size: 'PP' || 'Pp' || 'pp' },
    { code: '2', size: 'P' || 'p' },
    { code: '3', size: 'M' || 'm' },
    { code: '4', size: 'G' || 'g' },
    { code: '5', size: 'GG' || 'Gg' || 'gg' },
  ]

  // Sempre buscando o nome feminino da cor 
  const listColors = [
    { code: '00', color: 'Preta' },
    { code: '01', color: 'Branca' },
    { code: '02', color: 'Cinza' },
    { code: '03', color: 'Grafite' },
    { code: '04', color: 'Rosa' },
    { code: '16', color: 'Pink' },
    { code: '06', color: 'Amarela' },
    { code: '07', color: 'Vermelha' },
  ]


  useEffect(() => {
    GetProducts(ref)

  }, [ref])


  useEffect(() => {


    const ean12 = `7890${getSizeCode(size)}${getColorCode(color)}0${ref}`
    const chave = calculateEan13Checksum(ean12)

    isNaN(chave) ? setCode("") : setCode(ean12 + chave)

  }, [size, color, ref])


  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View style={{ flexDirection: 'row', gap: 6, marginRight: -10 }}>
            <Pressable onPress={() => navigation.navigate('ListColors')} style={{ height: 55, width: 40, alignItems: 'center', justifyContent: 'center' }}>
              <AntDesign name='info' size={22} color={colors.text} />
            </Pressable>
          </View>
        )
      }
    })
  }, [])




  async function GetProducts(ref) {

    try {
      const products = await api.get(`/getproduct/ref?ref${ref}`)
      const product = products.data.find((item) => item.ref === ref)

      if (!!product) {
        setName(product.name)
        setValeuResale(product.valueResale)
        setValueRetail(product.valueRetail)

      } else {
        setName('')
        setValeuResale('')
        setValueRetail('')

      }
    } catch (error) {
      console.log(error.response);
    }

  }

  const getColorCode = (color) => {
    for (let i = 0; i < listColors.length; i++) {
      if (listColors[i].color.toUpperCase() === color.toUpperCase()) {
        return listColors[i].code;
      }
    }
    return null;
  };

  const getSizeCode = (size) => {
    for (let i = 0; i < listSizes.length; i++) {
      if (listSizes[i].size.toUpperCase() === size.toUpperCase()) {
        return listSizes[i].code;
      }
    }
    return null;
  };

  function calculateEan13Checksum(ean12) {
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



  async function RegisterProduct() {

    if (stockGrid.length < 1) {
      Toast('Preenchimento incompleto')
      return
    }

    setLoad(true)


    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credential?.token}`
    }

    stockGrid.map(async (item) => {
      try {

        await api.post('/createproduct', {
          code: item.code,
          ref: item.ref,
          name: item.name,
          size: item.size.toUpperCase(),
          color: item.color,
          stock: Number(item.stock),
          valueResale: item.valueResale,
          valueRetail: item.valueRetail
        }, { headers })

      } catch (error) {
        console.log(error.response);
        Toast(error.response.data.error)
        setLoad(false)

      } finally {
        setLoad(false)
        setCode('')
        setRef('')
        setName('')
        setSize('')
        setColor('')
        setStock('')
        setValeuResale('')
        setValueRetail('')
        setStockGrid([])
      }
    })


  }



  if (load) return <Load />

  return (
    <View style={{ flex: 1, padding: 10 }}>


      <ScrollView>

        <View style={{ height: 40, alignItems: "center", justifyContent: "center", marginVertical: 12 }}>

          {!!code ? <Animated.Text entering={FadeInDown.duration(300)} style={{ marginTop: -50, fontFamily: 'Barcode', fontSize: 85, color: '#000', alignSelf: 'center' }}>{code}</Animated.Text> :
            <Animated.Image entering={FadeInDown.duration(300)} style={{ marginTop: -20,  height: 40 }} source={require('../../../assets/images/barcode.png')} />}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input type='numeric' style={{ flex: .2 }} value={ref} setValue={setRef} title={'Ref.'} maxlength={4} />
          <Input style={{ flex: 1 }} value={name} setValue={setName} title={'Descrição'} maxlength={30} info={name?.length + '/30'} />

        </View>


        <View style={{ flexDirection: 'row' }}>
          <MaskOfInput style={{ flex: 1 }} title={'Valor Atacado'} value={valueResale} setValue={setValeuResale} mask={CurrencyMask} />
          <MaskOfInput style={{ flex: 1 }} title={'Valor Varejo'} value={valueRetail} setValue={setValueRetail} mask={CurrencyMask} />
        </View>

        <View style={{ borderRadius: 6 }}>
          <View style={{ flexDirection: 'row' }}>

            <Input style={{ flex: .5 }} value={size} setValue={setSize} title={'Tam.'} maxlength={4} info={getSizeCode(size)} />
            <Input style={{ flex: 1 }} value={color} setValue={setColor} title={'Cor'} maxlength={15} info={getColorCode(color)} />


            <Input maxlength={3} type='numeric' title={'Qtd.'} style={{ flex: .4 }} value={stock} setValue={setStock} />


            <Pressable onPress={() => {
              if (!size || !color || !stock || !code) {
                Toast('Preenchimento incompleto')
                return
              }

              if (!listSizes.find((item) => item.size === size.toUpperCase())?.code || !listColors.find((item) => item.color === color)?.code) {
                Toast('Tamanho ou cor invalida')
                return

              }

              setStockGrid(arr => [...arr, { ref, code, name, valueResale, valueRetail, size: size.toUpperCase(), color, stock }])
              setSize('')
              setColor('')
              setStock('')
              setCode('')
            }

            } style={{ flex: .3, alignItems: 'center', justifyContent: 'center', borderRadius: 6, }}>
              <AntDesign name='enter' color={colors.black} size={26} />
            </Pressable>

          </View>
        </View>

        {stockGrid.length ?
          <View style={{
            paddingVertical: 8,
            borderWidth: .4,
            borderColor: '#777',
            borderRadius: 6,
            paddingHorizontal: 12,
            marginTop: 12
          }}>

            <View style={{ flexDirection: 'row', justifyContent: "space-between", padding: 14 }}>
              <View style={{ flexDirection: 'row' }}>

                <Text style={{ fontSize: 13, width: 80, fontWeight: '300', color: '#000' }}>Código</Text>
                <Text style={{ fontSize: 13, marginLeft: 14, fontWeight: '300', color: '#000' }}>Descrição</Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '300', color: '#000' }}>Qtd.</Text>
            </View>


            {stockGrid.map((item, index) => {
              return (


                <Animated.View entering={FadeInUp.duration(200).delay(200)} key={index} style={{ flexDirection: 'row', justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 4 }}>
                  <View style={{ flexDirection: 'row' }}>

                    <Text numberOfLines={1} ellipsizeMode='head' style={{ width: 80, fontWeight: '300', color: '#000' }}>{item.code.substring(4, 12)}</Text>
                    <Text style={{ marginLeft: 14, fontWeight: '300', color: '#000' }}>{item.name} {item.size} {item.color}</Text>
                  </View>
                  <Text>{item.stock}</Text>
                </Animated.View>

              )
            })}

          </View> : null
        }

      </ScrollView>
      {stockGrid.length ? <Pressable
        style={[styles.botaoCadastrar, { backgroundColor: colors.theme }]}
        onPress={() => RegisterProduct()}
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
  dropdownButtonStyle: {
    width: 200,
    height: 50,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownButtonArrowStyle: {
    fontSize: 28,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#151E26',
  },
  dropdownItemIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
})
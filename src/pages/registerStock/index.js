import { Pressable, View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

import { useRoute, useNavigation, useTheme, useIsFocused } from '@react-navigation/native';
import { useEffect, useContext, useState } from 'react';

import Input from '../../components/Input';
import MaskOfInput from '../../components/MaskOfInput';
import { createNumberMask } from 'react-native-mask-input';

import { AppContext } from '../../contexts/appContext';

import api from '../../services/api';

import Load from '../../components/Load';

export default function RegisterStock() {

  const focus = useIsFocused()

  const CurrencyMask = createNumberMask({
    delimiter: '.',
    separator: ',',
    precision: 2,
  });

  const { credential, Toast } = useContext(AppContext)
  const route = useRoute()
  const navigation = useNavigation()
  const { colors } = useTheme()

  const [load, setLoad] = useState(false)

  const [product, setProduct] = useState({})

  const [productID, setProductID] = useState('')
  const [code, setCode] = useState('')
  const [ref, setRef] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState('')
  const [size, setSize] = useState('')
  const [stock, setStock] = useState('')
  const [stockSubtracted, setStockSubtracted] = useState('')
  const [valueResale, setValeuResale] = useState('') // valor Atacado
  const [valueRetail, setValueRetail] = useState('') // valor Varejo

  const [haveStock, setHaveStock] = useState(false)


  useEffect(() => {
    setCode(route.params?.code)
    setRef(route.params?.code?.slice(8, 12))
    setColor(getValue(route.params?.code?.slice(5, 7)))
    setSize(tamanhos[route.params?.code?.slice(7, 8)])

    navigation.setOptions({
      title: 'CB: ' + formatCodigo(route.params?.code)
    })

    
  }, [route])
  
  
  useEffect(() => {
    GetProductCode()

  },[focus])


  async function GetProductCode() {
    // Verificar se essa referencia ja esta cadastrada

    setLoad(true)

    try {
      const response = await api.get(`/getproduct/code?code=${route.params?.code}`)



      if (!!response.data?.ref) {
        setProductID(response.data?.id)
        setName(response.data?.name)
        setValeuResale(response.data?.valueResale)
        setValueRetail(response.data?.valueRetail)
        setStock(String(response.data?.stock))
        setStockSubtracted(String(response.data?.stock - (response.data?.reserved + response.data?.out)))

        setHaveStock(true)
      } else {
        setHaveStock(false)
      }



    } catch (error) {
      console.log(error.response);
    } finally {
      setLoad(false)
    }
  }


  const formatCodigo = (number) => {
    const formattedNumber = number?.replace(/\D+/g, ''); // remove todos os caracteres não numéricos
    const parts = [];
    parts.push(formattedNumber?.substring(0, 5)); // 78900
    parts.push(formattedNumber?.substring(5, 7)); // 26
    parts.push(formattedNumber?.substring(7, 8)); // 2
    parts.push(`${formattedNumber?.substring(8, 12)}`); // '4578'
    parts.push(formattedNumber?.substring(12, 13)); // 2
    return parts.join(' ');
  };


  const tamanhos = ["PP", "P", "M", "G", "GG", "XGG"]
  const cores = {
    "01": "Preto",
    "02": "Branco",
    "03": "Cinza",
    "04": "Grafite",
    "12": "Rosa",
    "13": "Pink",
    "70": "Amarelo",
  }

  function getValue(valor) {
    for (let chave in cores) {
      if (chave === valor) {
        return cores[chave];
      }
    }
    return null;
  }



  async function RegisterProduct() {
    setLoad(true)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credential?.token}`
    }

    try {
      await api.post('/createproduct', {
        code: code,
        ref: ref,
        name: name,
        color: color,
        size: size,
        stock: Number(stock),
        valueResale: valueResale,
        valueRetail: valueRetail
      }, { headers })

    } catch (error) {
      if (error.response.data.error === 'Referencia já cadastrada') {

      }
    } finally {
      setLoad(false)
    }
  }

  if(load) return <ActivityIndicator/>


  return (
    <View style={{ flex: 1, padding: 14 }}>
      <ScrollView>

        <Input editable={!haveStock} value={color} setValue={setColor} title={'Cor'} info={'cod.: ' + route.params?.code?.slice(5, 7)} />
        <Input editable={!haveStock} value={size} setValue={setSize} title={'Tamanho'} info={'cod.: ' + route.params?.code?.slice(7, 8)} />
        <Input value={name} setValue={setName} editable={!haveStock} title={'Descrição'} maxlength={40} info={name?.length + '/40'} />
        <Input type='numeric' value={stock} editable={!haveStock} setValue={setStock} title={'Entrada'} />
        {haveStock ? <Input editable={!haveStock} type='numeric' value={stockSubtracted} title={'Estoque'} /> : null}
        <MaskOfInput editable={!haveStock} title={'Valor Atacado'} value={valueResale} setValue={setValeuResale} mask={CurrencyMask} />
        <MaskOfInput editable={!haveStock} title={'Valor Varejo'} value={valueRetail} setValue={setValueRetail} mask={CurrencyMask} />
        {!haveStock ? <Pressable
          style={[style.botaoCadastrar, { backgroundColor: colors.theme }]}
          onPress={() => RegisterProduct()}
        >
          {load ? <ActivityIndicator color={'#fff'} /> :
            <Text style={{ color: '#fff', fontSize: 16 }}>Cadastrar</Text>
          }

        </Pressable> :
          <Pressable
            style={[style.botaoCadastrar, { backgroundColor: colors.theme }]}
            onPress={() => navigation.navigate("UpdateStock", { productID, ref, name, size, color, stockSubtracted, valueResale, valueRetail })}
          >
            {load ? <ActivityIndicator color={'#fff'} /> :
              <Text style={{ color: '#fff', fontSize: 16 }}>Editar</Text>
            }

          </Pressable>

        }
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  botaoCadastrar: {
    height: 55,
    borderRadius: 6,
    marginVertical: 12,
    padding: 14,
    justifyContent: "center",
    alignItems: "center"
  }
})
import { Pressable, View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import { useEffect, useContext, useState } from 'react';

import Input from '../../components/Input';
import MaskOfInput from '../../components/MaskOfInput';
import { createNumberMask } from 'react-native-mask-input';

import { AppContext } from '../../contexts/appContext';

import api from '../../services/api';

export default function UpdateStock() {

  const CurrencyMask = createNumberMask({
    delimiter: '.',
    separator: ',',
    precision: 2,
  });

  const { credential, Toast } = useContext(AppContext)
  const { params: rota } = useRoute()
  const navigation = useNavigation()
  const { colors } = useTheme()

  const [load, setLoad] = useState(false)

  const [stock, setStock] = useState('')
  const [stockSubtracted, setStockSubtracted] = useState('')
  const [valueResale, setValeuResale] = useState('') // valor Atacado
  const [valueRetail, setValueRetail] = useState('') // valor Varejo



  useEffect(() => {

    navigation.setOptions({
      title: `${rota?.name} ${rota?.size} ${rota?.color}`
    })

    setValeuResale(rota?.valueResale)
    setValueRetail(rota?.valueRetail)

  }, [rota])


  async function AddStock() {

    setLoad(true)
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credential?.token}`
    }

    try {
      await api.put(`/product/add?productID=${rota?.productID}`, {
        newAmount: Number(stock),
        valueResale,
        valueRetail
      }, { headers })

    } catch (error) {
      console.log(error.response);
    } finally {
      navigation.goBack()
      setLoad(false)
    }
  }



  return (
    <View style={{ flex: 1, padding: 14 }}>
      <ScrollView>


        <Input type='numeric' value={stock} setValue={setStock} title={'Nova Entrada'} info={`Estoque atual: ${Number(rota?.stockSubtracted) + Number(stock)}`} />
        <MaskOfInput title={'Valor Atacado'} value={valueResale} setValue={setValeuResale} mask={CurrencyMask} />
        <MaskOfInput title={'Valor Varejo'} value={valueRetail} setValue={setValueRetail} mask={CurrencyMask} />
        <Pressable
          style={[style.botaoCadastrar, { backgroundColor: colors.theme }]}
          onPress={() => AddStock()}
        >
          {load ? <ActivityIndicator color={'#fff'} /> :
            <Text style={{ color: '#fff', fontSize: 16 }}>Atualizar</Text>
          }

        </Pressable>
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
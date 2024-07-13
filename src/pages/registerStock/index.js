import { Pressable, View, Text, ScrollView } from 'react-native';

import { useRoute, useNavigation } from '@react-navigation/native';
import { useEffect, useContext, useState } from 'react';

import Input from '../../components/Input';

import { AppContext } from '../../contexts/appContext';

import api from '../../services/api';

export default function RegisterStock() {

  const { credential, Toast } = useContext(AppContext)
  const route = useRoute()
  const navigation = useNavigation()

  const [codigo, setCodigo] = useState('')
  const [referencia, setReferencia] = useState('')
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState('')
  const [tamanho, setTamanho] = useState('')
  const [entrada, setEntrada] = useState('')
  const [estoque, setEstoque] = useState('')
  const [valorAtacado, setValorAtacado] = useState('') // valor Atacado
  const [valorVarejo, setValorVarejo] = useState('') // valor Varejo

  const [temEstoque, setTemEstoque] = useState(false)


  useEffect(() => {
    setCodigo(route.params?.codigo)
    setReferencia(route.params?.codigo?.slice(8, 12))
    setCor(getValue(route.params?.codigo?.slice(3, 7)))
    setTamanho(tamanhos[route.params?.codigo?.slice(7, 8)])

    navigation.setOptions({
      title: 'CB: ' + formatCodigo(route.params?.codigo)
    })

    HandleProductRef()

  }, [route])


  async function HandleProductRef() {
    // Verificar se essa referencia ja esta cadastrada

    try {
      const response = await api.get(`/produto/codigo?codigo=${route.params?.codigo}`)

      if (!!response.data?.referencia) {
        setNome(response.data?.nome)
        setValorAtacado(response.data?.valorAtacado)
        setValorVarejo(response.data?.valorVarejo)
        setEntrada(String(response.data?.entrada))
        setEstoque(String(response.data?.entrada - (response.data?.separado + response.data?.saida)))

        setTemEstoque(true)
      } else {
        setTemEstoque(false)
      }



    } catch (error) {
      console.log(error.response);
    }
  }


  const formatCodigo = (number) => {
    const formattedNumber = number.replace(/\D+/g, ''); // remove todos os caracteres não numéricos
    const parts = [];
    parts.push(formattedNumber.substring(0, 3)); // 789
    parts.push(formattedNumber.substring(3, 7)); // 0026
    parts.push(formattedNumber.substring(7, 8)); // 2
    parts.push(`${formattedNumber.substring(8, 12)}`); // '4578'
    parts.push(formattedNumber.substring(12, 13)); // 2
    return parts.join(' ');
  };


  const tamanhos = ["PP", "P", "M", "G", "GG", "XGG"]
  const cores = {
    "0001": "Preto",
    "0002": "Branco",
    "0003": "Cinza",
    "0004": "Grafite",
    "0070": "Amarelo",
    "0026": "Teste2"
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
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credential?.token}`
    }

    try {
      await api.post('/produto', {
        codigo,
        referencia,
        nome,
        cor,
        tamanho,
        entrada: Number(entrada),
        valorAtacado,
        valorVarejo
      }, { headers })

    } catch (error) {
      if (error.response.data.error === 'Referencia já cadastrada') {
        //Atualizar produto
      }
    }
  }



  return (
    <View style={{ flex: 1, padding: 14 }}>
      <ScrollView>

        <Input colorActive='#999' editable={false} value={cor} setValue={setCor} title={'Cor'} info={'cod.: ' + route.params?.codigo?.slice(3, 7)} />
        <Input colorActive='#999' editable={false} value={tamanho} setValue={setTamanho} title={'Tamanho'} info={'cod.: ' + route.params?.codigo?.slice(7, 8)} />
        <Input value={nome} setValue={setNome} title={'Descrição'} maxlength={40} info={nome?.length + '/40'} />
        <Input type='numeric' value={entrada} setValue={setEntrada} title={'Entrada'} />
        {temEstoque ? <Input type='numeric' value={estoque} title={'Estoque'} /> : null}
        <Input type='numeric' value={valorAtacado} setValue={setValorAtacado} title={'Valor Atacado'} />
        <Input type='numeric' value={valorVarejo} setValue={setValorVarejo} title={'Valor Varejo'} />
        {!temEstoque ? <Pressable onPress={() => RegisterProduct()}><Text>Registrar</Text></Pressable> : null}
      </ScrollView>
    </View>
  );
}
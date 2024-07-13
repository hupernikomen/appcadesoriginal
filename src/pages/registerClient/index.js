import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';

import { useState, useContext } from 'react';

import api from '../../services/api';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { Masks } from 'react-native-mask-input';
import Input from '../../components/Input';
import MaskOfInput from '../../components/MaskOfInput';

import { AppContext } from '../../contexts/appContext';

export default function RegisterClient() {

  const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/]
  const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]

  const { HandleClients } = useContext(AppContext)
  const navigation = useNavigation()
  const { colors } = useTheme()
  const rota = useRoute()

  const [cpf, setCpf] = useState(rota.params?.cpf)
  const [nome, setNome] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [endereco, setEndereco] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")

  async function Register(cpf, nome, whatsapp, endereco, dataNascimento) {

    try {
      await api.post('/cliente', { cpf, nome, whatsapp, endereco, dataNascimento })
      HandleClients()
      navigation.goBack()
    } catch (error) {
      console.log(error.data);

    }
  }

  return (
    <View style={{ padding: 10 }}>

      <MaskOfInput mask={(text) => {
        if (text?.replace(/\D+/g, "")?.length <= 11) {
          return CPF_MASK
        } else {
          return CNPJ_MASK
        }
      }} type='default' title='CPF/CNPJ' value={cpf} setValue={setCpf} />
      <Input type={'default'} title="Nome" value={nome} setValue={setNome} maxlength={50} info={''} />
      <Input type={'default'} title="Endereço" value={endereco} setValue={setEndereco} maxlength={80} info={''} />
      <MaskOfInput mask={Masks.BRL_PHONE} type='default' title='Whatsapp' value={whatsapp} setValue={setWhatsapp} />
      <MaskOfInput mask={Masks.DATE_DDMMYYYY} type='default' title='Data de Nascimento' value={dataNascimento} setValue={setDataNascimento} />


      <Pressable
        style={[style.botaoCadastrar, { backgroundColor: colors.theme }]}
        onPress={() => Register(cpf, nome, whatsapp, endereco, dataNascimento)}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Cadastrar</Text>

      </Pressable>
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
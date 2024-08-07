import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

import { useState, useContext, useEffect } from 'react';

import { useRoute, useTheme } from '@react-navigation/native';
import { Masks } from 'react-native-mask-input';
import Input from '../../components/Input';
import MaskOfInput from '../../components/MaskOfInput';

import { CrudContext } from '../../contexts/crudContext';

export default function RegistraCliente() {

  const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/]
  const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]
  
  const route = useRoute()

  const { RegistraCliente } = useContext(CrudContext)
  const { colors } = useTheme()
  const [cpf_cnpj, setCpf_Cnpj] = useState("")
  const [nome, setNome] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [endereco, setEndereco] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")

  useEffect(() => {

    if(!!route.params?.cpf_cnpj) {
      setCpf_Cnpj(route.params?.cpf_cnpj)
    }

  },[route])

  return (
    <ScrollView style={{ padding: 10 }}>

      <MaskOfInput mask={(text) => {
        if (text?.replace(/\D+/g, "")?.length <= 11) {
          return CPF_MASK
        } else {
          return CNPJ_MASK
        }
      }} type='default' title='CPF/CNPJ' value={cpf_cnpj} setValue={setCpf_Cnpj} />
      <Input type={'default'} title="Nome" value={nome} setValue={setNome} maxlength={50} info={''} />
      <Input type={'default'} title="Endereço" value={endereco} setValue={setEndereco} maxlength={80} info={''} />
      <Input type={'default'} title="Bairro" value={bairro} setValue={setBairro} maxlength={40} info={''} />
      <Input type={'default'} title="Cidade" value={cidade} setValue={setCidade} maxlength={20} info={''} />
      <Input type={'default'} title="UF" value={estado} setValue={setEstado} maxlength={2} info={''} />
      <MaskOfInput mask={Masks.BRL_PHONE} type='default' title='Whatsapp' value={whatsapp} setValue={setWhatsapp} />
      <MaskOfInput mask={Masks.DATE_DDMMYYYY} type='default' title='Data de Nascimento' value={dataNascimento} setValue={setDataNascimento} />

      <Pressable
        style={[style.botaoCadastrar, { backgroundColor: colors.theme }]}
        onPress={() => RegistraCliente(cpf_cnpj, nome, endereco, bairro, cidade, estado, whatsapp, dataNascimento)}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Cadastrar</Text>

      </Pressable>
    </ScrollView>
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
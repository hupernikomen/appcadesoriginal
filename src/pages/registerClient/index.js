import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

import { useState, useContext, useEffect } from 'react';

import { useRoute, useTheme } from '@react-navigation/native';
import { Masks } from 'react-native-mask-input';
import Input from '../../components/Input';
import MaskOfInput from '../../components/MaskOfInput';

import { CrudContext } from '../../contexts/crudContext';

export default function RegisterClient() {

  const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/]
  const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]

  const { RegisterClient } = useContext(CrudContext)
  const { colors } = useTheme()
  const route = useRoute()

  const [cpf_cnpj, setCpf_Cnpj] = useState("")
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [address, setAddress] = useState("")
  const [district, setDistrict] = useState("")
  const [city, setCity] = useState("")
  const [uf, setUf] = useState("")
  const [birthDate, setBirthDate] = useState("")

  return (
    <ScrollView style={{ padding: 10 }}>

      <MaskOfInput mask={(text) => {
        if (text?.replace(/\D+/g, "")?.length <= 11) {
          return CPF_MASK
        } else {
          return CNPJ_MASK
        }
      }} type='default' title='CPF/CNPJ' value={cpf_cnpj} setValue={setCpf_Cnpj} />
      <Input type={'default'} title="Nome" value={name} setValue={setName} maxlength={50} info={''} />
      <Input type={'default'} title="Endereço" value={address} setValue={setAddress} maxlength={80} info={''} />
      <Input type={'default'} title="Bairro" value={district} setValue={setDistrict} maxlength={40} info={''} />
      <Input type={'default'} title="Cidade" value={city} setValue={setCity} maxlength={20} info={''} />
      <Input type={'default'} title="UF" value={uf} setValue={setUf} maxlength={2} info={''} />
      <MaskOfInput mask={Masks.BRL_PHONE} type='default' title='Whatsapp' value={whatsapp} setValue={setWhatsapp} />
      <MaskOfInput mask={Masks.DATE_DDMMYYYY} type='default' title='Data de Nascimento' value={birthDate} setValue={setBirthDate} />


      <Pressable
        style={[style.botaoCadastrar, { backgroundColor: colors.theme }]}
        onPress={() => RegisterClient(cpf_cnpj, name, address, district, city, uf, whatsapp, birthDate)}
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
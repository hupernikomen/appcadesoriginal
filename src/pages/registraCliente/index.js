import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

import { useState, useContext, useEffect } from 'react';

import { useRoute, useTheme } from '@react-navigation/native';
import { Masks } from 'react-native-mask-input';
import MaskOfInput from '../../components/MaskOfInput';

import { CrudContext } from '../../contexts/crudContext';

export default function RegistraCliente() {

  const CPF_MASK = [/\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "-", /\d/, /\d/]
  const CNPJ_MASK = [/\d/, /\d/, ".", /\d/, /\d/, /\d/, ".", /\d/, /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/]
  const CEP_MASK = [/\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/]

  const { params: rota } = useRoute()

  const { RegistraCliente } = useContext(CrudContext)
  const { colors } = useTheme()
  const [cpf_cnpj, setCpf_Cnpj] = useState("")
  const [nome, setNome] = useState("")
  const [CEP, setCEP] = useState("")
  const [inscricaoEstadualRg, setInscricaoEstadualRg] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [endereco, setEndereco] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")

  useEffect(() => {

    if (!!rota?.cpf_cnpj) {
      setCpf_Cnpj(rota?.cpf_cnpj)
    }

  }, [rota])

  return (
    <ScrollView style={{ padding: 10 }}>

<View style={{ flexDirection: 'row', }}>

      <MaskOfInput style={{ flex: 1 }}  mask={(text) => {
        if (text?.replace(/\D+/g, "")?.length <= 11) {
          return CPF_MASK
        } else {
          return CNPJ_MASK
        }
      }} type='numeric' title='CPF/CNPJ' value={cpf_cnpj} setValue={setCpf_Cnpj} />

      {cpf_cnpj.length > 14 ? <MaskOfInput style={{ flex: 1 }}  title='Inscrição Estadual / RG' value={inscricaoEstadualRg} setValue={setInscricaoEstadualRg} maxlength={50} /> : null}
      </View>


      <MaskOfInput title='Nome' value={nome} setValue={setNome} maxlength={50} />
      <MaskOfInput title='Endereço' value={endereco} setValue={setEndereco} maxlength={80} />

      <View style={{ flexDirection: 'row', }}>

        <MaskOfInput title='Bairro' value={bairro} setValue={setBairro} maxlength={40} style={{ flex: 2 }} />
        <MaskOfInput mask={CEP_MASK} title='CEP' value={CEP} setValue={setCEP} maxlength={80} style={{ flex: 1 }} />
      </View>
      <View style={{ flexDirection: 'row', }}>

        <MaskOfInput title='Cidade' value={cidade} setValue={setCidade} maxlength={20} style={{ flex: 2 }} />
        <MaskOfInput title='UF' value={estado} setValue={setEstado} maxlength={2} info={'Ex.: PI'} style={{ flex: 1 }} />
      </View>

      <View style={{ flexDirection: 'row', }}>

        <MaskOfInput mask={Masks.BRL_PHONE} type='numeric' title='Whatsapp' value={whatsapp} setValue={setWhatsapp} style={{ flex: 1 }} />
        <MaskOfInput mask={Masks.DATE_DDMMYYYY} type='numeric' title='Data de Nascimento' value={dataNascimento} setValue={setDataNascimento} style={{ flex: 1 }} />
      </View>

      <Pressable
        style={[style.botaoCadastrar, { backgroundColor: colors.theme }]}
        onPress={() => RegistraCliente(cpf_cnpj, nome, endereco, bairro, cidade, estado, whatsapp, dataNascimento, CEP, inscricaoEstadualRg)}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Cadastrar</Text>

      </Pressable>
    </ScrollView>
  );
}

const style = StyleSheet.create({
  botaoCadastrar: {
    height: 55,
    borderRadius: 12,
    marginVertical: 12,
    padding: 14,
    justifyContent: "center",
    alignItems: "center"
  }
})
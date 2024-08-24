import { Pressable, View, Text, FlatList, Linking } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign'

import { CrudContext } from '../../contexts/crudContext';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Icone from '../../components/Icone';

export default function ListaDeClientes() {

  const { clientes } = useContext(CrudContext)
  const navigation = useNavigation()

  const Cliente = ({ data }) => {

    const cliente = {
      cpf_cnpj: data.cpf_cnpj,
      id: data?.id,
      nome: data?.nome,
      endereco: data?.endereco,
      bairro: data?.bairro,
      cidade: data?.cidade,
      estado: data?.estado,
      dataNascimento: data?.dataNascimento,
      whatsapp: data?.whatsapp,
      CEP: data?.CEP,
      inscricaoEstadualRg: data?.inscricaoEstadualRg
    }

    return (
      <Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <Texto texto={data.nome} />
          <Texto texto={data.cpf_cnpj} tipo='Light' />
        </View>

        <View style={{ flexDirection: 'row' }}>

          <Pressable onPress={() => navigation.navigate('RegistraCliente', cliente)} >
            <Icone nomeDoIcone='create-outline' corDoIcone='#222' onpress={() => navigation.navigate('RegistraCliente', cliente)} />
          </Pressable>

          <Pressable onPress={() => Linking.openURL(`whatsapp://send?phone=55${data.whatsapp}`)} >
            <Icone nomeDoIcone='chatbubble-outline' corDoIcone='#222' onpress={() => Linking.openURL(`whatsapp://send?phone=55${data.whatsapp}`)} />
          </Pressable>
        </View>
      </Pressable>
    )
  }

  return (
    <>
      <Topo
        posicao='left'
        iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
        iconeRight={{ nome: 'add-sharp', acao: () => navigation.navigate('RegistraCliente') }}
        titulo='Clientes Cadastrados' />
      <Tela>
        <FlatList
          ItemSeparatorComponent={<View style={{ marginVertical: 6, borderColor: '#d9d9d9', borderBottomWidth: .5 }} />}
          data={clientes.sort((a, b) => a.nome.localeCompare(b.nome))}
          renderItem={({ item }) => <Cliente data={item} />}
        />
      </Tela>
    </>
  );
}
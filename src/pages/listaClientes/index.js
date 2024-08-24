import { Pressable, View, Text, FlatList } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign'

import { CrudContext } from '../../contexts/crudContext';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';

export default function ListaDeClientes() {

  const { clientes } = useContext(CrudContext)
  const navigation = useNavigation()

  const Cliente = ({ data }) => {
    return (
      <View>
        <Texto texto={data.nome} />
        <View style={{ flexDirection: 'row', alignItems: "center", gap: 4 }}>
          <AntDesign name='idcard' />
          <Texto texto={data.cpf_cnpj} tipo='Light' />
        </View>
          <Texto texto={data.id} tipo='Light' />
        <View style={{ flexDirection: 'row', alignItems: "center", gap: 4 }}>
          <AntDesign name='phone' />
          <Texto texto={data.whatsapp} tipo='Light' />
        </View>
      </View>
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
          contentContainerStyle={{ paddingVertical: 12 }}
          ItemSeparatorComponent={<View style={{ marginVertical: 12 }} />}
          data={clientes}
          renderItem={({ item }) => <Cliente data={item} />}
        />
      </Tela>
    </>
  );
}
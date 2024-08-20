import { Pressable, View, Text, FlatList } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect } from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign'

import { CrudContext } from '../../contexts/crudContext';
import Texto from '../../components/Texto';

export default function ListaDeClientes() {

  const { clientes } = useContext(CrudContext)
  const navigation = useNavigation()

  useEffect(() => {

    navigation.setOptions({
      headerRight: () => (
        <Pressable style={{ width: 45, height: 50, alignItems: "center", justifyContent: "center", marginRight: -10 }} onPress={() => navigation.navigate('RegistraCliente')}>
          <AntDesign name='plus' color='#fff' size={22} />
        </Pressable>
      )
    })
  }, [])

  const Cliente = ({ data }) => {
    return (
      <View style={{ padding: 18 }}>
        <Texto texto={data.nome} />
        <View style={{ flexDirection: 'row', alignItems: "center", gap: 4 }}>
          <AntDesign name='phone' />
          <Texto texto={data.whatsapp} tipo='Light' />
        </View>

      </View>
    )
  }

  return (
    <View>

      <FlatList
        data={clientes}
        renderItem={({ item }) => <Cliente data={item} />}
      />
    </View>
  );
}
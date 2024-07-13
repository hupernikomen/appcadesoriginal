import { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text, FlatList } from 'react-native';
import api from '../../services/api';
import { useNavigation, useTheme } from '@react-navigation/native';


export default function SalesHistory() {

  const navigation = useNavigation()
  const { colors } = useTheme()

  const [pedidos, setPedidos] = useState([])

  useEffect(() => {
    listarPedidos()
  }, [])



  async function listarPedidos() {
    try {
      const res = await api.get('/pedidos')
      setPedidos(res.data);

    } catch (error) {
      console.log(error.response);

    }
  }



  const converteData = (date) => {

    const data = new Date(date);
    const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    return formatoData.format(data);

  }

  const RenderItem = ({ item }) => {
    return (
      <Pressable style={[styles.containerPedido, { borderColor: colors.detail }]}
        onPress={() => navigation.navigate('Budget', { pedidoId: item?.id })} >

        <View style={styles.linhaDePedido}>
          <Text>Pedido: {item.id.substr(0, 6).toUpperCase()}</Text>
          <Text>{converteData(item?.createdAt)}</Text>
        </View>

        <View style={styles.linhaDePedido}>
          <Text>{item?.Cliente?.nome}</Text>
          <Text>{item?.status}</Text>
        </View>

        <View style={[styles.marcadorDoPedido, { borderColor: colors.detail }]} />
      </Pressable>
    )
  }


  return <FlatList
    data={pedidos}
    contentContainerStyle={{ gap: .5, marginVertical: 10 }}
    renderItem={({ item }) => <RenderItem item={item} />}
  />

}

const styles = StyleSheet.create({

  containerPedido: {
    borderLeftWidth: 1.5,
    marginHorizontal: 10,
    height: 70,
    backgroundColor: '#fff',
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  linhaDePedido: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  marcadorDoPedido: {
    width: 10,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    position: "absolute",
    marginLeft: -6,
    borderRadius: 6
  }
})
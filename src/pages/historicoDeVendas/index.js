import { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Pressable, Text, FlatList } from 'react-native';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';

import ContainerItem from '../../components/ContainerItem';


export default function HistoricoDeVendas() {

  const focus = useIsFocused()
  const navigation = useNavigation()
  const { credencial, Toast } = useContext(AppContext)
  const { ordemDeCompra, ListaOrdemDeCompras } = useContext(CrudContext)

  useEffect(() => {
    ListaOrdemDeCompras()
  }, [focus])


  const converteData = (date) => {
    const data = new Date(date);
    const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return formatoData.format(data);

  }

  const RenderItem = ({ item }) => {

    return (

      <ContainerItem opacidade={item.estado === 'Entregue' ? .9 : 1} onpress={() => {
        if (credencial.cargo === 'Socio' || credencial.cargo === 'Gerente') {
          navigation.navigate('Orcamento', { ordemDeCompraID: item.id })

        } else if (credencial.cargo === 'Vendedor' && item.estado === "Aberto" || item.estado === "Criado") {
          navigation.navigate('Orcamento', { ordemDeCompraID: item.id })

        } else {
          Toast("Acesso Negado")
        }
      }}>
        
        <View style={{ flex: 1, opacity: item.estado === 'Entregue' ? .5 : 1 }}>
          <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between" }}>

            <Text style={styles.pedidoText}>Pedido {item?.estado} - {item.id.substr(0, 6).toUpperCase()}</Text>
            <Text numberOfLines={1} style={[styles.pedidoText]}>{converteData(item?.criadoEm)}</Text>
          </View>
          <Text numberOfLines={1} style={[styles.pedidoText]}>Cliente: {item?.cliente?.nome}</Text>
        </View>

      </ContainerItem>

    )
  }


  function ordenarListaPorEstado(lista) {
    const estados = { Aberto: 0, Criado: 1, Separado: 2, Entregue: 3 };
    return lista.sort((a, b) => estados[a.estado] - estados[b.estado]);
  }


  return (
    <View style={{ flex: 1 }}>

      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
        data={ordenarListaPorEstado(ordemDeCompra)}
        renderItem={({ item }) => <RenderItem item={item} />}
      />

    </View>
  )

}

const styles = StyleSheet.create({

  containerPedido: {
    borderLeftWidth: 1.5,
  },
  marcadorDoPedido: {
    width: 10,
    aspectRatio: 1,
    backgroundColor: '#f1f1f1',
    borderWidth: 2,
    position: "absolute",
    marginLeft: -9,
    borderRadius: 6,
  },
  pedidoText: {
    fontWeight: '300',
    color: '#222',
    marginLeft: 6,
    fontFamily: 'Roboto-Light',
  },

})
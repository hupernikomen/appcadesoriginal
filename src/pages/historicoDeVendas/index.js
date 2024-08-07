import { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Pressable, Text, FlatList } from 'react-native';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import SelectDropdown from 'react-native-select-dropdown';

import AntDesign from 'react-native-vector-icons/AntDesign'
import ContainerItem from '../../components/containerItem';


export default function HistoricoDeVendas() {

  const focus = useIsFocused()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { credencial, Toast } = useContext(AppContext)
  const { ordemDeCompra, ListaOrdemDeCompras } = useContext(CrudContext)

  console.log(ordemDeCompra);


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

      <ContainerItem onpress={() => {
        if (credencial.cargo === 'Socio' || credencial.cargo === 'Gerente') {
          navigation.navigate('Orcamento', { ordemDeCompra: item, estadoOrdemDeCompra: item.estado, cliente: item.cliente })

        } else if (credencial.cargo === 'Vendedor' && item.estado === "Aberto" || item.estado === "Criado") {
          navigation.navigate('Orcamento', { ordemDeCompra: item })

        } else {
          Toast("Acesso Negado")
        }
      }}>
        <View style={{ flex: 1 }}>
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

  dropdownButtonStyle: {
    width: 180,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '300',
    color: '#fff',
    textAlign: "right"
  },


  dropdownItemStyle: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 16,
    color: '#151E26',
  },
})
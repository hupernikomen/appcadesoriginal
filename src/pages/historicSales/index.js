import { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Pressable, Text, FlatList } from 'react-native';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import SelectDropdown from 'react-native-select-dropdown';

import AntDesign from 'react-native-vector-icons/AntDesign'


export default function SalesHistory() {

  const focus = useIsFocused()
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { credential, Toast } = useContext(AppContext)
  const { AllSalesform, salesform } = useContext(CrudContext)
  const [stateSalesform, setStateSalesform] = useState('')
  const statusList = ["Aberto", "Criado", "Separado", "Entregue"]


  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Dropdown />
        )
      }
    })

  }, [])

  useEffect(() => {
    AllSalesform()

  }, [focus])


  const converteData = (date) => {
    const data = new Date(date);
    const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return formatoData.format(data);

  }

  const RenderItem = ({ item }) => {
    return (
      <View style={[styles.containerPedido, { borderColor: colors.theme }]}>

        <View style={{
          backgroundColor: '#f3f3f3',
          elevation: 5,
          flexDirection: 'row',
          padding: 14,
          height: 80,
          margin: 1,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#fff',
        }}>

          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              if (credential.type === 'Owner') {
                navigation.navigate('Budget', { salesformID: item?.id, stateSalesform: item.state, client: item.client })

              } else if (credential.type === 'Vendedor' && item.state === "Aberto") {
                navigation.navigate('Budget', { salesformID: item?.id })

              } else {
                Toast("Acesso Negado")
              }
            }} >

            <View>
              <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between" }}>

                <Text style={styles.pedidoText}>Pedido {item?.state} - {item.id.substr(0, 6).toUpperCase()}</Text>
                <Text numberOfLines={1} style={[styles.pedidoText]}>{converteData(item?.createdAt)}</Text>
              </View>
              <Text numberOfLines={1} style={[styles.pedidoText]}>Cliente: {item?.client?.name}</Text>
            </View>


          </Pressable>
          <View style={[styles.marcadorDoPedido, { borderColor: colors.theme }]} />

        </View>

      </View>
    )
  }



  const Dropdown = () => {
    return (
      <SelectDropdown
        data={statusList}
        onSelect={(selectedItem, index) => {
          setStateSalesform(selectedItem, index);
        }}
        renderButton={(selectedItem, isAbertoed) => {
          return (
            <View style={styles.dropdownButtonStyle}>

              <Text style={styles.dropdownButtonTxtStyle}>
                {(selectedItem && selectedItem) || <AntDesign name='filter' size={20} color={colors.text} />}
              </Text>
            </View>
          );
        }}
        renderItem={(item, index, isSelected) => {
          return (
            <View style={{ ...styles.dropdownItemStyle, ...(isSelected && { backgroundColor: '#D2D9DF' }) }}>
              <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    )
  }


  return (
    <View style={{ flex: 1 }}>

      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
        data={stateSalesform ? salesform.filter((item) => item.state === stateSalesform) : salesform}
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
    marginLeft: 6
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
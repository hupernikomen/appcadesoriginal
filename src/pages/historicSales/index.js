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
  const [stateSalesform, setStateSalesform] = useState('Created')
  const statusList = ["Open", "Created", "Reserved", "Concluded"]


  useEffect(() => {

    // VERIFICAR QUAL TIPO DE CONTA E DEFINIR TIPO DE VIZUALIZAÇÃO INCIAL PARA CADA USUARIO
    switch (credential.type) {
      case 'Vendedor':
        setStateSalesform('Open')

        break;
      case 'Manager':
        setStateSalesform('Created')
        navigation.setOptions({
          headerRight: () => {
            return (
              <Dropdown />
            )
          }
        })

        break;
      case 'Owner':
        setStateSalesform('Reserved')
        navigation.setOptions({
          headerRight: () => {
            return (
              <Dropdown />
            )
          }
        })

        break;

      default:
        break;
    }


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
      <View style={[styles.containerPedido, { borderColor: colors.detail }]}>

        <View style={{
          backgroundColor: '#fff',
          flexDirection: 'row',
          padding: 14,
          alignItems: 'center'
        }}>

          <Pressable
            style={{ borderRadius: 6, flex: 1 }}
            onPress={() => {
              if (credential.type === 'Owner') {
                navigation.navigate('Budget', { salesformID: item?.id, stateSalesform: item.state })

              } else if (credential.type === 'Vendedor' && item.state === "Open") {
                navigation.navigate('Budget', { salesformID: item?.id })

              } else {
                Toast("Acesso Negado")
              }
            }} >

            <View style={styles.linhaDePedido}>
              <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between" }}>

                <Text style={styles.pedidoText}>Pedido {item?.state} - {item.id.substr(0, 6).toUpperCase()}</Text>
                <Text numberOfLines={1} style={[styles.pedidoText]}>{converteData(item?.createdAt)}</Text>
              </View>
              <Text numberOfLines={1} style={[styles.pedidoText]}>Cliente: {item?.client?.name}</Text>
            </View>


          </Pressable>
          <View style={[styles.marcadorDoPedido, { borderColor: colors.detail }]} />

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
        renderButton={(selectedItem, isOpened) => {
          return (
            <View style={styles.dropdownButtonStyle}>

              <Text style={styles.dropdownButtonTxtStyle}>
                {(selectedItem && selectedItem) || <AntDesign name='filter' size={20} />}
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
    <FlatList
      data={salesform.filter((item) => item.state === stateSalesform)}
      renderItem={({ item }) => <RenderItem item={item} />}
    />
  )

}

const styles = StyleSheet.create({

  containerPedido: {
    borderLeftWidth: 1.5,
    marginHorizontal: 10,
    padding: 6
  },
  marcadorDoPedido: {
    width: 10,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    position: "absolute",
    marginLeft: -12,
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
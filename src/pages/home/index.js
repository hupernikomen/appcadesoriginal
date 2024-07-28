import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useContext, useEffect } from 'react';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';

import AntDesign from 'react-native-vector-icons/AntDesign'
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import { FlatList } from 'react-native-gesture-handler';

export default function Home() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const focus = useIsFocused()

  const { credential, signOut } = useContext(AppContext)
  const { clients, salesform, AllSalesform, GetProductsAll, stockAmount } = useContext(CrudContext)


  useEffect(() => {
    Promise.all([AllSalesform(), GetProductsAll()])

  }, [focus])



  function Button({ icon, name, notification, action, disabled }) {

    if (disabled) return

    return (
      <Pressable
        disabled={disabled}
        style={stl.buttons}
        onPress={() => navigation.navigate(action)}>

        <AntDesign name={icon} size={26} color={colors.black} />

        {notification > 0 ?
          <Text style={[stl.notification, { backgroundColor: colors.theme }]}>{notification}</Text> :
          null}

        <Text style={[stl.textbutton, { color: colors.black }]}>{name}</Text>

      </Pressable>
    )
  }

  const buttonsInfo = [
    { icon: 'swap', name: 'Vendas', notification: '', action: 'Sale' },
    { icon: 'profile', name: 'Histórico', notification: salesform.filter(item => item.state === 'Reserved').length, action: 'SalesHistory' },
    { icon: 'user', name: 'Clientes', notification: clients.length, action: 'RegisterClient', disabled: credential?.type === 'Manager' },
    { icon: 'skin', name: 'Estoque', notification: stockAmount, action: 'RegisterStock', disabled: credential?.type === 'Manager' },
    // { icon: 'barschart', name: 'Números', notification: '', action: 'Analytics', disabled: credential?.type !== 'Owner' }
  ]

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>

      {credential?.token ?
        <FlatList
          data={buttonsInfo}
          numColumns={2}
          contentContainerStyle={{ flex: 1, alignItems: 'flex-start', justifyContent: "center", padding: 25 }}
          columnWrapperStyle={{
            gap: 2,
            marginBottom: 2
          }}
          renderItem={({ item }) => {
            return (
              <Button
                icon={item.icon}
                name={item.name}
                notification={item.notification.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                action={item.action}
                disabled={item.disabled}
              />
            )
          }}
        /> :
        <Button
          icon={'key'}
          name={'Acessar o CadesSG'}
          action={'Login'} />

      }
    </View >
  );
}



const stl = StyleSheet.create({
  buttons: {
    backgroundColor: '#f3f3f3',
    elevation: 6,
    width: 130,
    height: 130,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#fff',
    padding: 12
  },
  textbutton: {
    fontSize: 14,
    textAlign: 'center',
    color: '#222',
    fontWeight: '300'
  },
  notification: {
    fontSize: 10,
    textAlign: 'center',
    position: "absolute",
    paddingHorizontal: 4,
    borderRadius: 6,
    left: '62%',
    top: 26,
    color: '#fff'
  }

})
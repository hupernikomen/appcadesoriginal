import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useContext, useEffect } from 'react';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';

import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import { FlatList } from 'react-native-gesture-handler';

export default function Home() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const focus = useIsFocused()

  const { credential, signOut } = useContext(AppContext)
  const { clients, salesform, AllSalesform } = useContext(CrudContext)

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        credential?.token ?
          (
            <>
              <Pressable onPress={() => signOut()}>
                <AntDesign name={'user'} size={22} color='#fff' />
              </Pressable>
              <View style={{ position: 'absolute', bottom: -6, right: -6 }}>
                <FontAwesome name={'check'} size={18} color='#33cc33' />
              </View>
            </>
          )
          : null
    })

  }, [credential])

  useEffect(() => {
    AllSalesform()
  }, [focus])


  function Button({ icon, name, notification, action, disabled }) {
    return (
      <Pressable
        disabled={disabled}
        style={style.buttons}
        onPress={() => navigation.navigate(action)}>

        <View>
          <AntDesign name={icon} size={28} color='#333' />
          {notification > 0 ?
            <Text style={style.notification}>{notification}</Text> :
            null}
        </View>

        <Text style={style.textbutton}>{name}</Text>

      </Pressable>
    )
  }


  const buttonsInfo = [
    { icon: 'swap', name: 'Vendas', notification: '', action: 'Sale', disabled: '' },
    { icon: 'profile', name: 'Histórico', notification: salesform.filter(item => item.state === 'Reserved').length, action: 'SalesHistory', disabled: '' },
    { icon: 'adduser', name: 'Clientes', notification: clients.length, action: 'RegisterClient', disabled: credential.type === 'Vendedor' },
    { icon: 'barcode', name: 'Consulta', notification: '', action: 'Scanner', disabled: credential.type === 'Vendedor' }
  ]

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>

      {credential?.token ?
        //  Aumentando o numero de botoes, aumente o valor de height abaixo

        <FlatList
          data={buttonsInfo}
          numColumns={2}
          contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: "center" }}
          columnWrapperStyle={{
            gap: 6, marginBottom: 6
          }}
          renderItem={({ item }) => {
            return (
              <Button
                icon={item.icon}
                name={item.name}
                notification={item.notification}
                action={item.action} />
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



const style = StyleSheet.create({
  buttons: {
    backgroundColor: "#fff",
    elevation: 3,
    width: 120,
    height: 120,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12
  },
  textbutton: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
    fontWeight: '300'
  },
  notification: {
    fontSize: 11,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#222',
    position: "absolute",
    paddingHorizontal: 8,
    borderRadius: 6,
    right: -12,
    top: -8
  }

})
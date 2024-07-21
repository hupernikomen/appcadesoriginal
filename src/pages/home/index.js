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
  const { clients, salesform, AllSalesform, GetProductsAll, stockAmount } = useContext(CrudContext)

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        credential?.token ?
          (
            <>
              <Pressable onPress={() => signOut()}>
                <AntDesign name={'key'} size={22} color='#222' />
              </Pressable>
            </>
          )
          : null


    })



  }, [credential])

  useEffect(() => {
    Promise.all([AllSalesform(), GetProductsAll()])

  }, [focus])



  function Button({ icon, name, notification, action, disabled }) {
    return (
      <Pressable
        disabled={disabled}
        style={style.buttons}
        onPress={() => navigation.navigate(action)}>

        <View>
          <AntDesign name={icon} size={28} color='#333' />
        </View>
          {notification > 0 ?
            <Text style={[style.notification, { borderColor: colors.detail, color: colors.detail }]}>{notification}</Text> :
            null}

        <Text style={style.textbutton}>{name}</Text>

      </Pressable>
    )
  }


  const buttonsInfo = [
    { icon: 'swap', name: 'Vendas', notification: '', action: 'Sale', disabled: '' },
    { icon: 'profile', name: 'Histórico', notification: salesform.filter(item => item.state === 'Reserved').length, action: 'SalesHistory', disabled: '' },
    { icon: 'user', name: 'Clientes', notification: clients.length, action: 'RegisterClient', disabled: credential.type === 'Vendedor' },
    { icon: 'skin', name: 'Estoque', notification: stockAmount, action: 'RegisterStock', disabled: credential.type === 'Vendedor' }
  ]

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>

      {credential?.token ?
        //  Aumentando o numero de botoes, aumente o valor de height abaixo
        <FlatList
          data={buttonsInfo}
          numColumns={2}
          contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: "center", padding:25 }}
          columnWrapperStyle={{
            gap: .5, 
            marginBottom:.5
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
    elevation: 2,
    width: 130,
    height: 130,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
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
    textAlign:'center',
    borderWidth: 1,
    backgroundColor: '#fff',
    position: "absolute",
    paddingHorizontal: 3,
    borderRadius: 6,
    right: 45,
    top: 28
  }

})
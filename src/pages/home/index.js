import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useContext, useEffect } from 'react';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';

import Feather from 'react-native-vector-icons/AntDesign'
import Material from 'react-native-vector-icons/MaterialCommunityIcons'
import { AppContext } from '../../contexts/appContext';

export default function Home() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const focus = useIsFocused()

  const { credential, signOut, clients } = useContext(AppContext)

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        credential?.token ?
          (
            <Pressable onPress={() => { }}>
              <Feather name={'user'} size={22} color='#fff' />
            </Pressable>
          )
          : null
    })

  }, [credential])



  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
          <View style={{
            elevation: 3,
            position: 'absolute',
            top: 2,
            right: 14,
            backgroundColor: colors.theme,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderTopLeftRadius: 15,
            borderBottomEndRadius: 15,
            borderBottomStartRadius: 15,
          }}>
            <Pressable onPress={() => signOut()}>
              <Text style={{ color: "#fff", fontSize: 12 }}>Conta {credential?.tipo} - Sair</Text>
            </Pressable>
          </View>
      {credential?.token ?
        <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>



          <View style={{ flexDirection: "row", gap: 6, marginVertical: 3 }}>

            <Pressable style={style.botoes} onPress={() => navigation.navigate('Sale')}>
              <Feather name={'shoppingcart'} size={28} color='#333' />
              <Text style={style.textobotao}>Vendas</Text>
            </Pressable>

            <Pressable style={style.botoes} onPress={() => navigation.navigate('SalesHistory')}>
              <Feather name={'profile'} size={28} color='#333' />
              <Text style={style.textobotao}>Histórico</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", gap: 6, marginVertical: 3 }}>
            <Pressable style={style.botoes} onPress={() => navigation.navigate('RegisterClient')}>
              <View>
                <Feather name={'adduser'} size={28} color='#333' />
                <View style={{borderRadius:10, position: 'absolute', left:20, top: -8, backgroundColor: colors.detail, paddingHorizontal:6 }}>

                  <Text style={{color:'#fff', fontSize:10}}>{clients.length}</Text>
                </View>
              </View>

              <Text style={style.textobotao}>Clientes</Text>
            </Pressable>

            <Pressable style={style.botoes} onPress={() => navigation.navigate('Scanner')}>
              <Feather name={'barcode'} size={28} color='#333' />
              <Text style={style.textobotao}>Consulta</Text>
            </Pressable>

          </View>

        </View> :
        <Pressable style={style.botoes} onPress={() => navigation.navigate('Login')}>
          <Feather name={'key'} size={26} color='#333' />
          <Text style={style.textobotao}>Acessar o CadesSG</Text>
        </Pressable>

      }
    </View>
  );
}



const style = StyleSheet.create({
  botoes: {
    backgroundColor: "#fff",
    elevation: 3,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: "center",
    borderRadius: 6,
    padding: 16

  },
  inputs: {
    borderRadius: 50,
    height: 50,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#222',
    paddingHorizontal: 22,
    flex: 1
  },
  textobotao: {
    fontSize: 13,
    textAlign: 'center',
    color: '#222',
    marginTop: 12,
    fontWeight: '300'
  },

})
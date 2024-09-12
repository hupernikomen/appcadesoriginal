import { useNavigation, useTheme } from '@react-navigation/native'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { useContext } from 'react'

import { CredencialContext } from '../../contexts/credencialContext'

import AntDesign from 'react-native-vector-icons/AntDesign'

import { View, Text, Pressable } from 'react-native'
import Texto from '../Texto'


export default function DrawerCustom(props) {

  const navigation = useNavigation()
  const { colors } = useTheme()
  const { autenticado, credencial, signOut } = useContext(CredencialContext)


  return (
    <DrawerContentScrollView {...props}>

      <View style={{ flex: 1, backgroundColor: colors.detalhe }}>
        {!!autenticado ?

          <View style={{ padding: 16, flexDirection: 'row', alignItems: "center", gap: 12 }}>
            <AntDesign name='user' color={'#fff'} size={36} />
            <View>
              <Texto cor='#fff' tipo='Regular' texto={credencial.nome} />
              <Pressable onPress={() => signOut()}>
                <Texto cor='#fff' tipo='Light' texto={'Sair'} />
              </Pressable>
            </View>
          </View>
          :
          <DrawerItem
            label="Login"
            onPress={() => navigation.navigate("Login")}
          />
        }

        <View style={{ borderTopWidth: .5, borderColor: '#333' }}>
          <DrawerItem
            label="Home"
            inactiveTintColor='#fff'
            labelStyle={{ fontFamily: 'Roboto-Light' }}
            onPress={() => navigation.navigate("Home")}
          />

        </View>

      </View>
        <View style={{ padding: 16 }}>
          <Texto cor='#aaa' tipo='Light' texto={'Desenvolvido por:'} tamanho={12} />
          <Texto cor='#fff' tipo='Light' texto={'Wilson Ramos'} />
        </View>


    </DrawerContentScrollView>
  );
}

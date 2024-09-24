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
    <DrawerContentScrollView  {...props} >

      {autenticado ? <View style={{ flex: 1, backgroundColor: colors.background }}>


        <View style={{ padding: 16, flexDirection: 'row', alignItems: "center", gap: 12 }}>
          <View>
            <Texto cor='#000' tipo='Light' texto={credencial.nome} />
            <Pressable onPress={() => signOut()}>
              <Texto cor='#000' tipo='Light' tamanho={13} texto={'Sair'} />
            </Pressable>
          </View>
        </View>



        <View style={{ borderTopWidth: .5, borderColor: '#999', gap: .5 }}>
          <DrawerItem
            label="Home"
            inactiveTintColor='#000'
            labelStyle={{ fontFamily: 'Roboto-Light' }}
            onPress={() => navigation.navigate("Home")}
          />

        </View>

      </View>
        :
        null
      }



    </DrawerContentScrollView>
  );
}

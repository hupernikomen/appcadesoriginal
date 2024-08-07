import { useNavigation } from '@react-navigation/native'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { useContext } from 'react'
import { AppContext } from '../../contexts/appContext'

import AntDesign from 'react-native-vector-icons/AntDesign'

import { View, Text, Pressable } from 'react-native'

export default function DrawerCustom(props) {

  const navigation = useNavigation()
  const { autenticado, credencial, signOut } = useContext(AppContext)


  return (
    <DrawerContentScrollView {...props}>




      <View>
        {!!autenticado ?

          <View style={{ padding: 16, flexDirection: 'row', alignItems: "center", gap: 6 }}>
            <AntDesign name='user' color={'#fff'} size={36} />
            <View>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>{credencial.nome}</Text>
              <Pressable onPress={() => signOut()}>
                <Text style={{ color: '#fff', fontWeight: '300', fontSize:13 }}>Sair</Text>
              </Pressable>
            </View>
          </View>
          :
          <DrawerItem
            label="Login"
            onPress={() => navigation.navigate("Login")}
          />
        }


        <View style={{ borderTopWidth: .5, borderColor: '#ff9980' }}>

          {/* PAGES */}

          <DrawerItem
            label="Home"
            onPress={() => navigation.navigate("Home")}
          />

        </View>

      </View>


    </DrawerContentScrollView>
  );
}

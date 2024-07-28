import { useNavigation } from '@react-navigation/native'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { useContext } from 'react'
import { AppContext } from '../../contexts/appContext'

import AntDesign from 'react-native-vector-icons/AntDesign'

import { View, Text, Pressable } from 'react-native'

export default function DrawerCustom(props) {

  const navigation = useNavigation()
  const { authenticate, credential, signOut } = useContext(AppContext)


  return (
    <DrawerContentScrollView {...props}>




      <View>
        {!!authenticate ?

          <View style={{ padding: 16, flexDirection: 'row', alignItems: "center", gap: 6 }}>
            <AntDesign name='user' color={'#222'} size={36} />
            <View>
              <Text style={{ color: '#222', fontSize: 16, fontWeight: '500' }}>{credential.name}</Text>
              <Pressable onPress={() => signOut()}>
                <Text style={{ color: '#222', fontWeight: '300' }}>Sair</Text>
              </Pressable>
            </View>
          </View>
          :
          <DrawerItem
            label="Login"
            onPress={() => navigation.navigate("Login")}
          />
        }


        <View style={{ borderTopWidth: .5, borderColor: '#aaa' }}>

          <DrawerItem
            label="Home"
            onPress={() => navigation.navigate("Home")}
          />

        </View>

      </View>


    </DrawerContentScrollView>
  );
}

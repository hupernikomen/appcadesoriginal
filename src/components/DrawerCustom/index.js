import { useContext } from 'react';
import { StyleSheet } from 'react-native';

import { useNavigation, useTheme } from '@react-navigation/native'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { AppContext } from '../../contexts/appContext';

export default function DrawerCustom(props) {

    const { } = useContext(AppContext)
    const navigation = useNavigation()
    const { } = useTheme()

    return (
        <DrawerContentScrollView {...props}>

            <DrawerItem
                // icon={() => <Ionicons name={'home-outline'} size={18} color={'#fff'} />}
                // labelStyle={style.social}
                // inactiveTintColor={colors.text}
                label="Home"
                onPress={() => navigation.navigate("Home")}
            />

            {/* <View style={style.pages}>


        {authenticated ?
          <View style={style.authenticated}>
            <DrawerItem
              icon={() => <Ionicons name={'log-in-outline'} size={18} color={'#fff'} />}
              labelStyle={style.social}
              label="Minha Página"
              inactiveTintColor={colors.text}
              onPress={() => navigation.navigate('Redirect')}
            />

            <DrawerItem
              icon={() => <Ionicons name={'key-outline'} size={18} color={'#fff'} />}
              labelStyle={style.social}
              label="Alterar Senha"
              inactiveTintColor={colors.text}
              onPress={() => navigation.navigate('Senha')}
            />
            <DrawerItem
              icon={() => <Ionicons name={'power-outline'} size={18} color={'#fff'} />}
              labelStyle={style.social}
              label="Sair"
              inactiveTintColor={colors.text}
              onPress={signOut}
            />
          </View>
          :
          <DrawerItem
            icon={() => <Ionicons name={'log-in-outline'} size={18} color={'#fff'} />}
            labelStyle={style.social}
            label="Login"
            inactiveTintColor={colors.text}
            onPress={() => navigation.navigate("Signin")}
          />
        }

      </View> */}


        </DrawerContentScrollView>
    );
}

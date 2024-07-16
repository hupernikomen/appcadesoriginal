import { useNavigation } from '@react-navigation/native'
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'

export default function DrawerCustom(props) {

    const navigation = useNavigation()

    return (
        <DrawerContentScrollView {...props}>

            <DrawerItem
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

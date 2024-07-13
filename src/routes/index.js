import { Dimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useTheme } from '@react-navigation/native';
import HomeStack from './stacks';
import DrawerCustom from '../components/DrawerCustom';

const Drawer = createDrawerNavigator()

export default function Routes() {
  const WIDTH = Dimensions.get('window').width
  const { colors } = useTheme()

  return (
    <Drawer.Navigator
      drawerContent={DrawerCustom}
      initialRouteName='HomeScreen'
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
        headerTintColor: '#fff',
        drawerType: 'back',
        drawerStyle: {
          width: WIDTH - 22,
          backgroundColor: colors.theme,
        }
      }}>
      <Drawer.Screen name='HomeScreen' component={HomeStack} />
    </Drawer.Navigator>

  )
}
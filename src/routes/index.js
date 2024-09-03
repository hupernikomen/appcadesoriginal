import { Dimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useTheme } from '@react-navigation/native';
import HomeStack from './stacks';
import MenuLateral from '../components/MenuLateral';

const Drawer = createDrawerNavigator()

export default function Routes() {
  const { width } = Dimensions.get('window')
  const { colors } = useTheme()

  return (
    <Drawer.Navigator
      drawerContent={MenuLateral}
      initialRouteName='HomeScreen'
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
        drawerType: 'slide',
        drawerStyle: {
          width: width - 80,
          backgroundColor: colors.theme,

        }
      }}>
      <Drawer.Screen name='HomeScreen' component={HomeStack} />
    </Drawer.Navigator>

  )
}
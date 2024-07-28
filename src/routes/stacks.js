import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@react-navigation/native';

const Stack = createNativeStackNavigator()

import Home from '../pages/home';
import RegisterStock from '../pages/registerStock';
import RegisterClient from '../pages/registerClient';
import Login from '../pages/login';
import SalesHistory from '../pages/historicSales';
import Sale from '../pages/sale';
import Budget from '../pages/budget';
import Scanner from '../pages/scanner';
import UpdateStock from '../pages/updateStock';
import UpdateItemBudget from '../pages/updateItemBudget';
import Analytics from '../pages/analytics';
import ListColors from '../pages/listColors';

export default function RotasStack() {
    const { colors } = useTheme()

    return (
        <Stack.Navigator
            initialRouteName={'Home'}
            screenOptions={{
                headerTintColor: colors.text,
                orientation: 'portrait',
                headerTitleStyle: { fontSize: 20 },
                headerStyle: { backgroundColor: colors.theme },
            }}>

            <Stack.Screen name='Home' component={Home} options={{ title: 'SG Cades Original', headerTitleAlign: 'center' }} />
            <Stack.Screen name='RegisterStock' component={RegisterStock} options={{ title: 'Cadastro de Estoque' }} />
            <Stack.Screen name='RegisterClient' component={RegisterClient} options={{ title: 'Cadastro de Clientes' }} />
            <Stack.Screen name='Login' component={Login} options={{ title: '' }} />
            <Stack.Screen name='SalesHistory' component={SalesHistory} options={{ title: 'Histórico' }} />
            <Stack.Screen name='Sale' component={Sale} options={{ title: 'Vendas' }} />
            <Stack.Screen name='Budget' component={Budget} />
            <Stack.Screen name='Scanner' component={Scanner} options={{ title: 'Scanner' }} />
            <Stack.Screen name='UpdateStock' component={UpdateStock} options={{ title: 'Atualiza Estoque' }} />
            <Stack.Screen name='UpdateItemBudget' component={UpdateItemBudget} options={{ title: '' }} />
            <Stack.Screen name='Analytics' component={Analytics} />
            <Stack.Screen name='ListColors' component={ListColors} options={{ title: 'Lista de Cores' }} />



        </Stack.Navigator>

    )
}
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@react-navigation/native';

const Stack = createNativeStackNavigator()

import Home from '../pages/home';
import RegistraEstoque from '../pages/registraEstoque';
import RegistraCliente from '../pages/registraCliente';
import Login from '../pages/login';
import HistoricoDeVendas from '../pages/historicoDeVendas';
import HomeDeVendas from '../pages/homeDeVendas';
import Orcamento from '../pages/orcamento';
import Scanner from '../pages/scanner';
import ListaDeCores from '../pages/listaDeCores';
import ListaDeClientes from '../pages/listaClientes';
import FinalizaVenda from '../pages/finalizaVenda';
import BarrasPonto from '../pages/barrasPonto';
import ListaEstoque from '../pages/listaEstoque';
import DetalheEstoque from '../pages/detalheEstoque';
import DetalheCliente from '../pages/detalheCliente';

export default function RotasStack() {
    const { colors } = useTheme()

    return (
        <Stack.Navigator
            initialRouteName={'Home'}
            screenOptions={{
                headerTintColor: colors.fundo,
                orientation: 'portrait',
                headerTitleStyle: { fontSize: 18, fontFamily: 'Roboto-Medium' },
                headerStyle: { backgroundColor: colors.theme },
                headerShown: false,
            }}>

            <Stack.Screen name='Home' component={Home} />
            <Stack.Screen name='RegistraEstoque' component={RegistraEstoque} />
            <Stack.Screen name='RegistraCliente' component={RegistraCliente} />
            <Stack.Screen name='Login' component={Login} />
            <Stack.Screen name='HistoricoDeVendas' component={HistoricoDeVendas} />
            <Stack.Screen name='HomeDeVendas' component={HomeDeVendas} />
            <Stack.Screen name='Orcamento' component={Orcamento} />
            <Stack.Screen name='Scanner' component={Scanner} />
            <Stack.Screen name='ListaDeCores' component={ListaDeCores} />
            <Stack.Screen name='ListaDeClientes' component={ListaDeClientes} />
            <Stack.Screen name='FinalizaVenda' component={FinalizaVenda} />
            <Stack.Screen name='BarrasPonto' component={BarrasPonto} />
            <Stack.Screen name='ListaEstoque' component={ListaEstoque} />
            <Stack.Screen name='DetalheEstoque' component={DetalheEstoque} />
            <Stack.Screen name='DetalheCliente' component={DetalheCliente} />

        </Stack.Navigator>

    )
}
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

export default function RotasStack() {
    const { colors } = useTheme()

    return (
        <Stack.Navigator
            initialRouteName={'Home'}
            screenOptions={{
                headerTintColor: colors.text,
                orientation: 'portrait',
                headerTitleStyle: { fontSize: 18, fontFamily:'Roboto-Medium' },
                headerStyle: { backgroundColor: colors.theme },
            }}>

            <Stack.Screen name='Home' component={Home} options={{ title: 'SG Cades Original', headerTitleAlign: 'center' }} />
            <Stack.Screen name='RegistraEstoque' component={RegistraEstoque} options={{ title: 'Cadastro de Estoque' }} />
            <Stack.Screen name='RegistraCliente' component={RegistraCliente} options={{ title: 'Cadastro de Clientes' }} />
            <Stack.Screen name='Login' component={Login} options={{ title: '' }} />
            <Stack.Screen name='HistoricoDeVendas' component={HistoricoDeVendas} options={{ title: 'Histórico de Vendas' }} />
            <Stack.Screen name='HomeDeVendas' component={HomeDeVendas} options={{ title: 'Vendas' }} />
            <Stack.Screen name='Orcamento' component={Orcamento} />
            <Stack.Screen name='Scanner' component={Scanner} options={{ title: 'Scanner' }} />
            <Stack.Screen name='ListaDeCores' component={ListaDeCores} options={{ title: 'Lista de Cores' }} />
            <Stack.Screen name='ListaDeClientes' component={ListaDeClientes} options={{ title: 'Clientes Cadastrados' }} />
            <Stack.Screen name='FinalizaVenda' component={FinalizaVenda} options={{ title: '' }} />
            <Stack.Screen name='BarrasPonto' component={BarrasPonto} options={{ title: '' }} />
            <Stack.Screen name='ListaEstoque' component={ListaEstoque} options={{ title: 'Estoque' }} />



        </Stack.Navigator>

    )
}
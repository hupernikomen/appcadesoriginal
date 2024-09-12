import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '@react-navigation/native';

const Stack = createNativeStackNavigator()

import Home from '../pages/home';
import RegistraEstoque from '../pages/registraEstoque';
import RegistraCliente from '../pages/registraCliente';
import Login from '../pages/login';
import HistoricoDeVendas from '../pages/historicoDeVendas';
import HomeDeVendas from '../pages/homeDeVendas';
import CriaOrcamento from '../pages/criaOrcamento';
import AtualizaOrcamento from '../pages/atualizaOrcamento';
import Scanner from '../pages/scanner';
import ListaDeCores from '../pages/listaDeCores';
import ListaDeClientes from '../pages/listaClientes';
import FinalizaVenda from '../pages/finalizaVenda';
import BarrasPonto from '../pages/barrasPonto';
import ListaEstoque from '../pages/listaEstoque';
import DetalheEstoque from '../pages/detalheEstoque';
import DetalheCliente from '../pages/detalheCliente';
import Relatorio from '../pages/relatorio';
import Info from '../pages/info';

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
            <Stack.Screen name='HistoricoDeVendas' component={HistoricoDeVendas} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name='HomeDeVendas' component={HomeDeVendas} options={{ animation: 'slide_from_left' }} />
            <Stack.Screen name='CriaOrcamento' component={CriaOrcamento} />
            <Stack.Screen name='AtualizaOrcamento' component={AtualizaOrcamento} />
            <Stack.Screen name='Scanner' component={Scanner} />
            <Stack.Screen name='ListaDeCores' component={ListaDeCores} />
            <Stack.Screen name='ListaDeClientes' component={ListaDeClientes} options={{ animation: 'slide_from_left' }} />
            <Stack.Screen name='FinalizaVenda' component={FinalizaVenda} />
            <Stack.Screen name='BarrasPonto' component={BarrasPonto} />
            <Stack.Screen name='ListaEstoque' component={ListaEstoque} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name='DetalheEstoque' component={DetalheEstoque} />
            <Stack.Screen name='DetalheCliente' component={DetalheCliente} />
            <Stack.Screen name='Relatorio' component={Relatorio}  options={{ animation: 'slide_from_left' }}/>
            <Stack.Screen name='Info' component={Info}  options={{ animation: 'slide_from_left' }}/>



        </Stack.Navigator>

    )
}
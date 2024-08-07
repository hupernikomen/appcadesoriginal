import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useContext, useEffect } from 'react';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';

import AntDesign from 'react-native-vector-icons/AntDesign'
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import { FlatList } from 'react-native-gesture-handler';

export default function Home() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const focus = useIsFocused()

  const { credencial } = useContext(AppContext)
  const { clientes, ordemDeCompra, ListaOrdemDeCompras, ListaProdutos, quantidadeNoEstoque } = useContext(CrudContext)


  useEffect(() => {
    Promise.all([ListaOrdemDeCompras(), ListaProdutos()])

  }, [focus])

  function Button({ icone, nome, notificacao, pagina, desabilitado }) {

    if (desabilitado) return

    return (
      <Pressable
        disabled={desabilitado}
        style={stl.buttons}
        onPress={() => navigation.navigate(pagina)}>

        <AntDesign name={icone} size={28} color={colors.black} />

        {notificacao > 0 ?
          <Text style={[stl.notification, { color: colors.theme }]}>{notificacao}</Text> :
          null}

        <Text style={[stl.textbutton, { color: colors.black }]}>{nome}</Text>

      </Pressable>
    )
  }

  const buttonsInfo = [
    { icone: 'swap', nome: 'Vendas', notificacao: '', pagina: 'HomeDeVendas' },
    { icone: 'profile', nome: 'Histórico', notificacao: ordemDeCompra?.filter(item => item.state === 'Criado').length, pagina: 'HistoricoDeVendas' },
    { icone: 'user', nome: 'Clientes', notificacao: clientes?.length, pagina: 'RegistraCliente', desabilitado: credencial?.cargo === 'Vendedor' },
    { icone: 'skin', nome: 'Estoque', notificacao: quantidadeNoEstoque, pagina: 'RegistraEstoque', desabilitado: credencial?.cargo === 'Vendedor' },
    // { icone: 'barschart', nome: 'Números', notificacao: '', pagina: 'Analytics', desabilitado: credential?.cargo !== 'Socio' }
  ]

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>

      <View style={{ height: 80, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontFamily: 'Roboto-Regular', fontWeight: '400', color: colors.theme }}>Alerta:</Text>
        <Text style={{ fontFamily: 'Roboto-Light', fontWeight: '300', color: '#000', fontSize: 15 }}>Cliente Ana Paula irá aniversariar amanhã</Text>
      </View>

      {credencial?.token ?
        <FlatList
          data={buttonsInfo}
          numColumns={2}
          contentContainerStyle={{ flex: 1, alignItems: 'flex-start', justifyContent: "center", padding: 25 }}
          columnWrapperStyle={{
            gap: 2,
            marginBottom: 2
          }}
          renderItem={({ item }) => {
            return (
              <Button
                icone={item.icone}
                nome={item.nome}
                notificacao={item.notificacao?.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                pagina={item.pagina}
                desabilitado={item.desabilitado}
              />
            )
          }}
        /> :
        <Button
          icone={'key'}
          nome={'Acessar o CadesSG'}
          pagina={'Login'} />

      }
    </View >
  );
}



const stl = StyleSheet.create({
  buttons: {
    backgroundColor: '#f7f7f7',
    elevation: 5,
    width: 130,
    height: 130,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 3,
    borderColor: '#fff',
    padding: 12
  },
  textbutton: {
    textAlign: 'center',
    color: '#222',
    fontWeight: '300',
    fontFamily: 'Roboto-Light',
  },
  notification: {
    fontSize: 12,
    textAlign: 'center',
    position: "absolute",
    paddingHorizontal: 6,
    borderRadius: 6,
    left: '62%',
    top: 22,
    elevation: 5,
    fontFamily: 'Roboto-Regular',
    backgroundColor: '#fff'
  }

})
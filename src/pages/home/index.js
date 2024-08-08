import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useContext, useEffect } from 'react';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';

import AntDesign from 'react-native-vector-icons/AntDesign'
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import { FlatList } from 'react-native-gesture-handler';
import Texto from '../../components/Texto';

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

        {notificacao > 0 ? <Texto estilo={stl.notification} texto={notificacao} cor={colors.theme} tipo='Medium'/> : null}

        <Texto estilo={stl.textbutton} texto={nome} />

      </Pressable>
    )
  }

  const buttonsInfo = [
    { icone: 'swap', nome: 'Vendas', notificacao: '', pagina: 'HomeDeVendas' },
    { icone: 'profile', nome: 'Histórico', notificacao: ordemDeCompra?.filter(item => item.estado !== 'Aberto' && item.estado !== 'Entregue').length, pagina: 'HistoricoDeVendas' },
    { icone: 'user', nome: 'Clientes', notificacao: clientes?.length, pagina: 'RegistraCliente', desabilitado: credencial?.cargo === 'Vendedor' },
    { icone: 'skin', nome: 'Estoque', notificacao: quantidadeNoEstoque, pagina: 'RegistraEstoque', desabilitado: credencial?.cargo === 'Vendedor' },
  ]

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>

      <View style={{ height: 80, justifyContent: "center", padding: 20 }}>
        <Texto texto={'Alerta:'} tipo={'Medium'} cor={colors.theme} />
        <Texto texto={'Cliente Ana Paula irá aniversariar amanhã'} tipo={'Light'} />
      </View>

      {credencial?.token ?
        <FlatList
          data={buttonsInfo}
          numColumns={2}
          contentContainerStyle={{ flex: 1, alignItems: 'flex-start', justifyContent: "center", padding: 25 }}
          columnWrapperStyle={{
            gap: 5,
            marginBottom:5
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
    backgroundColor: '#f1f1f1',
    elevation: 3,
    width: 130,
    height: 130,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  textbutton: {
    textAlign: 'center',
    color: '#222',
    fontWeight: '300',
    fontFamily: 'Roboto-Light',
  },
  notification: {
    textAlign: 'center',
    position: "absolute",
    left: '50%',
    top: 18,
  }

})
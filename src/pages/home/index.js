import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useContext, useEffect } from 'react';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import { FlatList } from 'react-native-gesture-handler';
import Texto from '../../components/Texto';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Load from '../../components/Load';

export default function Home() {
  const navigation = useNavigation()
  const focus = useIsFocused()

  const { colors } = useTheme()
  const { credencial, autenticado } = useContext(AppContext)
  const { clientes, ordemDeCompra, ListaOrdemDeCompras, ListaProdutos, quantidadeNoEstoque, ListaClientes } = useContext(CrudContext)


  useEffect(() => {
    Promise.all([ListaOrdemDeCompras(), ListaProdutos(), ListaClientes()])

    navigation.setOptions({
      headerRight: () => {
        return(
          <Pressable onPress={() => { 
            
            navigation.navigate(!!autenticado ?'BarrasPonto' : 'Login')}}>
            <Ionicons name='barcode-outline' color='#fff' size={22}/>
          </Pressable>
        )
      }
    })

  }, [focus])

  const buttonsInfo = [
    { icone: 'swap', nome: 'Vendas', notificacao: '', pagina: 'HomeDeVendas' },
    { icone: 'profile', nome: 'Histórico', notificacao: ordemDeCompra?.filter(item => item.estado !== 'Aberto' && item.estado !== 'Entregue').length, pagina: 'HistoricoDeVendas' },
    { icone: 'user', nome: 'Clientes', notificacao: clientes?.length, pagina: 'ListaDeClientes', desabilitado: credencial?.cargo === 'Vendedor' },
    { icone: 'skin', nome: 'Estoque', notificacao: quantidadeNoEstoque, pagina: 'ListaEstoque', desabilitado: credencial?.cargo === 'Vendedor' },
  ]

  function Button({ icone, nome, notificacao, pagina, desabilitado }) {

    if (desabilitado) return

    return (
      <Pressable
        disabled={desabilitado}
        style={stl.buttons}
        onPress={() => navigation.navigate(pagina)}>

        <AntDesign name={icone} size={28} color={colors.black} />

        {notificacao > 0 ? <Texto estilo={stl.notification} texto={notificacao} tamanho={12} tipo='Light' /> : null}

        <Texto  texto={nome} tipo='Light' />

      </Pressable>
    )
  }


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>

      {!!autenticado && <View style={{ width:270, marginVertical:10 }}>
        {/* <Texto texto={'Alerta:'} tipo={'Regular'} cor={colors.theme} /> */}
        {/* <Texto texto={'Cliente Ana Paula irá aniversariar amanhã'} tipo={'Light'} /> */}
      </View>}



      {credencial?.token ?
        <FlatList
          data={buttonsInfo}
          numColumns={2}
          contentContainerStyle={{ flex: 1, alignItems: 'flex-start', justifyContent: "center" }}
          columnWrapperStyle={{
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
          nome={'Entrar'}
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
    margin:3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  notification: {
    textAlign: 'center',
    position: "absolute",
    right:6,
    top: 6,
  }

})
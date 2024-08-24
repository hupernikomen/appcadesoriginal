import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useContext, useEffect } from 'react';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';

import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';
import { FlatList } from 'react-native-gesture-handler';
import Texto from '../../components/Texto';
import Topo from '../../components/Topo';
import Icone from '../../components/Icone';

export default function Home() {
  const navigation = useNavigation()
  const focus = useIsFocused()

  const { credencial, autenticado } = useContext(AppContext)
  const { clientes, ordemDeCompra, ListaOrdemDeCompras, ListaProdutos, quantidadeNoEstoque, ListaClientes } = useContext(CrudContext)


  useEffect(() => {
    Promise.all([ListaOrdemDeCompras(), ListaProdutos(), ListaClientes()])

  }, [focus])

  const buttonsInfo = [
    { icone: 'repeat', nome: 'Vendas', notificacao: '', pagina: 'HomeDeVendas' },
    { icone: 'reader-outline', nome: 'Histórico', notificacao: ordemDeCompra?.filter(item => item.estado !== 'Aberto' && item.estado !== 'Entregue').length, pagina: 'HistoricoDeVendas' },
    { icone: 'people-outline', nome: 'Clientes', notificacao: clientes?.length, pagina: 'ListaDeClientes', desabilitado: credencial?.cargo === 'Vendedor' },
    { icone: 'shirt-outline', nome: 'Estoque', notificacao: quantidadeNoEstoque, pagina: 'ListaEstoque', desabilitado: credencial?.cargo === 'Vendedor' },
  ]

  function Button({ icone, nome, notificacao, pagina, desabilitado }) {

    if (desabilitado) return

    return (
      <Pressable
        disabled={desabilitado}
        style={stl.buttons}
        onPress={() => navigation.navigate(pagina)}>

        <Icone nomeDoIcone={icone} corDoIcone='#222' tamanhoDoIcone={30} onpress={() => navigation.navigate(pagina)} />

        {notificacao > 0 ? <Texto estilo={stl.notification} texto={notificacao} tamanho={12} tipo='Light' /> : null}

        <Texto texto={nome} tipo='Light' />

      </Pressable>
    )
  }


  return (
    <View>

      <Topo
        posicao='center'
        iconeLeft={{ nome: 'menu', acao: () => navigation.openDrawer() }}
        iconeRight={{ nome: 'barcode-outline', acao: () => navigation.navigate(!!autenticado ? 'BarrasPonto' : 'Login') }}
        titulo='SG Cades Original' />

      {!!autenticado && <View style={{ width: 270, marginVertical: 10 }}>
        {/* <Texto texto={'Alerta:'} tipo={'Regular'} cor={colors.theme} /> */}
        {/* <Texto texto={'Cliente Ana Paula irá aniversariar amanhã'} tipo={'Light'} /> */}
      </View>}

      <View style={{ alignItems: "center", justifyContent: 'center', marginVertical: '50%' }}>


        {credencial?.token ?
          <FlatList
            data={buttonsInfo}
            numColumns={2}
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
            icone={'key-outline'}
            nome={'Entrar'}
            pagina={'Login'} />

        }
      </View>
    </View >
  );
}

const stl = StyleSheet.create({
  buttons: {
    backgroundColor: '#f1f1f1',
    elevation: 3,
    width: 130,
    height: 130,
    margin: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  notification: {
    textAlign: 'center',
    position: "absolute",
    right: 8,
    top: 6,
  }

})
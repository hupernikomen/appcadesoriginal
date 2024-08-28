import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useContext, useEffect, useState, useTransition } from 'react';
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
  const { colors } = useTheme()

  const { credencial, autenticado } = useContext(AppContext)
  const { clientes, ordemDeCompra, ListaOrdemDeCompras, ListaProdutos, quantidadeNoEstoque, ListaClientes } = useContext(CrudContext)
  const [aniversariante, setAniversariante] = useState([])

  useEffect(() => {
    Promise.all([ListaOrdemDeCompras(), ListaProdutos(), ListaClientes()])

  }, [focus])

  useEffect(() => {
    EncontrarAniversariantes()

  }, [clientes])


  const buttonsInfo = [
    { icone: 'repeat', nome: 'Vendas', notificacao: '', pagina: 'HomeDeVendas' },
    { icone: 'reader-outline', nome: 'Histórico', notificacao: ordemDeCompra?.filter(item => item.estado !== 'Aberto' && item.estado !== 'Entregue').length, pagina: 'HistoricoDeVendas' },
    { icone: 'people-outline', nome: 'Clientes', notificacao: clientes?.length, pagina: 'ListaDeClientes', desabilitado: credencial?.cargo === 'Vendedor' },
    { icone: 'shirt-outline', nome: 'Estoque', notificacao: quantidadeNoEstoque, pagina: 'ListaEstoque', desabilitado: credencial?.cargo === 'Vendedor' },
    { icone: 'barcode-outline', nome: 'Crachá', notificacao: '', pagina: !!autenticado ? 'BarrasPonto' : 'Login', desabilitado: credencial?.cargo === 'Vendedor' },
  ]

  function EncontrarAniversariantes() {
    const hoje = new Date();
    const aniversariantes = [];

    let daquiHaDias = 3

    for (let i = 0; i <= daquiHaDias; i++) {
      const dataProxima = new Date(hoje.getTime() + i * 24 * 60 * 60 * 1000);
      const diaProxima = dataProxima.getDate();
      const mesProxima = dataProxima.getMonth() + 1;

      for (const cliente of clientes) {
        const dataNascimento = cliente.dataNascimento;
        if (dataNascimento) {
          const [diaNascimento, mesNascimento, anoNascimento] = dataNascimento.split('/');
          const diaNascimentoInt = parseInt(diaNascimento);
          const mesNascimentoInt = parseInt(mesNascimento);

          if (diaNascimentoInt === diaProxima && mesNascimentoInt === mesProxima) {
            aniversariantes.push(cliente);
          }
        }
      }
    }

    setAniversariante(aniversariantes);
  }




  function Button({ icone, nome, notificacao, pagina, desabilitado }) {

    if (desabilitado) return

    return (
      <Pressable
        disabled={desabilitado}
        style={stl.buttons}
        onPress={() => navigation.navigate(pagina)}>

        <Icone nomeDoIcone={icone} corDoIcone={colors.padrao} tamanhoDoIcone={26} onpress={() => navigation.navigate(pagina)} />

        {notificacao > 0 ? <Texto estilo={stl.notification} texto={notificacao} tamanho={12} tipo='Light' /> : null}

        <Texto texto={nome} tipo='Light' />

      </Pressable>
    )
  }


  return (
    <>
      <Topo
        posicao='center'
        iconeLeft={{ nome: 'menu', acao: () => navigation.openDrawer() }}
        titulo='SG Cades Original' />

      <View style={{ flex: 1, justifyContent: 'space-around', paddingVertical: 20 }}>


        <View style={{ alignItems: "center", justifyContent: 'center' }}>


          {credencial?.token ?
            <FlatList
            ListHeaderComponent={

              !!autenticado && <View style={{ alignSelf: 'center', paddingHorizontal: 14, marginBottom:50 }}>
              <Texto texto={'Alerta:'} tipo={'Regular'} />
              {aniversariante.map((item, index) => {
                return (
                  <Pressable key={index} onPress={() => navigation.navigate('DetalheCliente', { clienteID: aniversariante.id })}>
                    <Texto texto={`Cliente ${item.nome.split(" ")[0]} ${item.nome.split(" ")[1]} aniversaria dia ${item.dataNascimento.substring(0, 5)}`} tipo={'Light'} />
                  </Pressable>
                )
              })}
            </View>
            }
              data={buttonsInfo}
              contentContainerStyle={{ padding: 4 }}
              showsVerticalScrollIndicator={false}
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
    </>
  );
}

const stl = StyleSheet.create({
  buttons: {
    backgroundColor: '#f1f1f1',
    elevation: 3,
    width: 120,
    height: 120,
    margin: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },

  notification: {
    textAlign: 'center',
    position: "absolute",
    right: 8,
    top: 6,
  }

})
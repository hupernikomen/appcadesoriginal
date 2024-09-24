import { View, Text, Pressable, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { useNavigation, useTheme, useIsFocused } from '@react-navigation/native';

import { CrudContext } from '../../contexts/crudContext';
import { CredencialContext } from '../../contexts/credencialContext';
import { AppContext } from '../../contexts/appContext';

import Texto from '../../components/Texto';
import Topo from '../../components/Topo';
import Icone from '../../components/Icone';
import Load from '../../components/Load';
import Animated, { BounceInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window')

export default function Home() {

  const navigation = useNavigation()
  const focus = useIsFocused()
  const { colors } = useTheme()
  const [load, setLoad] = useState(false)

  const { credencial, autenticado } = useContext(CredencialContext)
  const { ChecarAcesso } = useContext(AppContext)
  const { clientes, ordemDeCompra, ListaOrdemDeCompras, ListaProdutos, quantidadeNoEstoque, ListaClientes } = useContext(CrudContext)
  const [aniversariante, setAniversariante] = useState([])

  useEffect(() => {

    setLoad(true)
    Promise.all([ListaOrdemDeCompras(), ListaProdutos(), ListaClientes()]).finally(() => setLoad(false))

  }, [focus])

  useEffect(() => {
    BuscarClientesAniversariantes()

  }, [clientes])


  const buttonsInfo = [
    { icone: 'repeat', nome: 'Vendas', notificacao: '', pagina: 'HomeDeVendas' },
    { icone: 'reader-outline', nome: 'Histórico', notificacao: ordemDeCompra?.filter(item => item.estado !== 'Aberto' && item.estado !== 'Entregue').length, pagina: 'HistoricoDeVendas', },
    { icone: 'people-outline', nome: 'Clientes', notificacao: clientes?.length, pagina: 'ListaDeClientes' },
    { icone: 'shirt-outline', nome: 'Estoque', notificacao: quantidadeNoEstoque, pagina: 'ListaEstoque' },
    { icone: 'trending-up', nome: 'Financeiro', notificacao: '', pagina: 'Relatorio' },
    // { icone: 'podium-outline', nome: 'Desempenho', notificacao: '', pagina: 'Desempenho' },
    { icone: 'umbrella-outline', nome: 'Colaborador', notificacao: '', pagina: 'Colaborador' },

  ]

  function BuscarClientesAniversariantes() {
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



  function Button({ icone, nome, notificacao, pagina }) {

    return (
      <Animated.View entering={BounceInDown.duration(2000).delay(200)}>

        <Pressable
          style={stl.buttons}
          onPress={() => ChecarAcesso(credencial.cargo, pagina)}>

          <Icone nomeDoIcone={icone} corDoIcone={colors.detalhe} tamanhoDoIcone={24} onpress={() => ChecarAcesso(credencial.cargo, pagina)} height={34} />
          <Texto estilo={stl.notification} texto={notificacao > 0 ? notificacao : ''} tamanho={12} tipo='Light' />
          <Texto texto={nome} tipo='Light' />

        </Pressable>
      </Animated.View>
    )
  }

  if (load) return <Load />


  return (
    <>
      <Topo titulo='SG Cades Original' />

      <View style={{ flex: 1, justifyContent: 'space-around', paddingVertical: 20 }}>

          {(aniversariante.length > 0 && autenticado) && <View style={{ alignSelf: 'center', marginVertical: 24 }}>
            <Texto tipo='Light' texto={'Clientes Aniversariantes:'} estilo={{ alignSelf: 'center', marginBottom: 6 }} />
            {aniversariante.map((item, index) => {
              return (
                <Pressable key={index} onPress={() => navigation.navigate('DetalheCliente', { cpf_cnpj: item.cpf_cnpj })} style={{ padding: 4 }}>
                  <Texto estilo={{ width: width - 100 }} alinhamento='center' texto={`${item.nome.split(" ")[0]} ${item.nome.split(" ")[1]} - ${item.dataNascimento.substring(0, 5)}`} tipo={'Light'} />
                </Pressable>
              )
            })}
          </View>}
        <View style={{ alignItems: "center", justifyContent: 'center', flex:1 }}>


          {credencial?.token ?
            <FlatList
              data={buttonsInfo}
              contentContainerStyle={{ paddingVertical: 100 }}
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
    backgroundColor: '#f5f5f5',
    elevation: 3,
    width: 120,
    height: 105,
    margin: 5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },

  notification: {
    textAlign: 'center',
    position: "absolute",
    right: 12,
    top: 8,
  }

})
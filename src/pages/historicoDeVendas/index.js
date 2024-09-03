import { useEffect, useState, useContext } from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';

import ContainerItem from '../../components/ContainerItem';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Texto from '../../components/Texto';


export default function HistoricoDeVendas() {

  const {params: rota} = useRoute()

  const focus = useIsFocused()
  const navigation = useNavigation()
  const { credencial, Toast, FormatarTexto } = useContext(AppContext)
  const { ordemDeCompra, ListaOrdemDeCompras } = useContext(CrudContext)

  useEffect(() => {
    ListaOrdemDeCompras()
  }, [focus])


  const converteData = (date) => {
    const data = new Date(date);
    const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return formatoData.format(data);

  }

  const RenderItem = ({ item }) => {

    const tipoC = item.tipo?.substr(0,1)

    return (

      <ContainerItem opacidade={item.estado === 'Entregue' ? .9 : 1} onpress={() => {
        if (credencial.cargo === 'Socio' || credencial.cargo === 'Gerente') {
          navigation.navigate('Orcamento', { ordemDeCompraID: item.id })

        } else if (credencial.cargo === 'Vendedor' && item.estado === "Aberto" || item.estado === "Criado") {
          navigation.navigate('Orcamento', { ordemDeCompraID: item.id })

        } else {
          Toast("Acesso Negado")
        }
      }}>

        <View style={{ flex: 1, opacity: item.estado === 'Entregue' ? .5 : 1 }}>
          <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between" }}>
            <Texto tipo='Light' texto={`Pedido ${item?.estado} ${tipoC}-${item.id.substr(0, 6).toUpperCase()}`}/>
            <Texto tipo='Light' texto={`${converteData(item?.criadoEm)}`}/>
          </View>
            <Texto tipo='Light' texto={`Cliente: ${FormatarTexto(item?.cliente?.nome)}`}/>
        </View>

      </ContainerItem>

    )
  }


  function ordenarListaPorEstado(lista) {
    const estados = { Aberto: 0, Criado: 1, Separado: 2, Entregue: 3 };
    return lista.sort((a, b) => estados[a.estado] - estados[b.estado]);
  }

  return (
    <>


      <Topo
        posicao='left'
        iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
        titulo='Histórico' />
      <Tela>

        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingVertical:14}}
          data={
            rota?.clienteID
                ? ordenarListaPorEstado(ordemDeCompra).filter((item) => item.cliente?.id === rota?.clienteID)
                : ordenarListaPorEstado(ordemDeCompra)
        }
        


          renderItem={({ item }) => <RenderItem item={item} />}
        />

      </Tela>
    </>
  )

}
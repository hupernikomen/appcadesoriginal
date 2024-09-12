import { useEffect, useState, useContext } from 'react';
import { View, FlatList } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { AppContext } from '../../contexts/appContext';
import { CrudContext } from '../../contexts/crudContext';

import Tela from '../../components/Tela';
import Topo from '../../components/Topo';
import Texto from '../../components/Texto';
import ContainerItem from '../../components/ContainerItem';
import SeletorAV from '../../components/SeletorAV';

export default function HistoricoDeVendas() {

  const { params: rota } = useRoute()

  const focus = useIsFocused()
  const navigation = useNavigation()
  const { FormatarTexto } = useContext(AppContext)
  const { ordemDeCompra, ListaOrdemDeCompras } = useContext(CrudContext)

  const [xAtacado, setXAtacado] = useState(false);


  useEffect(() => {
    ListaOrdemDeCompras()

  }, [focus])


  const converteData = (date) => {
    const data = new Date(date);
    const formatoData = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      // hour: "2-digit", 
      // minute: "2-digit" 
    });
    return formatoData.format(data);

  }

  const RenderItem = ({ item }) => {

    const tipoC = item.tipo?.substr(0, 1)

    return (

      <ContainerItem opacidade={item.estado === 'Entregue' ? .4 : 1} onpress={() => {
        navigation.navigate('AtualizaOrcamento', { ordemDeCompraID: item.id })
      }}>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: "space-between" }}>
            <Texto tipo='Light' texto={`Pedido ${item?.estado} ${tipoC}-${item.id.substr(0, 6).toUpperCase()}`} />
            <Texto tipo='Light' texto={`${converteData(item?.criadoEm)}`} />
          </View>
          <Texto tipo='Light' texto={`Cliente: ${FormatarTexto(item?.cliente?.nome)}`} />
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

      <SeletorAV xAtacado={xAtacado} setXAtacado={setXAtacado} label1="Atacado" label2="Varejo" />

        <FlatList
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9' }} />}
          renderItem={({ item }) => <RenderItem item={item} />}
          data={
            rota?.clienteID
              ? ordenarListaPorEstado(ordemDeCompra).filter((item) => item.cliente?.id === rota?.clienteID)
              : ordenarListaPorEstado(ordemDeCompra).filter((item) => xAtacado ? item.tipo === "Varejo" : item.tipo === "Atacado")
          }
        />

      </Tela>
    </>
  )
}
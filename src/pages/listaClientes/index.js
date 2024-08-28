import { Pressable, View, Text, FlatList, Linking } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect } from 'react';

import { CrudContext } from '../../contexts/crudContext';
import Texto from '../../components/Texto';
import Tela from '../../components/Tela';
import Topo from '../../components/Topo';

export default function ListaDeClientes() {

  const { clientes, ListaOrdemDeCompras, ordemDeCompra } = useContext(CrudContext)
  const navigation = useNavigation()


  const converteData = (date) => {
    const data = new Date(date);
    const formatoData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
    return formatoData.format(data);
  }


  const Cliente = ({ data }) => {

    return (
      <Pressable onPress={() => navigation.navigate('DetalheCliente', { cpf_cnpj: data.cpf_cnpj })} style={{ justifyContent: "center" }}>
        <Texto texto={data.nome} />
        {!ContagemDeCompras(data.id).count ? <Texto texto={data.cpf_cnpj} tipo='Light' /> : <Texto tipo='Light' texto={`${ContagemDeCompras(data.id).count} compra realizada`}/>}
        {!ContagemDeCompras(data.id).ultimaDataDaCompra ? null : <Texto tipo='Light' texto={`Última compra em ${converteData(ContagemDeCompras(data.id).ultimaDataDaCompra)}`}/>}
        
      </Pressable>
    )
  }

  function ContagemDeCompras(clientId) {
    let count = 0;
    let ultimaDataDaCompra = null;
  
    ordemDeCompra.forEach(order => {
      if (order.estado === 'Entregue' && order.cliente.id === clientId) {
        count++;
        if (!ultimaDataDaCompra || new Date(order.criadoEm) > new Date(ultimaDataDaCompra)) {
          ultimaDataDaCompra = order.criadoEm;
        }
      }
    });
  
    return { count, ultimaDataDaCompra };
  }



  return (
    <>
      <Topo
        posicao='left'
        iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
        iconeRight={{ nome: 'add-sharp', acao: () => navigation.navigate('RegistraCliente') }}
        titulo='Clientes' />
        
      <Tela>
        <FlatList
          ItemSeparatorComponent={<View style={{marginVertical: 20, borderColor: '#d9d9d9', borderBottomWidth: .5 }} />}
          contentContainerStyle={{ paddingVertical: 20 }}
          data={clientes.sort((a, b) => a.nome.localeCompare(b.nome))}
          renderItem={({ item }) => <Cliente data={item} />}
        />
      </Tela>
    </>
  );
}
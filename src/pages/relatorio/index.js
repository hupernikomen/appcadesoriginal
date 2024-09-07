import { FlatList, Pressable, View, Switch } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import Texto from '../../components/Texto';
import { useRoute, useNavigation, useTheme } from '@react-navigation/native';
import Topo from '../../components/Topo';

import { CrudContext } from '../../contexts/crudContext';
import Tela from '../../components/Tela';
import SeletorAV from '../../components/SeletorAV';

export default function Relatorio() {

  const navigation = useNavigation()

  const { ordemDeCompra, ListaOrdemDeCompras } = useContext(CrudContext)

  const [xAtacado, setXAtacado] = useState(false);

  useEffect(() => {

    ListaOrdemDeCompras()

  }, [])

  function separarItensMesAMes(data) {
    // Filtrar os dados para vendas no estado 'entregue' e do tipo especificado
    let tipo = 'Atacado'
    xAtacado ? tipo = 'Varejo' : tipo = 'Atacado'
  
    const dadosFiltrados = data.filter(item => item.estado === 'Entregue' && item.tipo === tipo);
  
    // Agrupar os dados por mês e ano
    const grupo = dadosFiltrados.reduce((acc, item) => {
      const dataCriadoEm = new Date(item.criadoEm);
      const mes = dataCriadoEm.getMonth() + 1;
      const ano = dataCriadoEm.getFullYear();
      const chave = `${ano}-${mes}`;
  
      if (!acc[chave]) {
        acc[chave] = {
          ano,
          mes,
          total: 0,
          compras: 0
        };
      }
  
      acc[chave].total += item.totalDaNota;
      acc[chave].compras++;
  
      return acc;
    }, {});
  
    // Converter o objeto em um array e ordenar por mês
    const resultado = Object.values(grupo).sort((a, b) => a.mes - b.mes);
  
    // Calcule o ticketMedio para cada mês
    resultado.forEach(item => {
      item.ticketMedioMes = item.total / item.compras;
    });
  
    // Calcule o ticketMedio total do ano atual
    const anoAtual = new Date().getFullYear();
    const totalComprasAnoAtual = resultado.filter(item => item.ano === anoAtual).reduce((acc, item) => acc + item.compras, 0);
    const totalValorAnoAtual = resultado.filter(item => item.ano === anoAtual).reduce((acc, item) => acc + item.total, 0);
    const ticketMedioAnoAtual = totalValorAnoAtual / totalComprasAnoAtual;
  
    // Adicione o ticketMedioAnoAtual ao final do array
    resultado.push({
      ano: anoAtual,
      mes: 'Total em ',
      total: totalValorAnoAtual,
      compras: totalComprasAnoAtual,
      ticketMedioMes: ticketMedioAnoAtual
    });
  
    return resultado;
  }

  const Render = ({ data }) => {

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

        <View style={{ flexDirection: 'row' }}>
          <Texto texto={`${data.mes}${data.mes > 0 ? '/' : ''}`} />
          <Texto texto={data.ano} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: "center", gap: 24 }}>

          <Texto tipo='Light' texto={`${parseFloat(data.total).toFixed(2)}`} estilo={{ width: 70, textAlign: 'right' }} />
          <Texto tipo='Light' texto={`${parseFloat(data.ticketMedioMes).toFixed(2)}`} estilo={{ width: 70, textAlign: 'right' }} />
        </View>
      </View>
    )
  }


  return (
    <>
      <Topo
        posicao='left'
        iconeLeft={{ nome: 'arrow-back-outline', acao: () => navigation.goBack() }}
        titulo='Relatório Financeiro' />
      <Tela>

        <SeletorAV setXAtacado={setXAtacado} xAtacado={xAtacado} />

        <FlatList
          ListHeaderComponent={
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}>
              <Texto texto={''} />
              <View style={{ flexDirection: 'row', alignItems: "center", gap: 24 }}>

                <Texto texto={'Ent.'} tipo='Medium' estilo={{ width: 70, textAlign: 'right' }} />
                <Texto texto={'Tkt.'} tipo='Medium' estilo={{ width: 70, textAlign: 'right' }} />
              </View>
            </View>
          }
          data={separarItensMesAMes(ordemDeCompra)}
          ItemSeparatorComponent={<View style={{ marginVertical: 6, borderColor: '#d9d9d9', borderBottomWidth: .5 }} />}
          renderItem={({ item }) => <Render data={item} />}
        />

      </Tela>

    </>
  );
}
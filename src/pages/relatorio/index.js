import { FlatList, Pressable, View, Switch } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import Texto from '../../components/Texto';
import { useNavigation } from '@react-navigation/native';
import Topo from '../../components/Topo';

import { AppContext } from '../../contexts/appContext';

import api from '../../services/api';

import Tela from '../../components/Tela';
import Load from '../../components/Load';

export default function Relatorio() {

  const navigation = useNavigation()

  const { formatCurrency } = useContext(AppContext)
  const [pagamentos, setPagamentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {

    ListarPagamentos()

  }, [])

  async function ListarPagamentos() {
    try {
      const response = await api.get('/lista/pagamentos')
      const pagamentos = response.data
  
      const planoDePagamentos = pagamentos.reduce((acc, current) => {

        if (current.parcelas === 0) {
          const paymentMonth = `${parseInt(current.criadoEm.split('-')[1]) < 10 ? `0${parseInt(current.criadoEm.split('-')[1])}` : parseInt(current.criadoEm.split('-')[1])}/${parseInt(current.criadoEm.split('-')[0])}`;
          const existingMonth = acc.find((month) => month.data === paymentMonth);

          if (existingMonth) {
            existingMonth.valor += current.totalPago;

          } else {
            acc.push({ data: paymentMonth, valor: current.totalPago });

          }

        } else {
          const paymentMonths = PagamentosMensais(current.criadoEm, current.parcelas, current.totalPago);
          paymentMonths.forEach((paymentMonth) => {

            const existingMonth = acc.find((month) => month.data === paymentMonth.data);

            if (existingMonth) {
              existingMonth.valor += paymentMonth.valor;

            } else {
              acc.push(paymentMonth);

            }
          });
        }
        return acc;

      }, []);
  


      planoDePagamentos.sort((a, b) => {
        const [mesA, anoA] = a.data.split('/');
        const [mesB, anoB] = b.data.split('/');

        if (anoA !== anoB) {
          return anoA - anoB;

        } else {
          return mesA - mesB;

        }
      });
  
      setPagamentos(planoDePagamentos);
  
    } catch (error) {
      console.log(error.response);
  
    } finally {
      setCarregando(false)
    }
  }
  


  function PagamentosMensais(date, parcels, totalPago) {
    const month = parseInt(date.split('-')[1]);
    const year = parseInt(date.split('-')[0]);
    const paymentMonths = [];
  
    for (let i = 0; i < parcels; i++) {
      let paymentYear = year;
      let paymentMonthNumber = month + i;
      while (paymentMonthNumber > 12) {
        paymentYear++;
        paymentMonthNumber -= 12;
      }
      const paymentMonth = `${paymentMonthNumber < 10 ? `0${paymentMonthNumber}` : paymentMonthNumber}/${paymentYear}`;
      paymentMonths.push({ data: paymentMonth, valor: totalPago / parcels });
    }
  
    return paymentMonths;
  }


  const Render = ({ data }) => {

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }}>

        <View style={{ flexDirection: 'row' }}>
          <Texto texto={`${data.data}`} tipo='Light' />
        </View>

        <View style={{ flexDirection: 'row', alignItems: "center", gap: 12 }}>
          <Texto texto={`R$ ${formatCurrency(data.valor)}`} tipo='Light' />
        </View>

      </View>
    )
  }

  if (carregando) return <Load/>


  return (
    <>
      <Topo
        iconeLeft={{ nome: 'chevron-back', acao: () => navigation.goBack() }}
        titulo='Projeção Mensal' />
      <Tela>

        <FlatList
          ListHeaderComponent={<Texto tipo='Light' texto={'Projeção mensal de receitas de acordo com registros a vista (mês atual) e parcelados (futuros).'} estilo={{ alignSelf: 'center', textAlign: 'center', marginVertical: 24 }} />}
          data={pagamentos}
          ItemSeparatorComponent={<View style={{ borderColor: '#d9d9d9', borderBottomWidth: .5 }} />}
          renderItem={({ item }) => <Render data={item} />}
        />

      </Tela>

    </>
  );
}
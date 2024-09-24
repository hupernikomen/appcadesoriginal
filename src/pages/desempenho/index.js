import { View, FlatList, Dimensions } from 'react-native';
import Topo from '../../components/Topo';
import Tela from '../../components/Tela';
import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import Texto from '../../components/Texto';
import { useNavigation } from '@react-navigation/native';
import { Picker } from "@react-native-picker/picker";
import { AppContext } from '../../contexts/appContext';
import PopUp from '../../components/Popup';

export default function Desempenho() {

  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const navigation = useNavigation()
  const { formatCurrency } = useContext(AppContext)
  const [selecaoDeMes, setSelecaoDeMes] = useState('');

  const {width} = Dimensions.get('window')

  const [ordemDeCompra, setOrdemDeCompras] = useState([])

  useEffect(() => {
    ListaOrdemDeCompras()

    setSelecaoDeMes(months[new Date().getMonth()])
    // setSelecaoDeAno(new Date().getFullYear())
  }, [])





  function formatPercentage(percentage) {
    return `${percentage.toFixed(2)}%`;
  }

  function AgruparValores(data) {
    const users = {};
    const monthTotals = {};

    data.forEach((item) => {
      const date = new Date(item.criadoEm);
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const userName = item.usuario.nome;

      if (!users[userName]) {
        users[userName] = {};
      }

      if (!users[userName][year]) {
        users[userName][year] = {};
      }

      if (!users[userName][year][month]) {
        users[userName][year][month] = 0;
      }

      users[userName][year][month] += item.valorPago;

      if (!monthTotals[year]) {
        monthTotals[year] = {};
      }

      if (!monthTotals[year][month]) {
        monthTotals[year][month] = 0;
      }

      monthTotals[year][month] += item.valorPago;
    });

    const result = Object.keys(users).map((user) => {
      const userYears = users[user];
      const flattenedYears = [];

      Object.keys(userYears).forEach((year) => {
        const yearValue = Object.values(userYears[year]).reduce((acc, value) => acc + value, 0);

        Object.keys(userYears[year]).forEach((month) => {
          const monthTotal = monthTotals[year][month];
          const percentage = (userYears[year][month] / monthTotal) * 100;

          flattenedYears.push({
            user,
            year,
            month,
            valueMensal: formatCurrency(userYears[year][month]),
            valueAnual: formatCurrency(yearValue),
            percentage: formatPercentage(percentage),
          });
        });
      });

      return flattenedYears;
    });

    return result.flat();
  }



  async function ListaOrdemDeCompras() {
    try {
      const response = await api.get('/lista/ordemDeCompras')
      const ordemDeCompras = response.data

      setOrdemDeCompras(ordemDeCompras)


    } catch (error) {
      console.log(error.response);


    }
  }





  return (
    <>
      <Topo
        iconeLeft={{ nome: 'chevron-back', acao: () => navigation.goBack() }}
        titulo='Desempenho' />

      <Tela>

        <View style={{ flexDirection: "row", marginBottom: 12, paddingVertical: 12, justifyContent:'space-between' }}>

          <View style={{
            width: width / 2 - 22,
            height: 50,
            backgroundColor: "#e9e9e999",
            paddingVertical: 4,
            borderRadius: 12,
            paddingHorizontal: 12,
          }}>

            <Picker
              style={{ height: 40, marginLeft: -12 }}
              selectedValue={selecaoDeMes}
              onValueChange={(itemValue) => setSelecaoDeMes(itemValue)}
            >
              {Array.from(new Set(AgruparValores(ordemDeCompra).map(item => item.month))).sort((a, b) => months.indexOf(a) - months.indexOf(b)).map((mes, index) => {
                return (
                  <Picker.Item style={{ fontFamily: 'Roboto-Light', fontSize: 14 }} key={index} label={mes} value={mes} />
                )
              })}
            </Picker>
          </View>

          <View style={{
            width: width / 2 - 22,
            height: 50,
            backgroundColor: "#e9e9e999",
            paddingVertical: 4,
            borderRadius: 12,
            paddingHorizontal: 12,
          }}>
            {/* 
            <Picker
              style={{ height: 40, marginLeft: -12 }}
              selectedValue={selecaoDeAno}
              onValueChange={(itemValue) => setSelecaoDeAno(itemValue)}
            >
              {Array.from(new Set(AgruparValores(ordemDeCompra).map(item => item.year))).map((ano, index) => {
                return (
                  <Picker.Item style={{ fontFamily: 'Roboto-Light', fontSize: 14 }} key={index} label={ano} value={ano} />
                )
              })}
            </Picker> */}
          </View>
        </View>


        {/* {"month": "SET", "percentage": "93.40%", "user": "Xavier Queiroz", "valueAnual": "12.595,26", "valueMensal": "10.616,99", "year": "2024"}, */}

        <FlatList
          data={AgruparValores(ordemDeCompra).filter((item) => item.month === selecaoDeMes)}
          contentContainerStyle={{ paddingVertical: 12 }}
          ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9' }} />}
          ListHeaderComponent={
            <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between" }}>
              <Texto texto={''} />

              <View style={{ flexDirection: "row", gap: 12 }}>

                <View style={{ width: 80, alignItems: 'flex-end' }}>
                  <PopUp  message={'Vendas no periodo selecionado'} objAction={[{ text: 'ok', onPress: () => null }]} />
                </View>

                <View style={{ width: 80, alignItems: 'flex-end' }}>
                  <PopUp message={'Porcentagem de vendas em relação ao total arrecadado no periodo selecionado'} objAction={[{ text: 'ok', onPress: () => null }]} />
                </View>

              </View>
            </View>
          }
          renderItem={({ item }) => {

            return (
              <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-between", paddingVertical: 12 }}>

                <Texto tipo='Light' texto={item.user} />

                <View style={{ flexDirection: "row", gap: 12 }}>

                  <Texto tipo='Light' texto={item.valueMensal} estilo={{ width: 80 }} alinhamento='right' />
                  <Texto tipo='Light' texto={item.percentage} estilo={{ width: 80 }} alinhamento='right' />
                </View>


              </View>

            )
          }}
        />


      </Tela>
    </>
  );
}
import { createContext, useState, useEffect, useContext } from "react";
import { ToastAndroid } from "react-native";
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";

import { AppContext } from "./appContext";

export const CrudContext = createContext({})

export function CrudProvider({ children }) {

  const { credential } = useContext(AppContext)
  const navigation = useNavigation()
  const [scan, setScan] = useState({})
  const [clients, setClients] = useState([])
  const [salesform, setSalesform] = useState([])
  const [budgets, setBudgets] = useState([])


  useEffect(() => {
    Promise.all(AllClients(), AllSalesform())

  }, [])

  // Exibe mensagens de retorno de execução de comandos
  const Toast = message => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      30,
    );
  };

  async function HandleBudget(salesformID) {

    try {
      const response = await api.get(`/getbudget?salesformID=${salesformID}`)
      setBudgets(response.data)


    } catch (error) {
      console.log(error.response);

    }
  }

  async function AddItemOrder(data) {

    const product = budgets.find(budget => budget.product && budget.product.id === data.product?.id);

    if (product) {
      Toast("Item já existe no orçamento");
    } else {


      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credential?.token}`
        }

        const item = {
          salesformID: data.salesformID,
          productID: data.productID,
          amount: 1,
        }

        await api.post('/createbudget', item, { headers })
        HandleBudget(data.salesformID)

      } catch (error) {
        console.log(error.response);
      } 
    }



  }


  async function AllSalesform() {
    try {
      const res = await api.get('/salesform/all')
      setSalesform(res.data);

    } catch (error) {
      console.log(error.response);

    }
  }

  async function RegisterClient(cpf_cnpj, name, address, district, city, uf, whatsapp, birthDate) {

    //inserir headers

    try {
      await api.post('/createclient', { cpf_cnpj, name, address, district, city, uf, whatsapp, birthDate })
      AllClients()
      navigation.goBack()
    } catch (error) {
      console.log(error.data);

    }
  }

  async function AllClients() {
    try {
      const clients = await api.get('/getclients/all')
      setClients(clients.data)
    } catch (error) {
      console.log(error.response);
    }
  }



  async function StateBudget(salesformID) {

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credential?.token}`
    }

    try {
      await api.put(`/putstock?salesformID=${salesformID}`, { headers })

    } catch (error) {
      console.log(error.response);

    } finally {
      navigation.navigate('Home')
    }
  }



  return (
    <CrudContext.Provider value={{
      // GetProduct,
      RegisterClient,
      clients,
      AllClients,
      salesform,
      AllSalesform,
      StateBudget,
      AddItemOrder,
      HandleBudget,
      budgets
    }}>
      {children}
    </CrudContext.Provider>
  )
}
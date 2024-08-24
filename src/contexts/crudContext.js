import { createContext, useState, useEffect, useContext } from "react";
import { ToastAndroid } from "react-native";
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";

import { AppContext } from "./appContext";

export const CrudContext = createContext({})

export function CrudProvider({ children }) {

  const navigation = useNavigation()

  const { credencial, load, setLoad } = useContext(AppContext)
  const [clientes, setClientes] = useState([])
  const [ordemDeCompra, setOrdemDeCompra] = useState([])
  const [itensDoPedido, setItensDoPedido] = useState([])
  const [quantidadeNoEstoque, setQuantidadeNoEstoque] = useState('')

  useEffect(() => {
    Promise.all(ListaClientes(), ListaOrdemDeCompras(), ListaProdutos())
  }, [])


  async function ListaClientes() {
    try {
      const res = await api.get('/lista/clientes')
      setClientes(res.data)

    } catch (error) {
      console.log(error.response);
    }
  }


  async function ListaOrdemDeCompras() {

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`
    }

    try {
      const res = await api.get('/lista/ordemDeCompras')
      res.data?.map(async (item) => {

        try {
          if (item?.totalDaNota === 0 || !item?.totalDaNota) {
            await api.delete(`/deleta/ordemDeCompra?ordemDeCompraID=${item?.id}`, { headers })
          }

        } catch (error) {
          console.log(error.response);

        }
      })

      setOrdemDeCompra(res.data);

    } catch (error) {
      console.log(error.response);
    }
  }


  async function BuscaItemDoPedido(ordemDeCompraID) {

    setLoad(true)

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`
    }

    try {
      const res = await api.get(`/busca/itemDoPedido?ordemDeCompraID=${ordemDeCompraID}`)
      setItensDoPedido(res.data)
      setLoad(false)

    } catch (error) {
      console.log(error.response);
      setLoad(false)
    }
  }



  async function SubtraiUmItemDoPedido(itemDoPedidoID, produtoID, quantidade, ordemDeCompraID) {

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`
    }

    try {
      await api.put(`/atualiza/itemDoPedido?itemDoPedidoID=${itemDoPedidoID}`, { quantidade: Number(quantidade - 1), produtoID: produtoID }, { headers })
      BuscaItemDoPedido(ordemDeCompraID)
    
    } catch (error) {
      console.log(error.response)
    }

  }



  async function ListaProdutos() {
    try {
      const res = await api.get('/lista/produtos')
      let estoque = res.data.reduce((acc, current) => acc + current.estoque, 0)
      let saida = res.data.reduce((acc, current) => acc + current.saida, 0)
      setQuantidadeNoEstoque(estoque - saida)

    } catch (error) {
      console.log(error.response);

    }
  }


  const Toast = message => {
    ToastAndroid.showWithGravityAndOffset(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
      25,
      30,
    );
  };





  async function AdicionarItemAoPedido(data) {

    setLoad(true)

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`
    }

    // SE O PRODUTO JA ESTIVER NA LISTA ...
    const itemJaIncluso = itensDoPedido.find(item => item.produto?.id === data.produtoID);

    try {
      if (itemJaIncluso) {
        await api.put(`/atualiza/itemDoPedido?itemDoPedidoID=${itemJaIncluso?.id}`, { quantidade: Number(itemJaIncluso.quantidade + 1), produtoID: data?.produtoID }, { headers })

      } else {

        const item = {
          ordemDeCompraID: data.ordemDeCompraID,
          produtoID: data.produtoID,
          quantidade: 1,
        }

        await api.post('/cria/itemDoPedido', item, { headers })

      }
    } catch (error) {
      Toast(error.response.data.error)
    } finally {
      setLoad(false)
    }
    BuscaItemDoPedido(data.ordemDeCompraID)

  }






  async function RegistraCliente(cpf_cnpj, nome, endereco, bairro, cidade, estado, whatsapp, dataNascimento, CEP, inscricaoEstadualRg) {

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`
    }

    try {
      await api.post('/registra/cliente', { cpf_cnpj, nome, endereco, bairro, cidade, estado, whatsapp, dataNascimento, CEP, inscricaoEstadualRg }, { headers })
      ListaClientes()
      navigation.goBack()
    } catch (error) {
      console.log(error.response);

    }
  }




  return (
    <CrudContext.Provider value={{
      RegistraCliente,
      clientes,
      ListaClientes,
      ordemDeCompra,
      ListaOrdemDeCompras,
      AdicionarItemAoPedido,
      BuscaItemDoPedido,
      itensDoPedido,
      ListaProdutos,
      quantidadeNoEstoque,
      load,
      setLoad,
      SubtraiUmItemDoPedido
    }}>
      {children}
    </CrudContext.Provider>
  )
}
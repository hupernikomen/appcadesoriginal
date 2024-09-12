import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import { useNavigation } from "@react-navigation/native";

import { AppContext } from "./appContext";
import { CredencialContext } from "./credencialContext";

export const CrudContext = createContext({})

export function CrudProvider({ children }) {

  const navigation = useNavigation()

  const { credencial } = useContext(CredencialContext)
  const { load, setLoad, Toast } = useContext(AppContext)
  const [clientes, setClientes] = useState([])
  const [ordemDeCompra, setOrdemDeCompra] = useState([])
  const [itensDoPedido, setItensDoPedido] = useState([])
  const [quantidadeNoEstoque, setQuantidadeNoEstoque] = useState('')

  useEffect(() => {
    Promise.all(ListaClientes(), ListaOrdemDeCompras(), ListaProdutos())
  }, [])


  async function ListaClientes() {
    try {
      const response = await api.get('/lista/clientes')
      const cliente = response.data

      setClientes(cliente)

    } catch (error) {
      console.log(error.response);
    }
  }




  async function ListaOrdemDeCompras() {
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`,
    };

    try {
      const response = await api.get('/lista/ordemDeCompras');
      const ordensDeCompra = response.data;

      // Filtra e exclui ordens de compra com total da nota igual a 0
      const ordensDeCompraValidas = await Promise.all(
        
        ordensDeCompra.map(async (item) => {
          
          if (item?.itemDoPedido.length === 0) {

            try {
              await api.delete(`/deleta/ordemDeCompra?ordemDeCompraID=${item?.id}`, { headers });
              return null;

            } catch (error) {
              console.log(error.response);
              return item;
            }
          }

          return item;
        })
      );

      const ordensDeCompraFiltradas = ordensDeCompraValidas.filter((item) => item !== null);
      setOrdemDeCompra(ordensDeCompraFiltradas);

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
      const response = await api.get(`/busca/itemDoPedido?ordemDeCompraID=${ordemDeCompraID}`)
      const itemDoPedido = response.data

      setItensDoPedido(itemDoPedido)
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

    const atualizacao = {
      quantidade: Number(quantidade - 1), 
      produtoID: produtoID
    }

    try {
      await api.put(`/atualiza/itemDoPedido?itemDoPedidoID=${itemDoPedidoID}`, atualizacao, { headers })
      BuscaItemDoPedido(ordemDeCompraID)

    } catch (error) {
      console.log(error.response)
    }

  }




  async function ListaProdutos() {
    try {
      const response = await api.get('/lista/produtos');
      const produtos = response.data;

      const totalEstoque = produtos.reduce((acc, produto) => acc + produto.estoque, 0);
      const totalSaida = produtos.reduce((acc, produto) => acc + produto.saida, 0);

      const quantidadeNoEstoque = totalEstoque - totalSaida;
      setQuantidadeNoEstoque(quantidadeNoEstoque);

    } catch (error) {
      console.error(error.response);
    }
  }


  async function AdicionarItemAoPedido(data) {

    setLoad(true)

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`
    }

    // Verifica se o produto já está na lista
    const itemJaIncluso = itensDoPedido.find(item => item.produto?.id === data.produtoID);

    try {
      if (itemJaIncluso) {
        // Atualiza a quantidade do item existente
        await api.put(`/atualiza/itemDoPedido?itemDoPedidoID=${itemJaIncluso?.id}`, { quantidade: Number(itemJaIncluso.quantidade + 1), produtoID: data?.produtoID }, { headers })

      } else {
        // Cria um novo item
        const novoItem = {
          ordemDeCompraID: data.ordemDeCompraID,
          produtoID: data.produtoID,
          quantidade: 1,
        }

        await api.post('/cria/itemDoPedido', novoItem, { headers })

      }
    } catch (error) {
      Toast(error.response.data.error)

    } finally {
      setLoad(false)
    }
    BuscaItemDoPedido(data.ordemDeCompraID)

  }



  async function FecharNota(data) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credencial?.token}`
    };
  
    const response = await api.get(`/busca/itensDoPedido?ordemDeCompraID=${data[0].ordemDeCompraID}`);
    const itensDoPedidoBD = response.data;
  
    for (const item of data) {
      if (itensDoPedidoBD.length > 0) {
        const novoItem = {
          quantidade: item.quantidade,
          produtoID: itensDoPedidoBD.find((i) => i.id === item.id)?.produto?.id,
        };
    
        try {
          await Promise.all(itensDoPedidoBD.map(async (item) => {
            await api.put(`/atualiza/itemDoPedido?itemDoPedidoID=${item?.id}`, novoItem, { headers });
          }));
        } catch (error) {
          console.error(error.response);
        }
      } else {
        const novoItem = {
          ordemDeCompraID: item.ordemDeCompraID,
          produtoID: item.produto.id,
          quantidade: item.quantidade,
        };
  
        try {
          await api.post('/cria/itemDoPedido', novoItem, { headers });
        } catch (error) {
          console.error(error.response);
        }
      }
    }
  }




  return (
    <CrudContext.Provider value={{
      clientes,
      ListaClientes,
      ordemDeCompra,
      ListaOrdemDeCompras,
      AdicionarItemAoPedido,
      FecharNota,
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
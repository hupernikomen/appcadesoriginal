import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

import { AppContext } from "./appContext";
import { CredencialContext } from "./credencialContext";
import Load from "../components/Load";

export const CrudContext = createContext({})

export function CrudProvider({ children }) {

  const { credencial } = useContext(CredencialContext)
  const { load, setLoad, Toast } = useContext(AppContext)
  const [clientes, setClientes] = useState([])
  const [ordemDeCompra, setOrdemDeCompra] = useState([])
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


  async function CancelarCompra(ordemDeCompraID) {


    const headers = {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${credencial?.token}`
    }

    try {

       await api.delete(`/cancelaCompra?ordemDeCompraID=${ordemDeCompraID}`, { headers })
       await api.delete(`/deleta/ordemDeCompra?ordemDeCompraID=${ordemDeCompraID}`, { headers })
      //  await ListaOrdemDeCompras()
       navigation.navigate('Home')

    } catch (error) {
       console.log(error.response);

    }


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
      FecharNota,
      ListaProdutos,
      quantidadeNoEstoque,
      load,
      setLoad,
      CancelarCompra
    }}>
      {children}
    </CrudContext.Provider>
  )
}
import { View, Text, FlatList, Pressable } from 'react-native';
import api from '../../services/api';
import { useContext, useEffect, useState } from 'react';
import Input from '../../components/Input';

import { AppContext } from '../../contexts/appContext';

export default function ListColors() {

    const {credencial, Toast} = useContext(AppContext)

    const [cores, setCores] = useState([])
    const [nome, setNome] = useState('')

    useEffect(() => {
        ListaCores()
    }, [])


    async function ListaCores() {
        try {
            const res = await api.get("/listaCores")
            console.log(res.data);
            
            setCores(res.data)

        } catch (error) {
            console.log(error.response);

        }
    }

    function gerarCodigoAleatorio(listaDeCores) {
        let codigoAleatorio;
        do {
            codigoAleatorio = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        } while (listaDeCores.some(item => item.codigo === codigoAleatorio));
        return codigoAleatorio;
    }


    async function CriaCor() {

        if (!nome)  return
  

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credencial?.token}`
        }
        
        try {
            await api.post(`/criacor`, { nome, codigo: gerarCodigoAleatorio(cores) }, { headers })
            await ListaCores()
            setNome('')

        } catch (error) {
            console.log(error.response);
            Toast(error.response.data.error)

        }
    }



    return (
        <View>

            <View style={{ flexDirection: "row", padding: 10 }}>
                <Input title={'Nome da Cor'} styleContainer={{ flex: 1 }} value={nome} setValue={setNome} />
                <Pressable onPress={() => CriaCor()} style={{ height: 65, width: 65, alignItems: 'center', justifyContent: 'center' }}><Text>Criar</Text></Pressable>
            </View>

            <FlatList data={cores.sort((a, b) => a.nome.localeCompare(b.nome))}
                contentContainerStyle={{ paddingHorizontal: 14, }}
                ItemSeparatorComponent={<View style={{ borderBottomWidth: .5, borderColor: '#d9d9d9' }} />}
                ListHeaderComponent={<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                    <Text style={{ fontWeight: '500', color: "#000" }}>Cor</Text>
                    <Text style={{ fontWeight: '500', color: "#000" }}>Código</Text>
                </View>}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}>
                        <Text style={{ fontWeight: '300', color: "#000" }}>{item.nome}</Text>
                        <Text style={{ fontWeight: '300', color: "#000" }}>{item.codigo}</Text>
                    </View>
                )}
            />
        </View>
    );
}
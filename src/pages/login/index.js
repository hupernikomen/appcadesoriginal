import { useState, useContext } from 'react'
import { Text, Pressable, View, StyleSheet } from 'react-native'

import { AppContext } from '../../contexts/appContext'
import { useTheme } from '@react-navigation/native'

import Input from '../../components/Input'

export default function Login() {

    const { signIn } = useContext(AppContext)
    const { colors } = useTheme()
    const [nome, setNome] = useState("Wilson Ramos")
    const [senha, setSenha] = useState("123")

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <View style={{ width: '100%' }}>

                <View style={{ margin: 14 }}>
                    <Input value={nome} setValue={setNome} title={'Usuário'} type='email-address' />
                    <Input security={true} value={senha} setValue={setSenha} title={'Senha'} />
                </View>

                <Pressable
                    style={[stl.botaoEntrar, { backgroundColor: colors.theme }]}
                    onPress={() => signIn(nome, senha)}
                >

                    <Text style={{ color: '#fff' }}>Entrar</Text>

                </Pressable>
            </View>
        </View>
    );
}

const stl = StyleSheet.create({
    botaoEntrar: {
        marginHorizontal: 14,
        height: 65,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center"
    }
})
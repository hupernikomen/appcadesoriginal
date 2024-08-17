import { useState, useContext } from 'react'
import { Text, Pressable, View, StyleSheet } from 'react-native'
import Load from '../../components/Load'
import { AppContext } from '../../contexts/appContext'
import { useTheme } from '@react-navigation/native'

import MaskOfInput from '../../components/MaskOfInput';

export default function Login() {

    const { signIn, load } = useContext(AppContext)
    const { colors } = useTheme()
    const [nome, setNome] = useState('')
    const [senha, setSenha] = useState('')

    if (load) return <Load/>

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <View style={{ width: '100%' }}>

                <View style={{ margin: 14 }}>

                    <MaskOfInput value={nome} setValue={setNome} title='Usuário'/>
                    <MaskOfInput type='numeric' value={senha} setValue={setSenha} title='Senha'/>
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
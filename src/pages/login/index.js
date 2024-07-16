import { useState, useContext } from 'react'
import { Text, Pressable, View, TextInput, StyleSheet } from 'react-native'

import { useTheme } from '@react-navigation/native'
import Input from '../../components/Input'

import { AppContext } from '../../contexts/appContext'

export default function Login() {

    const { signIn } = useContext(AppContext)

    const { colors } = useTheme()

    const [name, setName] = useState("Xavier Queiroz")
    const [password, setPassword] = useState("123")

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <View style={{ width: '100%' }}>

                <View style={{margin:14}}>
                    <Input value={name} setValue={setName} title={'Usuário'} type='email-address'/>
                    <Input security={true} value={password} setValue={setPassword} title={'Senha'}/>
                    
                </View>


                <Pressable
                    style={[style.botaoEntrar, { backgroundColor: colors.theme }]}
                    onPress={() => signIn(name, password)}
                >

                    <Text style={{ color: '#fff' }}>Entrar</Text>

                </Pressable>


            </View>

        </View>
    );





}

const style = StyleSheet.create({
    inputs: {
        marginHorizontal: 14,
        marginVertical: 6,
        backgroundColor: '#f1f1f1',
        paddingHorizontal: 14,
        height: 60,
        fontSize: 16,
        borderRadius: 6
    },
    botaoEntrar: {
        marginHorizontal: 14,
        height: 60,
        borderRadius: 6,
        marginVertical: 6,
        padding: 14,
        justifyContent: "center",
        alignItems: "center"
    }
})
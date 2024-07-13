import { useState, useContext } from 'react'
import { Text, Pressable, View, TextInput, StyleSheet } from 'react-native'
import api from '../../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { useNavigation, useTheme } from '@react-navigation/native'

import { AppContext } from '../../contexts/appContext'

export default function Login() {

    const { signIn } = useContext(AppContext)

    const { colors } = useTheme()

    const [nome, setNome] = useState("Xavier Queiroz")
    const [senha, setSenha] = useState("123")

    return (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <View style={{ width: '100%' }}>

                <View>
                    <TextInput
                        style={style.inputs}
                        placeholder="Usuario"
                        keyboardType='email-address'
                        placeholderTextColor={'#aaa'}
                        maxLength={405}
                        onChangeText={setNome}
                        value={nome} />
                </View>

                <View>

                    <TextInput
                        style={style.inputs}
                        placeholder="Senha"
                        secureTextEntry
                        placeholderTextColor={'#aaa'}
                        maxLength={20}
                        onChangeText={setSenha}
                        value={senha} />
                </View>


                <Pressable
                    style={[style.botaoEntrar, { backgroundColor: colors.theme }]}
                    onPress={() => signIn(nome, senha)}
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
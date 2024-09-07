import { View, Dimensions, Text } from 'react-native';
import Icone from '../Icone';
import { useTheme } from '@react-navigation/native';

export default function Topo({ children, iconeLeft, iconeRight, right, titulo, posicao }) {

    const { width } = Dimensions.get("window")
    const { colors } = useTheme()

    return (
        <View style={{ elevation: 15 }}>

            <View style={{ backgroundColor: colors.theme, height: 60, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor:colors.detalhe }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icone onpress={iconeLeft?.acao} nomeDoIcone={iconeLeft?.nome} />
                    {posicao === 'left' ? <Text style={{ textAlign: 'left', color: '#fff', fontSize: 18, fontFamily: "Roboto-Medium" }}>{titulo}</Text> : null}
                </View>

                {posicao === 'center' ? <Text style={{ textAlign: 'left', color: '#fff', fontSize: 18, fontFamily: "Roboto-Medium" }}>{titulo}</Text> : null}

                <View style={{ minWidth: 55 }}>
                    <Icone onpress={iconeRight?.acao} nomeDoIcone={iconeRight?.nome} />
                </View>

            </View>
            {children}
        </View>
    );
}
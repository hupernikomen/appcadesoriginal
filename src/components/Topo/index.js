import { View, Dimensions } from 'react-native';
import Icone from '../Icone';
import Texto from '../Texto';
import { useTheme } from '@react-navigation/native';

export default function Topo({ children, iconeLeft, iconeRight, right, titulo, posicao }) {

    const { width } = Dimensions.get("window")
    const { colors } = useTheme()

    return (
        <View style={{ elevation: 15 }}>

            <View style={{ backgroundColor: colors.theme, height: 60, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <Icone onpress={iconeLeft?.acao} nomeDoIcone={iconeLeft?.nome} />
                    {posicao === 'left' ? <Texto cor='#fff' texto={titulo.substring(0, 26)} tamanho={18} tipo='Medium' /> : null}
                </View>
                {posicao === 'center' ? <Texto cor='#fff' texto={titulo.substring(0, 26)} tamanho={18} tipo='Medium' /> : null}

                <Icone onpress={iconeRight?.acao} nomeDoIcone={iconeRight?.nome} />

            </View>
            {children}
        </View>
    );
}
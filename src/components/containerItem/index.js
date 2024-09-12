import { Pressable } from 'react-native';

export default function ContainerItem({ children, onpress, altura, largura = '100%', opacidade= 1 }) {

    return (
        <Pressable onPress={onpress} style={{
            flexDirection: 'row',
            paddingHorizontal: 10,
            height: altura,
            width: largura,
            borderRadius:12,
            marginVertical: .8,
            alignItems: 'center',
            opacity: opacidade,
            paddingVertical:20,
        }}>
            {children}
        </Pressable>
    );
}
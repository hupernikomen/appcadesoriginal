import { Pressable } from 'react-native';

export default function ContainerItem({ children, onpress, altura = 70, largura = '100%', opacidade= 1 }) {

    return (
        <Pressable onPress={onpress} style={{
            backgroundColor: '#e9e9e9',
            flexDirection: 'row',
            paddingHorizontal: 10,
            height: altura,
            width: largura,
            borderRadius:12,
            marginVertical: .8,
            alignItems: 'center',
            opacity: opacidade
        }}>
            {children}
        </Pressable>
    );
}
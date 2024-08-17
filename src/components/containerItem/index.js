import { Pressable } from 'react-native';

export default function ContainerItem({ children, onpress, altura = 70, largura = '100%', opacidade= 1 }) {

    return (
        <Pressable onPress={onpress} style={{
            backgroundColor: '#f1f1f1',
            elevation: opacidade !== 1 ? 0 : 5,
            flexDirection: 'row',
            padding: 10,
            height: altura,
            width: largura,
            margin: 1,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: opacidade !== 1 ? '#e1e1e1' : '#fff' ,
            opacity: opacidade
        }}>
            {children}
        </Pressable>
    );
}
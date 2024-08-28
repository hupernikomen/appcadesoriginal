import { Text } from 'react-native';

export default function Texto({ alinhamento = 'left', texto, tipo = 'Regular', cor = '#000', tamanho = 14, estilo }) {

    return (
        <Text style={[{
            fontFamily: `Roboto-${tipo}`,
            color: cor,
            fontSize: tamanho,
            textAlign: alinhamento
        }, estilo]}>{texto}</Text>
    );
}
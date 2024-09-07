import { View, Pressable, Switch } from 'react-native';
import Texto from '../Texto';

import { useTheme } from '@react-navigation/native';

export default function SeletorAV({ setXAtacado, xAtacado }) {

  const { colors } = useTheme()
  const toggleSwitch = () => setXAtacado(previousState => !previousState);

  return (
    <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20, borderBottomWidth: .7, borderColor: '#ccc' }}>
      <Pressable onPress={() => {
        setXAtacado(false)
      }} style={{ flex: 1, alignItems: 'center', padding: 16, borderRadius: 6, }}>

        <Texto texto={'Atacado'} cor={!xAtacado ? colors.theme : '#ccc'} />
      </Pressable>

      <Switch
        trackColor={{ false: '#ddd', true: '#ddd' }}
        thumbColor={colors.detalhe}
        onValueChange={toggleSwitch}
        value={xAtacado}
      />

      <Pressable onPress={() => {
        setXAtacado(true)
      }} style={{ flex: 1, alignItems: 'center', padding: 16, borderRadius: 6 }}>
        <Texto texto={'Varejo'} cor={xAtacado ? colors.theme : '#ccc'} />
      </Pressable>
    </View>

  );
}
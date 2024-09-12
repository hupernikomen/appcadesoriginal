import { View, Pressable, Switch } from 'react-native';
import Texto from '../Texto';

import { useTheme } from '@react-navigation/native';

import Animated, { FadeInUp } from 'react-native-reanimated';

export default function SeletorAV({ setXAtacado, xAtacado, label1, label2 }) {

  const { colors } = useTheme()
  const toggleSwitch = () => setXAtacado(previousState => !previousState);

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(300)} style={{ flexDirection: "row",  backgroundColor: colors.background, elevation: 1, margin: 12, borderRadius:12 }}>
      <Pressable onPress={() => {
        setXAtacado(false)
      }} style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>

        <Texto texto={label1} cor={!xAtacado ? colors.theme : '#bbb'} />
      </Pressable>

      <Switch
        trackColor={{ false: '#ddd', true: '#ddd' }}
        thumbColor={colors.detalhe}
        onValueChange={toggleSwitch}
        value={xAtacado}
      />

      <Pressable onPress={() => {
        setXAtacado(true)
      }} style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>
        <Texto texto={label2} cor={xAtacado ? colors.theme : '#bbb'} />
      </Pressable>
    </Animated.View>

  );
}
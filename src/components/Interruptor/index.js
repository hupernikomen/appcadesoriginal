import { View, Pressable, Switch } from 'react-native';
import Texto from '../Texto';

import { useTheme } from '@react-navigation/native';

import Animated, { FadeInUp } from 'react-native-reanimated';

export default function Interruptor({ setInterruptor, interruptor, label1, label2 }) {

  const { colors } = useTheme()
  const toggleSwitch = () => setInterruptor(previousState => !previousState);

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(300)} style={{ flexDirection: "row",  backgroundColor: colors.background, elevation: 1, marginVertical: 24, borderRadius:12 }}>
      <Pressable onPress={() => {
        setInterruptor(false)
      }} style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>

        <Texto texto={label1} cor={!interruptor ? colors.padrao : '#bbb'} />
      </Pressable>

      <Switch
        trackColor={{ false: '#ddd', true: '#ddd' }}
        thumbColor={colors.detalhe}
        onValueChange={toggleSwitch}
        value={interruptor}
      />

      <Pressable onPress={() => {
        setInterruptor(true)
      }} style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>
        <Texto texto={label2} cor={interruptor ? colors.padrao : '#bbb'} />
      </Pressable>
    </Animated.View>

  );
}
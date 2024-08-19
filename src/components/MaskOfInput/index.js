import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRef } from 'react';
import MaskInput from 'react-native-mask-input';
import Texto from '../Texto';

export default function MaskOfInput({ styleMask, lines, load, mask, style,  editable = true, type = 'default', title, value = 1, setValue, multiline = true, maxlength, info }) {

  const inputRef = useRef(null);

  const handlePress = () => {
    inputRef.current.focus();
  };


  const styles = StyleSheet.create({
    box: {
      height: 60,
      paddingVertical: 8,
      borderRadius: 12,
      paddingHorizontal: 12,
      margin: 2,
      backgroundColor:"#e9e9e9"
    },
    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4
    },
    input: {
      fontFamily: 'Roboto-Regular',
      paddingVertical: 0,
      color: '#000',
      height: 25,
      verticalAlign: 'top'
    }
  })

  return (
    <Pressable onPress={handlePress} style={[styles.box, style]}>
      <View style={styles.boxtop}>
        <Texto texto={title} tipo={'Light'} tamanho={13} />
        <View>
          {load ? <ActivityIndicator size={14} /> :
            <Texto texto={info} tipo={'Light'} tamanho={13} />
          }
        </View>
      </View>

      <MaskInput
        numberOfLines={lines}
        ref={inputRef}
        editable={editable}
        style={[styles.input, styleMask]}
        maxLength={maxlength}
        placeholder=''
        multiline={multiline}
        keyboardType={type}
        value={value}
        onChangeText={(e) => setValue(e)}
        mask={mask}
      />

    </Pressable>
  );
}
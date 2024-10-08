import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRef } from 'react';
import MaskInput from 'react-native-mask-input';
import Texto from '../Texto';

export default function MaskOfInput({ bg = true, styleMask, lines, load, mask, style, editable, type = 'default', title, value = 1, setValue, multiline = true, maxlength, info }) {

  const inputRef = useRef(null);

  const handlePress = () => {
    inputRef.current.focus();
  };


  const styles = StyleSheet.create({
    box: {
      height: 54,
      paddingVertical: 4,
      borderRadius: 12,
      paddingHorizontal: 10,
      margin: 2,
      backgroundColor: bg ?  '#e9e9e999' : 'transparent',
    },
    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4
    },
    input: {
      paddingVertical: 0,
      color: '#000',
      height: 25,
      verticalAlign: 'top'
    }
  })

  return (
    <Pressable onPress={handlePress} style={[styles.box, style]}>
      <View style={styles.boxtop}>
        <Texto texto={title}  tipo={'Light'} tamanho={13} />
        <View>
          {load ? <ActivityIndicator size={14} /> :
            <Texto texto={info} tamanho={13} />
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
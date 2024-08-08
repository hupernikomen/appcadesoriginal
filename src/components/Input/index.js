import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRef } from 'react';
import Texto from '../Texto';

export default function Input({
  load,
  lines,
  styleInput,
  styleContainer,
  security = true,
  colorActive = '#777',
  editable = true,
  type = 'default',
  title,
  value,
  setValue,
  multiline = true,
  maxlength,
  info
}) {

  const inputRef = useRef(null);

  const handlePress = () => {
    inputRef.current.focus();
  };

  const styles = StyleSheet.create({
    box: {
      height: 65,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colorActive,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginVertical: 2
    },
    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    input: {
      paddingVertical: 0,
      fontFamily: 'Roboto-Regular',
      color: '#000',
      verticalAlign: 'top'
    }
  })

  return (
    <Pressable onPress={handlePress} style={[styles.box, styleContainer]}>
      <View style={styles.boxtop}>
        <Texto texto={title} tipo={'Light'} tamanho={13} />
        <View>
          {load ? <ActivityIndicator size={14} /> :
            <Texto texto={info} tipo={'Light'} tamanho={13} />
          }
        </View>
      </View>

      <TextInput
        ref={inputRef}
        numberOfLines={lines}
        secureTextEntry={security}
        editable={editable}
        maxLength={maxlength}
        multiline={multiline}
        style={[styles.input, styleInput]}
        keyboardType={type}
        value={value}
        onChangeText={setValue}
      />
    </Pressable>
  );
}
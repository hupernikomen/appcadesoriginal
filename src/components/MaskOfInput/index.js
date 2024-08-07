import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRef } from 'react';
import MaskInput from 'react-native-mask-input';

export default function MaskOfInput({ load,mask, style, colorActive = '#777', editable = true, type = 'default', title, value = 1, setValue, multiline = true, maxlength, info }) {

  const inputRef = useRef(null);

  const handlePress = () => {
    inputRef.current.focus();
  };


  const styles = StyleSheet.create({
    box: {
      height: 60,
      paddingVertical: 8,
      borderWidth: .7,
      borderColor: colorActive,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginVertical:2
    },
    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4
    },
    title: {
      fontFamily: 'Roboto-Light',
      color: '#000',
      fontSize: 13,
      fontWeight: '300',

    },
    info: {
      fontFamily: 'Roboto-Light',
      color: '#000',
      fontSize: 13
    },
    input: {
      fontFamily: 'Roboto-Regular',
      paddingVertical: 0,
      color: '#000',
      height: 20
    }
  })

  return (
    <Pressable onPress={handlePress} style={[styles.box, style]}>
      <View style={styles.boxtop}>
        <Text style={styles.title}>{title}</Text>
        {load ? <ActivityIndicator size={14} /> :
            <Text style={styles.info}>{info}</Text>
          }
      </View>

      <MaskInput
        ref={inputRef}
        editable={editable}
        placeholder=''
        style={styles.input}
        keyboardType='numeric'
        value={value}
        onChangeText={(e) => setValue(e)}
        mask={mask}
      />

    </Pressable>
  );
}
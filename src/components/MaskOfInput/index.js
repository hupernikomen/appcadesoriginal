import { View, Text, StyleSheet } from 'react-native';
import MaskInput from 'react-native-mask-input';

export default function MaskOfInput({ mask, style, colorActive = '#777', editable = true, type = 'default', title, value = 1, setValue, multiline = true, maxlength, info }) {


  const styles = StyleSheet.create({
    box: {
      margin: 2,
      height: 55,
      paddingVertical: 8,
      borderWidth: .7,
      borderColor: colorActive,
      borderRadius: 12,
      paddingHorizontal: 12,
    },
    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 4
    },
    title: {
      color: '#000',
      fontSize: 13,
      fontWeight: '300',

    },
    info: {
      color: '#000',
      fontSize: 13
    },
    input: {
      paddingVertical: 0,
      color: '#000',
      height:20
    }
  })

  return (
    <View style={[styles.box, style]}>
      <View style={styles.boxtop}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.info}>{info}</Text>
      </View>

      <MaskInput
        editable={editable}
        placeholder=''
        style={styles.input}
        keyboardType='numeric'
        value={value}
        onChangeText={(e) => setValue(e)}
        mask={mask}
      />

    </View>
  );
}
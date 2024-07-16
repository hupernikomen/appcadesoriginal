import { View, Text, StyleSheet } from 'react-native';
import MaskInput from 'react-native-mask-input';

export default function MaskOfInput({mask, editable = true, type = 'default', title, value =1, setValue, multiline = true, maxlength, info }) {


  const styles = StyleSheet.create({
    box: {
      paddingVertical: 8,
      marginVertical: 4,
      borderWidth: .4,
      borderColor: '#777',
      borderRadius: 6,
      paddingHorizontal: 12,
    },
    boxtop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 6
    },
    title: {
      opacity: value ? .4 : 1,
      color: '#000',
      fontSize: 13
    },
    info: {
      color: '#000',
      fontSize: 13
    },
    input: {
      fontSize: 15,
      paddingVertical: 0,
      color: '#000'
    }
  })

  return (
    <View style={styles.box}>
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
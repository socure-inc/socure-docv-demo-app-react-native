/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Button,
  Platform,
  ToastAndroid,
  Alert,
  Text,
} from 'react-native';
import {launchSocureDocV} from '@shekhar.gupta/wrapper-rn';

export default function App() {
  const [status, setStatus] = useState<string>('');

  const notifyMessage = msg => {
    setStatus(msg);
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  const successCallback = result => {
    notifyMessage(`Success: {docUUID = ${result.docUUID}}`);
    console.log(result);
  };

  const errorCallback = error => {
    notifyMessage(
      `Failure: {code: ${error.statusCode}, message: ${error.errorMessage}}`,
    );
    console.log(error);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.textStyle}>{status}</Text>

      <Button
        title="Launch Socure DocV"
        onPress={() => {
          launchSocureDocV(
            'YOUR_SOCURE_SDK_KEY',
            undefined,
            successCallback,
            errorCallback,
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  textStyle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    marginBottom: 100,
  },
});

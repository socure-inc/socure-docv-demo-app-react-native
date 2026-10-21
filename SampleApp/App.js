/**
 * Sample React Native App
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Button,
  Platform,
  ToastAndroid,
  Alert,
  Text,
} from 'react-native';
import { launchSocureDocV, launchSocureDocVWithPromise } from '@socure-inc/docv-react-native';

const docVTransactionToken = 'your transaction token';
const yourSocureSdkKey = 'your socure sdk key';

export default function App() {
  const [status, setStatus] = useState('');
  const useSocureGov = false;

  const notifyMessage = useCallback((msg) => {
    setStatus(msg);
    Platform.OS === 'android' ? ToastAndroid.show(msg, ToastAndroid.SHORT) : Alert.alert(msg);
  }, []);

  const handleLaunchWithCallbacks = () => {
    launchSocureDocV(
      docVTransactionToken,
      yourSocureSdkKey,
      useSocureGov,
      (result) => {
        notifyMessage(`Success: {deviceSessionToken = ${result.deviceSessionToken}}`);
        console.log(result);
      },
      (error) => {
        notifyMessage(`Failure: {Error Message: ${error.error}, code: ${error.code}}`);
        console.log(error);
      },
    );
  };

  const handleLaunchWithPromise = async () => {
    try {
      const result = await launchSocureDocVWithPromise(
        docVTransactionToken,
        yourSocureSdkKey,
        useSocureGov,
      );
      notifyMessage(`Success: {deviceSessionToken = ${result.deviceSessionToken}}`);
      console.log(result);
    } catch (e) {
      notifyMessage(`Failure: {Error Message: ${e.message}, code: ${e.code}}`);
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
      <Button title="Launch Socure DocV (Callback)" onPress={handleLaunchWithCallbacks} />
      <View style={styles.buttonSpacer} />
      <Button title="Launch Socure DocV (Promise)" onPress={handleLaunchWithPromise} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    marginBottom: 100,
  },
  buttonSpacer: {
    height: 16,
  },
});

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
import { launchSocureDocV } from '@socure-inc/docv-react-native';

export default function App() {
  const [status, setStatus] = useState('');
  const useSocureGov = false;

  const notifyMessage = useCallback((msg) => {
    setStatus(msg);
    Platform.OS === 'android' ? ToastAndroid.show(msg, ToastAndroid.SHORT) : Alert.alert(msg);
  }, []);

  const successCallback = useCallback((result) => {
    const message = `Success: {deviceSessionToken = ${result.deviceSessionToken}}`;
    notifyMessage(message);
    console.log(result);
  }, [notifyMessage]);

  const errorCallback = useCallback((error) => {
    const message = `Failure: {Error Message: ${error.error}, deviceSessionToken: ${error.deviceSessionToken}}`;
    notifyMessage(message);
    console.log(error);
  }, [notifyMessage]);

  const handleLaunch = () => {
    launchSocureDocV(
      'docvTransactionToken',
      'YOUR_SOCURE_SDK_KEY',
      useSocureGov,
      successCallback,
      errorCallback
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
      <Button title="Launch Socure DocV" onPress={handleLaunch} />
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
});

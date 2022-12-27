# Predictive DocV SDK v3 React Native

The Predictive Document Verification (DocV) SDK v3 for React Native is a React Native wrapper that allows you to use the DocV SDK for Android and iOS in your React Native application. 

>Note: All SDK v3 integrations should be updated to version 3.1.0 to meet compliance requirements. Document verification services will be disabled for older SDK versions soon.

## Minimum Requirements

**React Native**

- React Native CLI. See the [React Native docs](https://reactnative.dev/docs/environment-setup) for instructions on how to set up your development environment. 

**iOS**

- Support for iOS 13 and later
- Xcode version 13+

**Android**

- Android SDK Version 22 (OS Version 5.1) and later
- Android SDK is compiled with `compileSdkVersion` 32 and Java 11

## Getting started

To get started, complete the steps in the following sections:  

- [Install the React Native wrapper with NPM](#install-the-react-native-wrapper-with-npm)
- [Configure your iOS or Android app](#configure-your-ios-or-android-app)
- [Import and launch the SDK](#import-and-launch-the-sdk)

## Install the React Native wrapper with NPM

In your React Native project, install the DocV React Native wrapper by running the following NPM command:

```
npm install @socure-inc/docv-react-native
```

## Configure your iOS or Android app

Your React Native project needs to access the DocV iOS or Android SDKs through the React Native wrapper. Follow the instructions in the drop down menus below to integrate the DocV SDK into your iOS or Android app. 

<br />

<details>
  <summary><b>Integrate with the DocV iOS SDK</b></summary>

<br />

### Configure your iOS app

For the iOS app, you can install the DocV iOS SDK into your project using Cocoapods. If you do not already have the CocoaPods tool installed, see the [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html#installation). 

#### Add project dependencies

In your root project folder, open your Podfile with a text editor and specify the following project dependencies: 

- Replace the deployment target with `platform :ios, '13.0'`.
- Add the line pod `'socure-docv-react-native', :path => '../node_modules/@socure-inc/docv-react-native'`

Once completed, your Podfile should look like the following example: 

```swift {4,36}
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '13.0'
install! 'cocoapods', :deterministic_uuids => false

production = ENV["PRODUCTION"] == "1"

target 'SocureDocVDemo' do
  config = use_native_modules!

  # Flags change depending on the env values.
  flags = get_default_flags()

  use_react_native!(
    :path => config[:reactNativePath],
    # to enable hermes on iOS, change `false` to `true` and then install pods
    :production => production,
    :hermes_enabled => flags[:hermes_enabled],
    :fabric_enabled => flags[:fabric_enabled],
    :flipper_configuration => FlipperConfiguration.enabled,
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  target 'SocureDocVDemoTests' do
    inherit! :complete
    # Pods for testing
  end

  post_install do |installer|
    react_native_post_install(installer)
    __apply_Xcode_12_5_M1_post_install_workaround(installer)
  end

pod 'socure-docv-react-native', :path => '../node_modules/@socure-inc/docv-react-native'

end
```

#### Install the dependencies

Change the location of your working directory to the `iOS` folder: 

```
cd ios
```

Install the Cocoapods dependencies by running the following command: 

```
pod install
```

#### Use the CocoaPods-generated `.xcworkspace` file

The CocoaPods installation command generates a `.xcworkspace` file with all the dependencies configured. To continue with the installation, complete the following: 

- Close Xcode and then open your project's `.xcworkspace` file to launch Xcode. From now on, use the `.xcworkspace` to open your project. 
- Check that your deployment target is set to iOS 13 or later. 

#### Request camera permissions

The DocV iOS SDK requires a device's camera permission to capture identity documents. Upon the first invocation of the SDK, the app will request camera permission from the consumer. If the app does not already use the camera, you must add the following to the app’s `Info.plist file`: 

| Key                                | Type   | Value                                                                                       |
|------------------------------------|--------|---------------------------------------------------------------------------------------------|
| Privacy - Camera Usage Description | String | "This application requires use of your camera in order to capture your identity documents." |


> **Note:** We recommend you check for camera permission before calling the SocureDocV SDK’s launch API. 

### Run the app

Using the command line, go to your root project folder and enter the following command to run the app: 

```
"react-native run-ios"
```

</details>

<details>
  <summary><b>Integrate with the DocV Android SDK</b></summary>

<br />
  
### Configure your Android app

For the Android app, add your project dependencies by going to the module level `build.gradle` file and making sure the `minSdkVersion` is set to at least 22 and the `compileSdkVersion` is set to at least 32. 

```kotlin {5,6}
buildscript {
              .....
            ext {
                 ....
                minSdkVersion = 22 
                compileSdkVersion = 32
                .....
            }
}
```

### Camera permissions

The DocV Android SDK requires camera permission to capture identity documents. Upon the first invocation of the SDK, your app will request camera permission from the user.

> **Note:** We recommend you check for camera permissions before calling the Socure DocV SDK’s launch API. 

#### Required permissions

Ensure that your app manifest has been set up properly to request the following required permissions:

```
<uses-feature android:name="android.hardware.camera" />

<!-- Declare permissions -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
```

## Run the app

From the command line, go to your root project folder and enter the following command to run the app: 

```
react-native run-android
```

</details>

<br />

## Import and launch the SDK

After you have installed the DocV SDK React Native wrapper using NPM and configured your iOS or Android app, add the following code to your `App.js` file to import `launchSocureDocV`:

```jsx
import { launchSocureDocV } from "@socure-inc/docv-react-native"
```

To launch the Socure DocV SDK, specify your SDK key and call the `launchSocureDocV` launch function: 

```jsx
launchSocureDocV("SOCURE_SDK_KEY", flow, onSuccess, onError);
```

## How it works

Your React Native application initializes and communicates with the DocV SDK through the React Native wrapper using the `launchSocureDocV` instance. The `launchSocureDocV` function also includes two callback functions, one for `onSuccess` and one for `onError`. See [Response callbacks](#response-callbacks) below for more information.  

The following table lists the available `launchSocureDocV` properties:

| Argument           | Description                                                                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `socure_sdk_key`   | The unique SDK key obtained from Admin Dashboard. For more information on SDK keys, see the [Getting Started](https://developer.socure.com/docs/) article.                                                                                                                          |
| `flow`           | An optional JSON string or null value that specifies a custom flow. The `FLOW_NAME` value specifies the name of the flow (created in Admin Dashboard) that the DocV SDK should use.  <br /> <br />`JSON.stringify({flow: {name: “FLOW_NAME”}})` <br /> <br />If the value is `null`, the DocV SDK will fetch the default flow from Admin Dashboard. |  |   |
| `onSuccess`      | A callback function that notifies you when the flow completes successfully.                                                                                                                                                                                                                                                                                               |   |   |
| `onError`        | A callback function that notifies you when the flow fails.                                                                                                                                                                                                                                                                                                |   |   |

                                                                                
## Response callbacks

Your app can receive a response callback from the Socure DocV SDK when the flow completes successfully or returns with an error using the `onSuccess` and `onError` callback functions.

### `onSuccess` response
When the consumer successfully completes the flow and the captured images are uploaded, the `onSuccess` callback receives the ScannedData object which contains session information and the extracted data. The table below lists the available `ScannedData` properties.

| Result Field   | Type        | Description                                                                                                                                                                                          |
|----------------|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `docUUID`        | string      | The UUID for the uploaded scanned images.                                                                                                                                                             |
| `sessionId`      | string      | The session ID for the scan session.                                                                                                                                                                 |
| `extractedData`  | JSON object | Contains extractedInfo from the barcode or MRZ.                                                                                                                                                      |
| `captureData`    | JSON object | The mapped capture type for every scan. <br /> Possible keys are: `lic_front`, `lic_back`, `passport`, `selfie` <br /> Possible values can be `manual` or `auto`                                                              |
| `capturedImages` | JSON object | The mapped image data of captured images. <br /> Possible keys are: `lic_front`, `lic_back`, `passport`, `selfie` <br />  Value will be a base64 image string <br />**Note**: Prefix `data:image/png;base64,` while using base64 string. |

#### Sample `onSuccess` response
```json
{
  "docUUID": "UUID for the uploaded scanned images",
  "sessionId": "Session ID for the particular scan session",
  "extractedData": {
    "address": "123 TAYLOR AVE",
    "issueDate": "09282007",
    "parsedAddress": {
      "city": "SAN BRUNO",
      "country": "USA",
      "physicalAddress": "123 TAYLOR AVE",
      "physicalAddress2": "SAN BRUNO",
      "postalCode": "940660000",
      "state": "CA"
    },
    "dob": "07221977",
    "documentNumber": "D12345",
    "expirationDate": "07222022",
    "firstName": "SAM",
    "fullName": "SAM SOTO",
    "type": "barcode"
  },
  "captureData": {
    "lic_front": "auto",
    "lic_back": "auto",
    "passport": "auto",
    "selfie": "manual"
  },
  "capturedImages": {
    "lic_front": "base64 Image as String",
    "lic_back": "base64 Image as String",
    "selfie": "base64 Image as String"
  }
}
```

### `onError` response

If the consumer exits the flow without completing it or the SDK encounters an error, the `onError` callback receives the `ScanError` object which contains session information and the error. The table below lists the available `ScanError` properties.

| Error Field    | Type        | Description                                                                                                                                                                                                          |
|----------------|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `capturedImages` | JSON object | The mapped image data of captured images (if available). <br /> Possible keys are: `lic_front`, `lic_back`, `passport`, `selfie` <br /> Value will be a base64 image string <br /> **Note**: Prefix `data:image/png;base64,` while using base64 string. |
| `errorMessage`   | string      | The error code description.                                                                                                                                                                                          |
| `sessionId`      | string      | The session ID for the particular scan session.                                                                                                                                                                      |
| `statusCode`     | string      | The error code returned by Socure DocV SDK.                                                                                                                                                                          |

#### Sample `onError` response
```json
{
  "capturedImages": {
    "passport": "base64 Image as String"
  },
  "errorMessage": "Scan canceled by the user",
  "sessionId": "2a55f9-42bgfa-4fb3-9gf32e-6a6fec5",
  "statusCode": "7104"
}
```

### Error codes

The following table lists the errors that can be returned by Socure DocV SDK:

| Error Code | Error Description (string)                              |
| ---------- | ------------------------------------------------------- |
| `7011`       | `Invalid key`                                             |
| `7021`       | `Failed to initiate the session `                         |
| `7014`       | `Session expired   `                                      |
| `7101`       | `Empty key `                                              |
| `7103`       | `No internet connection  `                                |
| `7102`       | `Do not have the required permissions to open the camera` |
| `7022`       | `Failed to upload the documents `                         |
| `7104`       | `Scan canceled by the user`                               |
| `7106`       | `Camera error`                                            |
| `7107`       | `Unknown error`                                           |
| `7108`       | `Camera resolution doesn't match the minimum requirement` |
| `7109`       | `Invalid config data`                                     |
| `7110`       | `Consent declined`                                        |

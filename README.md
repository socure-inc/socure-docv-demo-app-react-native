# Predictive DocV SDK React Native v5

The Predictive Document Verification (DocV) SDK for React Native is a React Native wrapper that allows you to use the DocV SDK for Android and iOS in your React Native application. 

>Note: Document verification services will be disabled for older SDK versions soon. All SDK integrations must be updated to version **3.1.0 or later** to meet compliance requirements.

## Minimum Requirements

Before getting started, check that your development environment meets the following requirements:

**React Native**

- React Native CLI. See the [React Native docs](https://reactnative.dev/docs/environment-setup) for instructions on how to set up your development environment. 

**iOS**

- Xcode version 14.1+
- Support for iOS 13 and later

**Android**

- Android SDK Version 22 (OS Version 5.1) and later
- Android SDK is compiled with `compileSdkVersion 34` and Java 17

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

For the Android app, add your project dependencies by going to the module level `build.gradle` file and making sure the `minSdkVersion` is set to at least 22 and the `compileSdkVersion` is set to at least 33. 

```kotlin {5,6}
buildscript {
              .....
            ext {
                 ....
                minSdkVersion = 22 
                compileSdkVersion = 34
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

## Generate a transaction token and configure the Capture App

To initiate the verification process, generate a transaction token (`docvTransactionToken`) by calling the Document Request endpoint v5. We strongly recommend that customers generate this token via a server-to-server API call and then pass it to the DocV SDK to ensure the security of their API key and any data they send to Socure.

### Call the Document Request endpoint

1. From your backend, make a `POST` request to the [`/documents/request`](https://developer.socure.com/reference#tag/Predictive-Document-Verification/operation/DocumentRequestV5) endpoint specifying the following information in the `config` object:

| Parameter   | Required | Description                                                                                                                                                                                                                                                                                                                                                     |
|------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `language`       | Optional     | Determines the language package for the UI text on the Capture App. Possible values are: <br/><br/> - Arabic: `ar` <br/> - Armenian: `hy` <br/> - Bengali: `bn` <br/> - Brazilian Portuguese: `pt-br` <br/> - Chinese (Simplified): `zh-cn` <br/> - Chinese (Traditional): `zh-tw` <br/> - English: `en` <br/> - French: `fr` <br/> - Haitian Creole: `ht` <br/> - Italian: `it` <br/> - Korean: `ko` <br/> - Polish: `pl-PL` <br/> - Russian: `ru` <br/> - Spanish (EU): `es` <br/> - Tagalog: `tl` <br/> - Urdu: `ur` <br/> - Vietnamese: `vi` <br/><br/> **Note**: Socure can quickly add support for new language requirements. For more information, contact [support@socure.com](mailto:support@socure.com). |
| `useCaseKey`     | Optional     | Deploys a customized Capture App flow on a per-transaction basis. Replace the `customer_use_case_key` value with the name of the flow you created in [Admin Dashboard](https://developer.socure.com/docs/sdks/docv/capture-app/customize-capture-app). <br/><br/> - If this field is empty, the Capture App will use the flow marked as **Default** in Admin Dashboard. <br/> - If the value provided is incorrect, the SDK will return an `Invalid Request` error. |

>Note: We recommend including as much consumer PII in the body of the request as possible to return the most accurate results.

```bash
curl --location 'https://service.socure.com/api/5.0/documents/request' \
--header 'Content-Type: application/json' \
--header 'Authorization: SocureApiKey a182150a-363a-4f4a-xxxx-xxxxxxxxxxxx' \
--data '{
  "config": {
    "useCaseKey": "customer_use_case_key", 
    ...
  }
  "firstName": "Dwayne",
  "surName": "Denver",
  "dob": "1975-04-02",
  "mobileNumber": "+13475550100",
  "physicalAddress": "200 Key Square St",
  "physicalAddress2": null,
  "city": "Brownsville",
  "state": "TN",
  "zip": "38012",
  "country": "US"
}'
```

2. When you receive the API response, collect the `docvTransactionToken`. This value is required to initialize the DocV Android SDK and fetch the DocV results.

```json
{
  "referenceId": "123ab45d-2e34-46f3-8d17-6f540ae90303",
    "data": {
      "eventId": "acdf5b1a-c96b-4ed8-92b9-59471397d04a",
      "customerUserId": "121212",
      "docvTransactionToken" : "acdf5b1a-c96b-4ed8-92b9-59471397d04a", 
      "qrCode": "data:image/png;base64,iVBO......K5CYII=",
      "url": "https://verify.socure.com/#/dv/acdf5b1a-c96b-4ed8-92b9-59471397d04a"
    }
}
```

## Import and launch the SDK

Add the following code to your  `App.js` file to import `launchSocureDocV`:

```jsx
import { launchSocureDocV } from "@socure-inc/docv-react-native"
```

Call `launchSocureDocV` to initiate the Socure DocV SDK: 

```jsx
launchSocureDocV("docVTransactionToken", "SOCURE_SDK_KEY", userSocureGov, onSuccess, onError);
```

## How it works

Your React Native application initializes and communicates with the DocV SDK through the React Native wrapper using the `launchSocureDocV` instance. The `launchSocureDocV` function also includes two callback functions, one for `onSuccess` and one for `onError`. See [Response callbacks](#response-callbacks) below for more information.  

The following table lists the available `launchSocureDocV` properties:

| Argument           | Description                                                                                                                                                                                                                          |
| ------------------ |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `socure_sdk_key`   | The unique SDK key obtained from [Admin Dashboard] (https://dashboard.socure.com/) used to authenticate the SDK. For more information, see the [SDK Keys](https://developer.socure.com/docs/admin-dashboard/developers/sdk-keys) article in DevHub. |
| `DocV_Transaction_Token	`   | The transaction token retrieved from the API response of the [/documents/request] (https://developer.socure.com/reference/#tag/Predictive-Document-Verification) endpoint. Required to initiate the document verification session.   |  |   |
| `useSocureGov	`   | A Boolean flag indicating whether to use the GovCloud environment. It defaults to `false`. This is only applicable for customers provisioned in the SocureGov environment.    |  |   |
| `onSuccess`      | A callback function invoked when the flow completes successfully.                                                                                                                                                           |   |   |
| `onError`        | A callback function invoked when the flow fails.                                                                                                                                                                           |   |   |

                                                                                
## Handle response callbacks

Your app can receive response callbacks from the launchSocureDocV function when the flow either completes successfully or returns with an error. The SDK represents these outcomes using the `onSuccess` and `onError` callback functions.

### `onSuccess` response

The `onSuccess` callback is triggered when the consumer successfully completes the verification flow and the captured images are uploaded to Socure's servers. It returns an object containing a device session token, which can be used for accessing device details about the specific session.

```javascript 
{ 
  deviceSessionToken: 'eyJraWQiOiJmMzRiN2YiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzd3QiOiJmZWJlMDYxNS0wYjgxLTRkNTMtYjgyMS03YTAxNjUwZTFiMjEifQ.kz3W8oQxmlqWk1x3W4mf7BSgGmr-qAyvN6fxR_yusbfWdznYVAzdeabHdyW0vAFGgGYvEmyX-5YUtHDMQB0ptA' 
}
```

### `onError` response

The `onError` callback is triggered when the DocV SDK encounters an error or when the consumer exits the flow without completing it. It returns a message printed with the `deviceSessionToken` and specific error details.

```javascript title="Error object example"
{ 
  deviceSessionToken: 'eyJraWQiOiJmMzRiN2YiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzd3QiOiJmZWJlMDYxNS0wYjgxLTRkNTMtYjgyMS03YTAxNjUwZTFiMjEifQ.kz3W8oQxmlqWk1x3W4mf7BSgGmr-qAyvN6fxR_yusbfWdznYVAzdeabHdyW0vAFGgGYvEmyX-5YUtHDMQB0ptA',
  error: 'Scan canceled by the user' 
}
```

#### Possible `onError` messages

The following error messages may be returned by the Socure DocV SDK:

| Error Message                                         | Error Description                                                 |
|-------------------------------------------------------|-------------------------------------------------------------------|
| `"No internet connection"`                              | No internet connection                     |
| `"Failed to initiate the session"`                      | Failed to initiate the session             |
| `"Permissions to open the camera declined by the user"` | Permissions to open the camera declined by the user                                    |
| `"Consent declined by the user"`                        | Consent declined by the user                              |
| `"Failed to upload the documents"`                      | Failed to upload the documents |
| `"Invalid transaction token"`                          | Invalid transaction token           |
| `"Invalid or missing SDK key"`                          | Invalid or missing SDK key                       |
| `"Session expired"`                                    | Session expired                         |
| `"Scan canceled by the user"`                           | Scan canceled by the user                   |
| `"Unknown error"`                                       | Unknown error                                     |


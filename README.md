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

- Android SDK Version 23 (OS Version 6) and later
- Android SDK is compiled with `compileSdkVersion 36` and Java 17

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
                compileSdkVersion = 36
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

The wrapper exposes two APIs. Use **`launchSocureDocVWithPromise`** for new integrations and any app running React Native 0.79+. Use **`launchSocureDocV`** if your codebase already uses callbacks or you need to support older React Native versions.

### Option A: Promise-based API (recommended)

The Promise-based API is the recommended approach for New Architecture apps. It uses `async/await` and standard JavaScript error handling.

1. Import `launchSocureDocVWithPromise`:

```jsx
import { launchSocureDocVWithPromise } from "@socure-inc/docv-react-native";
```

2. Call `launchSocureDocVWithPromise` inside an `async` function:

```jsx
try {
  const result = await launchSocureDocVWithPromise(
    "docVTransactionToken",
    "SOCURE_SDK_KEY",
    false // useSocureGov
  );
  console.log("Success:", result.deviceSessionToken);
} catch (error) {
  console.log("Error code:", error.code);
  console.log("Error message:", error.message);
}
```

#### `launchSocureDocVWithPromise` Parameters

| Parameter | Type | Description |
|---|---|---|
| `docVTransactionToken` | String | The transaction token from the [`/documents/request`](https://developer.socure.com/reference#tag/Predictive-Document-Verification) API response. Required to initiate the document verification session. |
| `publicKey` | String | The unique SDK key from [Admin Dashboard](https://developer.socure.com/docs/admin-dashboard/developers/sdk-keys) used to authenticate the SDK. |
| `useSocureGov` | Boolean | Set to `true` to use the GovCloud environment. Defaults to `false`. Applicable only to customers provisioned in the SocureGov environment. |

**Returns:** `Promise<DocVResult>` — resolves with `{ deviceSessionToken: string }` on success, or rejects with an error object containing `code` and `message` on failure.

---

### Option B: Callback-based API (legacy)

The callback-based API is preserved for backward compatibility. Existing integrations do not require any code changes.

1. Import `launchSocureDocV`:

```jsx
import { launchSocureDocV } from "@socure-inc/docv-react-native";
```

2. Call `launchSocureDocV` to initiate the Socure DocV SDK:

```jsx
launchSocureDocV(
  "docVTransactionToken",
  "SOCURE_SDK_KEY",
  false, // useSocureGov
  onSuccess,
  onError
);
```

#### `launchSocureDocV` Parameters

| Parameter | Type | Description |
|---|---|---|
| `docVTransactionToken` | String | The transaction token from the [`/documents/request`](https://developer.socure.com/reference#tag/Predictive-Document-Verification) API response. Required to initiate the document verification session. |
| `publicKey` | String | The unique SDK key from [Admin Dashboard](https://developer.socure.com/docs/admin-dashboard/developers/sdk-keys) used to authenticate the SDK. |
| `useSocureGov` | Boolean | Set to `true` to use the GovCloud environment. Defaults to `false`. Applicable only to customers provisioned in the SocureGov environment. |
| `onSuccess` | Function | A callback function invoked when the flow completes successfully. |
| `onError` | Function | A callback function invoked when the flow fails. |

> **New Architecture note:** Under React Native New Architecture, `launchSocureDocV` automatically routes through the TurboModule promise API and bridges the result back to your `onSuccess` / `onError` callbacks. No code changes are required.

## Handle response callbacks

### Success response

When the consumer successfully completes the verification flow and the captured images are uploaded to Socure's servers, the SDK returns a `DocVResult` object containing a device session token.

**Promise API** — the `Promise` resolves with:

```javascript
{
  deviceSessionToken: 'eyJraWQiOiJmMzRiN2YiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...'
}
```

**Callback API** — the `onSuccess` callback receives the same object:

```javascript
{
  deviceSessionToken: 'eyJraWQiOiJmMzRiN2YiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...'
}
```

The `deviceSessionToken` can be used to access device risk details for the specific session.

### `onError` response

The `onError` callback (and Promise rejection) is triggered when the DocV SDK encounters an error or when the consumer exits the flow without completing it.

**Promise API** — the `Promise` rejects with a JavaScript `Error`-like object. Access `error.code` and `error.message`:

```javascript
try {
  const result = await launchSocureDocVWithPromise(token, key, false);
} catch (error) {
  console.log(error.code);    // e.g. "ERR_USER_CANCELED"
  console.log(error.message); // e.g. "Scan canceled by the user"
}
```

**Callback API** — the `onError` callback receives an object with the following shape:

```javascript
{
  code: 'ERR_USER_CANCELED',
  error: 'Scan canceled by the user',
  deviceSessionToken: 'eyJraWQiOiJmMzRiN2YiLCJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...'
}
```

> **Migration note:** The `error` field (human-readable message string) is preserved from previous versions. The new `code` field (machine-readable constant) was added in this release to enable reliable programmatic error handling without string matching.

#### Error reference

The following errors may be returned by the Socure DocV SDK:

| `code` | `error` message | Description |
|---|---|---|
| `ERR_NO_INTERNET` | `"No internet connection"` | Device has no network connectivity. |
| `ERR_SESSION_INITIATION` | `"Failed to initiate the session"` | The SDK could not start a verification session with Socure servers. |
| `ERR_CAMERA_PERMISSION` | `"Permissions to open the camera declined by the user"` | The user denied camera access. |
| `ERR_CONSENT_DECLINED` | `"Consent declined by the user"` | The user declined the consent screen. |
| `ERR_UPLOAD_FAILURE` | `"Failed to upload the documents"` | Captured images could not be uploaded. |
| `ERR_INVALID_TOKEN` | `"Invalid transaction token"` | The `docVTransactionToken` is missing, malformed, or already used. |
| `ERR_INVALID_KEY` | `"Invalid or missing SDK key"` | The `publicKey` (SDK key) is invalid or was not provided. |
| `ERR_SESSION_EXPIRED` | `"Session expired"` | The verification session timed out before completion. |
| `ERR_USER_CANCELED` | `"Scan canceled by the user"` | The user dismissed the capture flow before completing it. |
| `ERR_NO_ACTIVITY` | `"App activity is null"` | Android only — the host `Activity` was not available when the SDK attempted to launch. |
| `ERR_NO_DATA` | `"No result data returned from SDK"` | Android only — the SDK activity returned without data. |
| `ERR_NO_VIEW_CONTROLLER` | `"Failed to get root view controller"` | iOS only — the root `UIViewController` could not be resolved. |
| `ERR_ALREADY_IN_PROGRESS` | `"A DocV session is already in progress"` | A previous call has not yet resolved. Wait for it to complete before launching again. |
| `ERR_UNKNOWN` | `"Unknown error"` | An unrecognized error occurred. |



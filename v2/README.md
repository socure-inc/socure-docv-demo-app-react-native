# Predictive DocV SDK v2 for React Native

# Version: 1.2.0 - Release Date : Nov 2022

> **Note:** The code in this GitHub repo is for integrating with the DocV SDK v2 React Native bridge. We strongly recommend that you install the latest DocV SDK v3 for React Native via NPM to integrate with the most recent version. See the [React Native Sample App GitHub repo](https://github.com/socure-inc/socure-docv-demo-app-react-native) for more information.

The Socure SDK React Native bridge allows developers to use React to call the Socure Document
Verification SDK. We provide both Android and iOS native library variants.

The Predictive Document Verification (DocV) SDK v2 for React Native is a React Native bridge that allows you to use the DocV SDK for Android and iOS in your React Native application.

This guide covers the integration within React, as well as React Native implementation on iOS and Android.

**Android**

- Android SDK is compiled with `minSdkVersion 22` and `compilerSDKVersion 32`
- Document and Selfie Auto Capture features require Android 8 and later

Additionally, OkHttp3 and Retrofit dependencies require the following:

- okHttp version `4.9.3`
- retrofit version `2.9.0`

**iOS**

- iOS 12 and later
- XCode version 11.4+

Additionally, the features below require the following:

- Document and selfie capture: iOS 12 and later
- Barcode data extraction on device: iOS 12 and later
- MRZ data extraction on device: iOS 13 and later

## Installation

To integrate the DocV SDK into your React Native application, complete the following steps: 

1. Review the steps below for installing the DocV iOS or Android SDK. 
2. Contact Socure when you are ready to begin implementation of the React Native SDK.

> **Note:** Before you begin, make sure you have read the documentation on either the [Android](https://github.com/socure-inc/socure-docv-sdk-android/tree/main/v2) or [iOS](https://github.com/socure-inc/socure-docv-sdk-ios/tree/main/v2) native library variants to understand how the DocV SDK works.

### Configure your Android app

Learn how to integrate the DocV Android SDK v2 into your React Native application using the DocV React Native bridge.

#### Add SDK dependencies

Add the following dependency to `package.json`:

```
"dependencies":{
....,
"rn-socure-sdk": "git+ssh://git@github.com:socure-inc/socure-sdk-react-native.git"
}
```

As an **optional step**, add the GitHub Personal Access [Token](https://github.com/settings/tokens) to your implementation:

```
"dependencies":{
  ....,
      "rn-socure-sdk": "git+https://<Personal_access_token>@github.com/socure-inc/socure-sdk-react-native.git"
}
```

Open the Android `build.gradle` `(<root project dir>/android/build.gradle)` and add the following:

- Set the `minSdkVersion` to `22`:

```
buildscript {
              .....
            ext {
                 ....
                 minSdkVersion = 22
                 .....
            }
      }
```

- Add `jitpack` repositories to `allprojects` section:

```
allprojects {
         repositories {
              mavenCentral()
              .....

              maven { url 'https://www.jitpack.io' }

              .....
         }
      }
```
- Ensure `Kotlin` plugin is added in the `dependencies` section:

```
buildscript {

                .....

               dependencies {

                  .....

                  classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:x.x.x"

               }

           }
```

> **Note:** Socure has tested the build with plugin version 1.3.61.

In the main module `(<root project dir>/android/app/build.gradle)` add the below dependency in `dependencies {}` section:

```
dependencies {
   .....
   implementation "org.jetbrains.kotlin:kotlin-stdlib:x.x.x"
   .....
}
```

In the `(<root project dir>/android/gradle.properties)` file add the following:

```
username=Socure
authToken=Socure
```

#### Update permissions

In the `AndroidManifest.xml` file `(<root project dir>/android/app/src/main/AndroidManifest.xml)`, replace any conflicting `manifest <application>` attribute that is breaking the manifest merger, as shown below:

```
<manifest ......
   xmlns:tools="http://schemas.android.com/tools" >

<application
    .....
    tools:replace="android:allowBackup, ...., attr">
</application>
```

#### Add your SDK key

To add your SDK key, go to [Admin Dashboard](https://developer.socure.com/docs/) and copy your Socure public key, then add the key to your application using one of the following methods:

> **Note:** The key is validated when the SDK is initialized. If you do not set your application public key using one of the methods below, an "Empty Key" error will be returned.

- **Method 1**: Configure the key in the string.xml as a resource:

```
<string name="socurePublicKey" translatable="false">YOUR_KEY_HERE</string>
```

- **Method 2**: Use the function `Socure.setSocureSdkKey(publicKey: String)` to set the public key before initiating the scan process. Note that this method is given preference over the adding the key in `string.xml`.


#### Build and run the app

From the command line, run the following commands: 

- Install the yarn dependencies: 

```
yarn install
```

- Go to your root project folder and run the app:

```
react-native run-android
```

### Configure your iOS app

Learn how to integrate the DocV iOS SDK v2 into your React Native application using the DocV React Native bridge.

#### Install the DocV iOS SDK using CocoaPods

Before you begin, install `cocoapods-user-defined-build-types`. Since the Socure DocV SDK is an XCFramework, CocoaPods does not easily allow dynamic frameworks to intermingle with static libraries. This gem modifies CocoaPods to allow both to exist at the same time. Follow [these instructions](https://github.com/joncardasis/cocoapods-user-defined-build-types) for more details.

To install the DocV iOS SDK using CocoaPods, complete the steps below in your `Podfile` `(<root>/ios/Podfile)`.

-  Above your `(target 'ProjectName' do)`, add the following:

```
plugin 'cocoapods-user-defined-build-types'
enable_user_defined_build_types!
```

- Inside your `(target 'ProjectName' do)`, add the corresponding `pod` lines:

```
# Pods for SocureSdk

pod 'SocureSdk', :build_type => :dynamic_framework, :git =>'git@github.com:socure-inc/socure-ios-sdk.git'
```

- As an **optional step**, add the Personal Access [Token](https://github.com/settings/tokens) for CocoaPods to your implementation:

```
pod 'SocureSdk', :build_type => :dynamic_framework, :git =>'https://<Personal_access_token>@github.com/socure-inc/socure-ios-sdk.git'
```

- Change target version to `12`.

```
platform :ios, '12.0' 
```

- Update your Pods by running the following code in terminal from the iOS folder:

```
pod install
```

#### Add your SDK key

To add your SDK public key, go to [Admin Dashboard](https://developer.socure.com/docs/). Copy your Socure SDK public key, then add it to your application using one of the following methods:

> **Note:** If you do not set your SDK public key using one of the methods below, an "Empty Key" error will be returned.

- **Method 1**: Update the key in the `info.plist` of your application with the following settings:

|   Feature  |            Key           |                              Description                             |
|:----------:|:------------------------:|:--------------------------------------------------------------------:|
| Public key | `socurePublicKey`          | The SDK key for your account, located in the Socure Admin Dashboard. |
| Camera     | `NSCameraUsageDescription` | Allows the use of the camera for documents and selfies.              |

- **Method 2**: Use the SDK public key value in the method below before initiating the scan process:

```
Socure.setSocureSdkKey(publicKey: String)
```

#### Request camera permissions

Add the following permissions to `info.plist(<root>/ios/<projectName>/info.plist>)` on your native iOS app inside `<dict>` tag:

```
<dict>

..........

..........
<key>NSCameraUsageDescription</key>
<string></string>

........

.........

</dict>
```

Alternatively, you can add the following permissions by opening `info.plist` in Xcode:

| Feature  | Key                                              
| -------- | ------------------------------------------------
| Camera   | Privacy - Camera Usage Description                

#### Build and run the app

Using the command line, go to your root project folder and enter the following command to run the app:

```
Run `react-native run-ios`.
```

## Terms and consent notice

The Predictive Document Verification (DocV) SDKs include a notice and consent feature that is displayed prior to the initiation of the document capture and upload process. The consumer is presented with a **Terms & Consent** dialog box, which asks the consumer to either click **I Agree** to provide consent and begin the document capture flow, or **I Decline** to decline consent and cancel the transaction. See [Predictive DocV Terms and Consent](https://developer.socure.com/docs/sdks/docv/docv-consent) for more information.

For the consumer to successfully complete the document capture and upload process, we recommend the following best practices:

- The public key must be set before the first scan screen is loaded.
- The consumer must provide consent to use the SDK. Any image upload attempt without providing consent will not succeed. However, after the consumer provides consent, subsequent document scans in the same session do not require the consumer to provide consent again.
- If the app is killed or restarted for any reason, the consumer will be required to provide consent again. Any images scanned in an earlier session may not have been uploaded because the consent session was lost.
- After the consumer provides consent, we recommend the consumer upload their images as soon as the session begins to avoid a session timeout or expiration.

## Example application

In the `Example` folder there is an implementation of a React Native app that uses the Socure DocV SDK for both ID card documents and passport documents, and uploads the retrieved image to Socure’s services.

To run the example projects, use command line to run `npm install` on both the root folder and the `Example` folder.

> **Note:** If your `main.jsbundle` is missing, simply run `npm run build:ios` on the `Example` folder.

## Promise responses

A Promise is an object that represents the completion or failure of an asynchronous function. The examples below detail how to use promises within the DocV SDK to call a service operation that is fulfilled or rejected. 

### License scan

- Import the Socure package from `rn-socure-sdk`. 
- Call `Socure.scanLicense()`, it returns a “promise” which can then be managed with an `async/await` call or with a `.then` call.  

```javascript
Socure.scanLicense().then((res) => {
      navigation.navigate(‘ScannedInformation’, res);
    });
```

The example below shows how to read the data returned upon a successful execution:

```javascript
licenseResult?.barcodeData?.let{ barcodeContent ->
      val barcode: WritableMap = Arguments.createMap()
      barcode.putString(“address”, barcodeContent.address ?: “”)
      barcode.putString(“city”, barcodeContent.city ?: “”)
      barcode.putString(“country”, barcodeContent.country ?: “”)
      barcode.putString(“documentNumber”, barcodeContent.documentNumber ?: “”)
      barcode.putString(“firstName”, barcodeContent.firstName ?: “”)
      barcode.putString(“surName”, barcodeContent.surName ?: “”)
      barcode.putString(“fullName”, barcodeContent.fullName)
      barcode.putString(“phone”, barcodeContent.phone ?: “”)
      barcode.putString(“postalCode”, barcodeContent.postalCode ?: “”)
      barcode.putString(“state”, barcodeContent.state ?: “”)
      barcode.putString(“dob”, barcodeContent.DOB.toString() ?: “”)
      response.putMap(“barcode”, barcode)
    }
    licenseResult?.idmrzData?.let { mrzContent -> {
      val mrz: WritableMap = Arguments.createMap()
      mrz.putString(“address”, mrzContent.address ?: “”)
      mrz.putString(“city”, mrzContent.city ?: “”)
      mrz.putString(“country”, mrzContent.issuingCountry ?: “”)
      mrz.putString(“documentNumber”, mrzContent.documentNumber ?: “”)
      mrz.putString(“firstName”, mrzContent.firstName ?: “”)
      mrz.putString(“surName”, mrzContent.surName ?: “”)
      mrz.putString(“fullName”, mrzContent.fullName ?: “”)
      mrz.putString(“phone”, mrzContent.phone ?: “”)
      mrz.putString(“postalCode”, mrzContent.postalCode ?: “”)
      mrz.putString(“state”, mrzContent.state ?: “”)
      mrz.putString(“nationality”, mrzContent.nationality ?: “”)
      mrz.putString(“sex”, mrzContent.sex ?: “”)
      response.putMap(“mrz”, mrz)
    } }
    response.putString(“type”, licenseResult?.documentType?.name ?: “UNKNOWN”)
```

### Passport scan

- Import the Socure package from `rn-socure-sdk`
- Call `Socure.scanPassport()`. It returns a “promise” which can then be managed with an `async/await` call or with a `.then` call.  

```javascript
Socure.scanPassport().then((res) => {
      navigation.navigate(‘ScannedInformation’, res);
});
```

The example below shows how to read the data that returns upon successful execution:

```javascript
passportResult?.barcodeData?.let{ barcodeContent ->
      val barcode: WritableMap = Arguments.createMap()
      barcode.putString(“address”, barcodeContent.address ?: “”)
      barcode.putString(“city”, barcodeContent.city ?: “”)
      barcode.putString(“country”, barcodeContent.country ?: “”)
      barcode.putString(“documentNumber”, barcodeContent.documentNumber ?: “”)
      barcode.putString(“firstName”, barcodeContent.firstName ?: “”)
      barcode.putString(“surName”, barcodeContent.surName ?: “”)
      barcode.putString(“fullName”, barcodeContent.fullName ?: “”)
      barcode.putString(“phone”, barcodeContent.phone ?: “”)
      barcode.putString(“postalCode”, barcodeContent.postalCode ?: “”)
      barcode.putString(“state”, barcodeContent.state ?: “”)
      response.putMap(“barcode”, barcode)
    }
    passportResult?.mrzData?.let { mrzContent ->
      val mrz: WritableMap = Arguments.createMap()
      mrz.putString(“address”, mrzContent.address ?: “”)
      mrz.putString(“city”, mrzContent.city ?: “”)
      mrz.putString(“country”, mrzContent.issuingCountry ?: “”)
      mrz.putString(“documentNumber”, mrzContent.documentNumber ?: “”)
      mrz.putString(“firstName”, mrzContent.firstName ?: “”)
      mrz.putString(“surName”, mrzContent.surName ?: “”)
      mrz.putString(“fullName”, mrzContent.fullName ?: “”)
      mrz.putString(“phone”, mrzContent.phone ?: “”)
      mrz.putString(“postalCode”, mrzContent.postalCode ?: “”)
      mrz.putString(“state”, mrzContent.state ?: “”)
      mrz.putString(“nationality”, mrzContent.nationality ?: “”)
      mrz.putString(“sex”, mrzContent.sex ?: “”)
      mrz.putString(“dob”, mrzContent.dob.toString() ?: “”)
      response.putMap(“mrz”, mrz)
    }
    response.putString(“type”, passportResult?.documentType?.name ?: “UNKNOWN”)
```

### Selfie capture

- Import the Socure package from `rn-socure-sdk`
- Call `Socure.captureSelfie()`, it returns a “promise” which can then be managed with an `async/await` call or with a `.then` call.

```javascript
Socure.captureSelfie().then((res) => {
      navigation.navigate(‘UploadData’);
    });
```

The example below shows how to read the data that returns upon successful execution:

```javascript
selfieResponse.putString(“type”, “SELFIE”)
    selfieResponse.putString(“image”, Base64.encodeToString(selfieResult?.imageData, Base64.DEFAULT)  ?: “”)
```

### Submission and Validation

- Import the Socure package from `rn-socure-sdk`
- Call `Socure.uploadScannedInfo()`, it returns a “promise” which can then be managed with an `async/await` call or with a `.then` call.

```javascript
Socure.uploadScannedInfo().then((res) => {
      setUploadReferenceId(res.referenceId);
      setUploadUuid(res.uuid);
    }).catch((error) => {
      setError(error.message);
    });
```

The example below shows how to read the data that returns upon successful execution:

```javascript
 uploadResponse.putString(“type”, “upload_success”)
    result?.let {
      uploadResponse.putString(“referenceId”, it.referenceId)
      uploadResponse.putString(“uuid”, it.uuid)
    }
```

### Show the captured license image

- Import the Socure package from `rn-socure-sdk`
- Call `Socure.getScannedLicense()`, it returns a “promise” which can then be managed with an `async/await` call or with a `.then` call.

```javascript
Socure.getScannedLicense().then((res) => {
    setFrontImage(`data:image/png;base64,${res.frontImage}`);
    setBackImage(`data:image/png;base64,${res.backImage}`);
})
```

The images are returned as a `base64` string, as shown in the example below: 

```javascript
licenseResult?.licenseFrontImage?.let {
        response.putString(“frontImage”, Base64.encodeToString(it, DEFAULT))
      }
      licenseResult?.licenseBackImage?.let {
        response.putString(“backImage”, Base64.encodeToString(it, DEFAULT))
      }
      response.putString(“type”, “normal_license_image”)
```

### Show the captured passport image

- Import the Socure package from `rn-socure-sdk`
- Call `Socure.getScannedPassport()`, it returns a “promise” which can then be managed with an `async/await` call or with a `.then` call.

```javascript
Socure.getScannedPassport().then((res) => {
      setFrontImage(`data:image/png;base64,${res.frontImage}`);
    })
```

The image is returned as a `base64` string, as shown in the example below: 

```javascript
licenseResult?.passportImage?.let { image ->
        response.putString(“frontImage”, Base64.encodeToString(image, Base64.DEFAULT))
      }
      response.putString(“type”, “normal_passport_image”)
```

## Known Issues

- Certain text elements can overlay over other UI elements if the SDK is called modally under a modalPresentationStyle that does not cover the full screen. This is most noticeable with small screen devices like the iPhone SE. As a workaround, you can either adjust the text context or use a modalPresentationStyle that covers the full screen. 
- Calling the SDK modally in a way that allows for interactive dismissal of the view controller can result in the camera automatically turning off when the user cancels out from dismissing the view controller. At this time, we do not support this action and recommend that interactive dismissals of the SDK be disabled by adding the following code snippet to your code:

```
	if #available(iOS 13.0, *) {
            viewController.isModalInPresentation = true
        } else {
            // Fallback on earlier versions
        }
```

- Attempting to capture the back of an ID card that has a magnetic strip and a barcode against a dark background causes issues where the ID cannot be extracted from the environment.

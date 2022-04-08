# Socure DocV SDK React Native Bridge

# Version: 1.1.0 - Release Date : Feb 2022

The Socure SDK React Native bridge allows developers to use React to call the Socure Document
Verification SDK. We provide both Android and iOS native library variants.

This guide covers the integration within React, as well as React Native implementation on iOS and
Android.

## Minimum Requirements

iOS 12 and above

Android SDK version 22

| Feature                           | Android Minimum Requirements |
| --------------------------------- | -------------------- |
| Document and Selfie Auto Capture       | Android 8 and above     |

| Feature                           | iOS Minimum Requirements |
| --------------------------------- | -------------------- |
| Document and Selfie Capture       | iOS 12 and above     |
| Barcode Data Extraction on Device | iOS 12 and above     |
| MRZ Data Extraction on Device     | iOS 13 and above     |

## Installation

### Android

**Step 1:**

Add the following dependency to `package.json`:

```
"dependencies":{
....,
"rn-socure-sdk": "git+ssh://git@github.com:socure-inc/socure-docv-wrapper-react-native.git"
}
```

Optional Github Personal Access Token Implementation (https://github.com/settings/tokens)

```
"dependencies":{
....,
    "rn-socure-sdk": "git+https://<Personal_access_token>@github.com/socure-inc/socure-docv-wrapper-react-native.git"
}
```

**Step 2:**

Open the Android `build.gradle` `(<root project dir>/android/build.gradle)` and add the following:

* Set the `minSdkVersion` to 22:

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

* Add `jcenter()` and `jitpack` repositories to `allprojects` section:

```
allprojects {
         repositories {
              mavenCentral()
              .....

              jcenter()
              maven { url 'https://www.jitpack.io' }

              .....
         }
      }
```

* Ensure `Kotlin` plugin is added in the `dependencies` section:

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


**Step 3:**

In the main module `(<root project dir>/android/app/build.gradle)` add the below dependency
in `dependencies {}` section:

```
dependencies {
   .....
   implementation "org.jetbrains.kotlin:kotlin-stdlib:x.x.x"
   .....
}
```

> **Note:** Socure has tested the build with plugin version 1.3.61.

**Step 4:**

In the `(<root project dir>/android/gradle.properties)` file add the following:

```
username=Socure
authToken=Socure
```

**Step 5:**

In the `AndroidManifest.xml` file `(<root project dir>/android/app/src/main/AndroidManifest.xml)`,
replace any conflicting `manifest <application>` attribute that is breaking the manifest merger, as
shown below:

```
<manifest ......
   xmlns:tools="http://schemas.android.com/tools" >

<application
    .....
    tools:replace="android:allowBackup, ...., attr">
</application>
```

**Step 6:**

Add the Socure public key provided to you in the main module's `() strings.xml`:

```
<resources>

   <string name="socurePublicKey" translatable="false">REPLACE ME</string>

</resources>
```

**Step 7:**

Build and run:

* Run `yarn install`.
* Run `react-native run-android` from the root folder.

### iOS

**Before you begin:**

Install `cocoapods-user-defined-build-types`.

Since the Socure Document Verification SDK is an XCFramework, CocoaPods doesn’t easily allow dynamic
frameworks to intermingle with static libraries. This gem modifies CocoaPods to allow both to exist
at the same time. Follow the instructions
at https://github.com/joncardasis/cocoapods-user-defined-build-types.

**Step 1:**

Install Socure SDK React Native Bridge using CocoaPods (recommended).

The SDK can be added to the project by adding the following items to
your `Podfile` `(<root>/ios/Podfile)`.

* Above your `(target 'ProjectName' do)`, add the following:

```
plugin 'cocoapods-user-defined-build-types'
enable_user_defined_build_types!
```

* Inside your `(target 'ProjectName' do)`, add the corresponding `pod` lines:

```
# Pods for SocureSdk

pod 'SocureSdk', :build_type => :dynamic_framework, :git =>'git@github.com:socure-inc/socure-docv-sdk-ios.git'
```

Optional Personal Access Token Implementation for CocoaPods (https://github.com/settings/tokens)

```
pod 'SocureSdk', :build_type => :dynamic_framework, :git =>'https://<Personal_access_token>@github.com/socure-inc/socure-docv-sdk-ios.git'
```

* Change target version to "12".

`platform :ios, '12.0'` <= Please set it to 12

* Update your pods by running the following code in terminal from the iOS folder:

`pod install`

**Step 2:**

Add API Keys.

On your native iOS app, you will need to extract your SDK key from the Socure admin dashboard and
use the same in the `(<root>/ios/<projectName>/info.plist)info.plist` file of your application.

```
<key>socurePublicKey</key>
<string>REPLACE ME</string>
```

**Step 3:**

Add Permissions for Camera and Photo Use**

Add the following permissions to `info.plist(<root>/ios/<projectName>/info.plist>)` on your native
iOS app inside `<dict>` tag:

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

**Step 4:**

* Run `react-native run-ios`.

## Example

In the `Example` folder there is an implementation of a React Native app that uses the Socure
Document Verification SDK for both ID card documents and passport documents, and uploads the
retrieved image to Socure’s services.

Don't forget to execute `npm install` on both the root folder and the `Example` folder before
running the example projects.

### Caution

If your  `main.jsbundle`  is missing, simply run `npm run build:ios` on the `Example` folder

## Usage

### Scanning a License

Import the Socure package from `rn-socure-sdk`; Call `Socure.scanLicense()`, it returns a “promise”
which can then be managed with an `async/await` call or with a `.then` call.

Example:

```
Socure.scanLicense().then((res) => {
      navigation.navigate(‘ScannedInformation’, res);
    });
```

This is how you read the data returned upon a successful execution:

```
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

### Scanning a Passport

Import the Socure package from `rn-socure-sdk`;

Call `Socure.scanPassport()`. It returns a “promise” which can then be managed with an `async/await`
call or with a `.then` call.

```
Socure.scanPassport().then((res) => {
      navigation.navigate(‘ScannedInformation’, res);
});
```

Here is how to read the data that returns upon successful execution:

```
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

### Taking a Selfie

Import the Socure package from `rn-socure-sdk`;

Call `Socure.captureSelfie()`, it returns a “promise” which can then be managed with
an `async/await` call or with a `.then` call.

```
Socure.captureSelfie().then((res) => {
      navigation.navigate(‘UploadData’);
    });
```

Here is how to read the data that returns upon successful execution:

```
selfieResponse.putString(“type”, “SELFIE”)
    selfieResponse.putString(“image”, Base64.encodeToString(selfieResult?.imageData, Base64.DEFAULT)  ?: “”)
```

### Submission and Validation

Import the Socure package from `rn-socure-sdk`;

Call `Socure.uploadScannedInfo()`, it returns a “promise” which can then be managed with
an `async/await` call or with a `.then` call.

```
Socure.uploadScannedInfo().then((res) => {
      setUploadReferenceId(res.referenceId);
      setUploadUuid(res.uuid);
    }).catch((error) => {
      setError(error.message);
    });
```

Here is how to read the data that returns upon successful execution:

```
 uploadResponse.putString(“type”, “upload_success”)
    result?.let {
      uploadResponse.putString(“referenceId”, it.referenceId)
      uploadResponse.putString(“uuid”, it.uuid)
    }
```

### Showing the captured license image

Import the Socure package from `rn-socure-sdk`;

Call `Socure.getScannedLicense()`, it returns a “promise” which can then be managed with
an `async/await` call or with a `.then` call.

```
Socure.getScannedLicense().then((res) => {
    setFrontImage(`data:image/png;base64,${res.frontImage}`);
    setBackImage(`data:image/png;base64,${res.backImage}`);
})
```

The images are returned as a `base64` string

```
licenseResult?.licenseFrontImage?.let {
        response.putString(“frontImage”, Base64.encodeToString(it, DEFAULT))
      }
      licenseResult?.licenseBackImage?.let {
        response.putString(“backImage”, Base64.encodeToString(it, DEFAULT))
      }
      response.putString(“type”, “normal_license_image”)
```

### Showing the captured Passport image

Import the Socure package from `rn-socure-sdk`;

Call `Socure.getScannedPassport()`, it returns a “promise” which can then be managed with
an `async/await` call or with a `.then` call.

```
Socure.getScannedPassport().then((res) => {
      setFrontImage(`data:image/png;base64,${res.frontImage}`);
    })
```

The image is returned as a `base64` string

```
licenseResult?.passportImage?.let { image ->
        response.putString(“frontImage”, Base64.encodeToString(image, Base64.DEFAULT))
      }
      response.putString(“type”, “normal_passport_image”)
```

## Known Issues

- Certain text elements can overlay over other UI elements if the SDK is called modally under a
  modalPresentationStyle that doesn't cover the full screen. This is most noticeable with small
  screen devices like the iPhone SE. As a workaround, you can either adjust the text context or use
  a modalPresentationStyle that covers the full screen.  [iOS]

- Calling the SDK modally in a way that allows for interactive dismissal of the view controller can
  result in the camera automatically turning off when the user cancels out from dismissing the view
  controller. At this time, we do not support this action and recommend that interactive dismissals
  of the SDK be disabled by adding the following code snippet to your code: [iOS]

```
	if #available(iOS 13.0, *) {
            viewController.isModalInPresentation = true
        } else {
            // Fallback on earlier versions
        }
```

- Attempting to capture the back of an ID card that has a magnetic strip and a barcode against a
  dark background causes issues where the ID cannot be extracted from the environment.

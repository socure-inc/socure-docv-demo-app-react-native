# Predictive DocV SDK React Native v5

The Predictive Document Verification (DocV) SDK for React Native is a React Native wrapper that allows you to use the DocV SDK for Android and iOS in your React Native application. 

>Note: Document verification services will be disabled for older SDK versions soon. All SDK integrations must be updated to version **3.1.0 or later** to meet compliance requirements.

This repository also contains `SampleApp/`, a runnable React Native demo app that integrates the wrapper. See [Running Tests and Verifying the Sample App](#running-tests-and-verifying-the-sample-app) for how it is verified.

## External Dependencies

The SDK and the sample app depend on the following external services at runtime. None are optional — document verification cannot complete without them.

| Dependency | Type | Used for |
|---|---|---|
| **Socure Predictive DocV API** — `POST https://service.socure.com/api/5.0/documents/request` | Third-party API (Socure) | Issues the `docVTransactionToken` that the SDK requires to start a session. Called from **your backend**, not from the app. See [Generate a transaction token](#generate-a-transaction-token-and-configure-the-capture-app). |
| **Socure Capture App** — `https://verify.socure.com` | Socure hosted service | The document capture and upload flow the SDK drives. Its per-transaction URL is returned in the `/documents/request` response. Flow customization is configured in Admin Dashboard via `useCaseKey`. |
| **Socure ID+ API** — [API reference](https://developer.socure.com/reference#tag/ID+/operation/ID+) | Third-party API (Socure) | Retrieves the verification results after a consumer completes capture. Called from **your backend** using the returned session token. |
| **Socure Digital Intelligence (Device Risk) service** | Third-party API (Socure) | Device and behavioral telemetry collected by the bundled Digital Intelligence SDK. Produces the `deviceSessionToken` returned on success. Required for all DocV v5 integrations. |
| **Socure Admin Dashboard** — `https://developer.socure.com` | Socure console | Source of the ID+ API key and the SDK key (`publicKey`), IP allowlisting, and Capture App flow configuration. |
| **Device camera and network access** | Device capability | Capturing identity documents and uploading them. The SDK requests camera permission on first launch. |

The following are required to **build** the project, but are not runtime dependencies of the shipped app:

| Dependency | Used for |
|---|---|
| npm registry — `@socure-inc/docv-react-native` | The React Native wrapper package. |
| CocoaPods CDN — `SocureDocV`, `SocureDeviceRisk` | iOS native SDKs, resolved from the wrapper's podspec. |
| Socure Maven repository — `https://sdk.socure.com` | Android native SDK (`com.socure.android:docv-capture`). |
| Maven Central / Google Maven | Android transitive dependencies. |

> **Note:** There is no database, queue, or object store in this project. The sample app holds no persistent state; all verification state lives in the Socure services above.

## Minimum Requirements

Before getting started, check that your development environment meets the following requirements:

**React Native**

- React Native CLI. See the [React Native docs](https://reactnative.dev/docs/environment-setup) for instructions on how to set up your development environment. 

**iOS**

- Xcode version 16.1+
- Support for iOS 15 and later

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

- Make sure the deployment target is iOS 15 or later. On React Native 0.79 the standard `platform :ios, min_ios_version_supported` already resolves to 15.1, so no change is needed; otherwise set `platform :ios, '15.0'` explicitly.
- Add the line `pod 'socure-docv-react-native', :path => '../node_modules/@socure-inc/docv-react-native'` inside your app target.

Once completed, your Podfile should look like the following example. This is the Podfile used by `SampleApp/` in this repository, so it is known to build:

```ruby {8,69}
# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native/scripts/react_native_pods.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

platform :ios, min_ios_version_supported
prepare_react_native_project!

linkage = ENV['USE_FRAMEWORKS']
if linkage != nil
  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
  use_frameworks! :linkage => linkage.to_sym
end

target 'DocVReactNativeSample' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    # https://github.com/facebook/react-native/blob/main/packages/react-native/scripts/react_native_pods.rb#L197-L202
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      # :ccache_enabled => true
    )

    # fmt fails under Xcode 26+ Clang (consteval FMT_STRING). base.h redefines
    # FMT_USE_CONSTEVAL unconditionally, so patch it to honor an external value,
    # then force it off below. Toolchain workaround; idempotent. Unrelated to
    # socure-docv-react-native.
    fmt_base = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base)
      src = File.read(fmt_base)
      # Turn the chain's opening `#if` into an `#elif` behind our own branch.
      original_open = "#if !defined(__cpp_lib_is_constant_evaluated)\n#  define FMT_USE_CONSTEVAL 0\n"
      patched_open  = "#if defined(FMT_USE_CONSTEVAL)\n// honor externally-provided value\n" \
                      "#elif !defined(__cpp_lib_is_constant_evaluated)\n#  define FMT_USE_CONSTEVAL 0\n"
      if src.include?(original_open)
        src = src.sub(original_open, patched_open)
        File.chmod(0644, fmt_base)  # pod headers are read-only
        File.write(fmt_base, src)
        Pod::UI.puts "[fmt] Patched base.h to honor pre-set FMT_USE_CONSTEVAL".green
      end
    end

    installer.pods_project.targets.each do |t|
      if ['fmt', 'glog'].include?(t.name)
        t.build_configurations.each do |c|
          defs = c.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']
          defs = [defs] unless defs.is_a?(Array)
          defs.delete('FMT_USE_NONTYPE_TEMPLATE_ARGS=0')
          defs.delete('FMT_CONSTEVAL=')
          defs << 'FMT_USE_CONSTEVAL=0' unless defs.include?('FMT_USE_CONSTEVAL=0')
          c.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs
        end
      end
    end
  end

  pod 'socure-docv-react-native', :path => '../node_modules/@socure-inc/docv-react-native'
end
```

Replace `DocVReactNativeSample` with your own target name.

> **Why the `fmt` block?** React Native 0.79's bundled `fmt` dependency does not compile under Xcode 26 or later — the build fails with a `consteval` error in `fmt/format-inl.h`. This is a React Native toolchain issue, not a DocV one, and `fmt` is built before the wrapper, so the failure looks unrelated to where it comes from. Keep the workaround until you move to a React Native release that ships a newer `fmt`. On Xcode 16–25 it is a harmless no-op.

#### Install the dependencies

Change the location of your working directory to the `ios` folder: 

```
cd ios
```

Install the Cocoapods dependencies by running the following command: 

```
pod install
```

> **Note:** Use `pod install` directly. If your project was generated from the React Native template it may contain a `Gemfile` pinning an old Ruby version (for example `ruby '2.7.4'`), in which case `bundle exec pod install` aborts with `Bundler::RubyVersionMismatch` on a modern Ruby. This is the case for `SampleApp/` in this repository.

#### Use the CocoaPods-generated `.xcworkspace` file

The CocoaPods installation command generates a `.xcworkspace` file with all the dependencies configured. To continue with the installation, complete the following: 

- Close Xcode and then open your project's `.xcworkspace` file to launch Xcode. From now on, use the `.xcworkspace` to open your project. 
- Check that your deployment target is set to iOS 15 or later. 

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

For the Android app, add your project dependencies by going to the module level `build.gradle` file and making sure the `minSdkVersion` is set to at least 23 and the `compileSdkVersion` is set to at least 36. 

```kotlin {5,6,7}
buildscript {
              .....
            ext {
                 ....
                minSdkVersion = 23 
                compileSdkVersion = 36
                targetSdkVersion = 36
                .....
            }
}
```

> **Note:** `minSdkVersion` 23 is a hard floor, not a recommendation. The DocV Android SDK (`docv-capture`) declares `minSdkVersion 23` in its manifest, and the Digital Intelligence SDK raised its minimum from API 21 to 23 in version 4.12.0. A lower value fails the Android manifest merger.

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
| `ERR_GUARDIAN_CONSENT_DECLINED` | `"Consent declined by the guardian"` | The guardian declined consent on behalf of a minor. |
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

## Running Tests and Verifying the Sample App

### Automated tests

**The sample app in `SampleApp/` has no automated test suite.** It is a manual integration demo, and it is verified by running it against the real Socure services as described below.

`SampleApp/package.json` carries `test` and `lint` scripts inherited from the React Native project template, but neither is functional as shipped:

| Command | Current result |
|---|---|
| `yarn test` | Exits **1** — Jest reports `No tests found` (no `__tests__` directory or `*.test.*` files exist). |
| `yarn lint` | Exits **2** — ESLint finds no configuration file in the project or its ancestors. |

Treat these as unimplemented rather than failing. Do not gate CI on them until test files and an ESLint config are added.

Automated tests for the JavaScript API surface live in the **wrapper package repository**, not here. In a checkout of `@socure-inc/docv-react-native`:

```bash
yarn test        # Jest — 14 tests covering launchSocureDocV / launchSocureDocVWithPromise
yarn typescript  # tsc type check
yarn lint        # ESLint
```

Those cover argument forwarding to the TurboModule, promise resolution and rejection, and the "package not linked" error path.

### Verifying the sample app manually

This is the actual verification procedure for this repository. Each step has a check that must pass before continuing.

**1. Install dependencies**

```bash
cd SampleApp
yarn install
cd ios && pod install && cd ..
```

Confirm the wrapper resolved from the npm registry rather than a local checkout — a symlink here means you are not testing the published package:

```bash
ls -ld node_modules/@socure-inc/docv-react-native   # must be a directory, not a symlink
grep '"version"' node_modules/@socure-inc/docv-react-native/package.json
```

**2. Build**

```bash
yarn ios        # or: npx react-native run-ios
```

Expect `BUILD SUCCEEDED`. For Android, use `yarn android`.

**3. Confirm the JavaScript bundle resolves**

With Metro running (`yarn start`), in a second shell:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false"
```

Expect `200`. A `500` with *"Unable to resolve module @socure-inc/docv-react-native"* means the dependency is not installed correctly.

**4. Launch and drive the app**

The app renders two buttons, **Launch Socure DocV (Callback)** and **Launch Socure DocV (Promise)**, which exercise the two public APIs. Tap each one.

**5. Interpret the result**

`App.js` ships placeholder credentials, so with an unmodified checkout the expected outcome is an **error**, not a success — and which error tells you whether the native bridge works:

| Result | Meaning |
|---|---|
| `ERR_INVALID_TOKEN` — *"Invalid transaction token"* | ✅ **Pass.** The call reached the native SDK, which rejected the placeholder token. This confirms the module is linked, the native bridge works, and the SDK initialized. |
| `ERR_INVALID_KEY` | ✅ Pass for bridge purposes — replace `yourSocureSdkKey` with a real SDK key. |
| `ERR_NO_VIEW_CONTROLLER` / `ERR_NO_ACTIVITY` | ❌ The bridge ran but could not resolve a host view controller or activity. |
| Red error screen, or *"doesn't seem to be linked"* | ❌ The native module was not registered. Re-run `pod install` and rebuild; this is a linking problem, not an SDK problem. |

**6. End-to-end verification with real credentials**

To verify the complete flow rather than just the bridge, generate a real transaction token per [Generate a transaction token and configure the Capture App](#generate-a-transaction-token-and-configure-the-capture-app), then replace both placeholders in `SampleApp/App.js`:

```javascript
const docVTransactionToken = 'your transaction token';
const yourSocureSdkKey = 'your socure sdk key';
```

A successful run completes the capture flow and returns a `deviceSessionToken`. To fetch the verification results, call the ID+ endpoint — see the [API Reference documentation](https://developer.socure.com/reference#tag/ID+/operation/ID+) on DevHub.

> **Note:** Your IP address must be allowlisted in Admin Dashboard before `/documents/request` will succeed.



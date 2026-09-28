# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

########################################
# Google Play Integrity
########################################

-keep class com.google.android.play.core.integrity.** { *; }
-keep class com.google.android.play.integrity.** { *; }
-dontwarn com.google.android.play.core.integrity.**
-dontwarn com.google.android.play.integrity.**

# Keep Parcelable classes and Creator fields
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep Serializable classes
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep PackageInfo and SigningInfo classes
-keep class android.content.pm.PackageInfo { *; }
-keep class android.content.pm.SigningInfo { *; }
-keep class android.content.pm.SigningDetails { *; }

########################################
# Kotlin / Coroutines
########################################

-keep class kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**

########################################
# React Native / Hermes safety
########################################

# Keep all React Native core classes
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# Keep SoLoader classes (critical for native library loading)
-keep class com.facebook.soloader.** { *; }
-dontwarn com.facebook.soloader.**
-keep class com.facebook.soloader.SoLoader { *; }
-keep class com.facebook.soloader.SoSource { *; }
-keep class com.facebook.soloader.ApplicationSoSource { *; }
-keep class com.facebook.soloader.DirectApkSoSource { *; }
-keep class com.facebook.soloader.DirectorySoSource { *; }

# Keep React Native native library loading classes
-keep class com.facebook.react.internal.featureflags.** { *; }
-keep class com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsCxxInterop { *; }
-keep class com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsCxxAccessor { *; }
-keep class com.facebook.react.internal.featureflags.ReactNativeFeatureFlags { *; }
-keep class com.facebook.react.defaults.DefaultNewArchitectureEntryPoint { *; }
-keep class com.facebook.react.ReactNativeApplicationEntryPoint { *; }

# Keep React Native PackageList and autolinking classes
-keep class com.facebook.react.PackageList { *; }
-keep class com.facebook.react.ReactPackage { *; }
-keep class com.facebook.react.ReactHost { *; }
-keep class com.facebook.react.ReactNativeHost { *; }
-keep class com.facebook.react.ReactApplication { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.modules.** { *; }

# Keep React Native Application Entry Point
-keep class com.facebook.react.ReactNativeApplicationEntryPoint { *; }
-keep class com.facebook.react.defaults.** { *; }

# Keep all native modules from React Native packages
-keep class * implements com.facebook.react.ReactPackage { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }

########################################
# React Native Native Modules - Keep All
########################################

# Notifee
-keep class com.notifee.** { *; }
-dontwarn com.notifee.**

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-dontwarn com.reactnativecommunity.asyncstorage.**

# Clipboard
-keep class com.reactnativecommunity.clipboard.** { *; }
-dontwarn com.reactnativecommunity.clipboard.**


# Battery Optimization Check
-keep class com.batteryoptimizationcheck.** { *; }
-dontwarn com.batteryoptimizationcheck.**

# Bootsplash
-keep class com.zoontek.rnbootsplash.** { *; }
-dontwarn com.zoontek.rnbootsplash.**

# Document Picker
-keep class com.reactnativedocumentpicker.** { *; }
-dontwarn com.reactnativedocumentpicker.**

# React Native FS
-keep class com.rnfs.** { *; }
-dontwarn com.rnfs.**


# In-App Purchase
-keep class com.dooboolab.iap.** { *; }
-dontwarn com.dooboolab.iap.**

# Keychain
-keep class com.oblador.keychain.** { *; }
-dontwarn com.oblador.keychain.**

# Libsodium
-keep class com.reactnativelibsodium.** { *; }
-dontwarn com.reactnativelibsodium.**

# Localize
-keep class com.reactcommunity.rnlocalize.** { *; }
-dontwarn com.reactcommunity.rnlocalize.**

# NFC Manager
-keep class com.vicentcar.** { *; }
-dontwarn com.vicentcar.**

# Nitro Modules
-keep class com.nitromodules.** { *; }
-dontwarn com.nitromodules.**

# Nitro Audio Recorder Player (Margelo)
-keep class com.margelo.nitro.audiorecorderplayer.** { *; }
-keep @com.facebook.proguard.annotations.DoNotStrip class * { *; }
-keep @com.facebook.proguard.annotations.KeepGettersAndSetters class * { *; }
-keepclassmembers class com.margelo.nitro.audiorecorderplayer.HybridAudioRecorderPlayer {
    *;
}
-keepnames class com.margelo.nitro.audiorecorderplayer.** { *; }
-dontwarn com.margelo.nitro.audiorecorderplayer.**

# QR Code SVG
-keep class com.reactnativeqrcodesvg.** { *; }
-dontwarn com.reactnativeqrcodesvg.**

# Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }
-dontwarn com.th3rdwave.safeareacontext.**

# Share
-keep class cl.json.** { *; }
-dontwarn cl.json.**

# SVG
-keep class com.horcrux.svg.** { *; }
-dontwarn com.horcrux.svg.**

# TCP Socket
-keep class com.asterinet.react.tcpsocket.** { *; }
-dontwarn com.asterinet.react.tcpsocket.**

# Vector Icons
-keep class com.oblador.vectoricons.** { *; }
-dontwarn com.oblador.vectoricons.**

# Video
-keep class com.brentvatne.react.** { *; }
-keep class com.yqritc.scalablevideoview.** { *; }
-dontwarn com.brentvatne.react.**
-dontwarn com.yqritc.scalablevideoview.**

# Vision Camera
-keep class com.mrousavy.camera.** { *; }
-dontwarn com.mrousavy.camera.**

# Custom IRC Foreground Service Package
-keep class com.androidircx.** { *; }
-keep class com.androidircx.IRCForegroundServicePackage { *; }
-keep class com.androidircx.IRCForegroundServiceModule { *; }
-keep class com.androidircx.IRCForegroundService { *; }
-keep class com.androidircx.MainApplication { *; }
-keep class com.androidircx.MainActivity { *; }
-dontwarn com.androidircx.**

########################################
# General Android rules
########################################

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep R class and its inner classes
-keepclassmembers class **.R$* {
    public static <fields>;
}

########################################
# Critical: Prevent NoClassDefFoundError
########################################

# Keep all classes that might be loaded dynamically
-keepattributes Exceptions, InnerClasses, Signature, *Annotation*, EnclosingMethod

# Keep all classes used by VMStack.getThreadStackTrace() and Thread.getStackTrace()
-keep class dalvik.system.** { *; }
-keep class java.lang.** { *; }
-keep class java.util.concurrent.** { *; }
-keep class java.util.concurrent.locks.** { *; }
-keep class java.lang.reflect.** { *; }



# Keep all classes with native methods
-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}

# Keep all classes referenced in AndroidManifest
-keep class * extends android.app.Activity
-keep class * extends android.app.Service
-keep class * extends android.content.BroadcastReceiver
-keep class * extends android.content.ContentProvider

# Keep Application class and its methods
-keep class * extends android.app.Application {
    <init>();
    void onCreate();
}

# Keep all classes that might be loaded via Class.forName() or reflection
-keep class com.facebook.react.PackageList { *; }
-keep class com.facebook.react.defaults.DefaultReactHost { *; }
-keep class com.facebook.react.ReactHost { *; }
-keep class com.facebook.react.ReactNativeHost { *; }

# Prevent obfuscation of classes that might be instantiated via reflection
-keepclassmembers class * {
    <init>();
}

# Keep all enum classes (often loaded dynamically)
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep classes used in serialization/deserialization
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    !static !transient <fields>;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

########################################
# Critical: Prevent NoClassDefFoundError at Runtime
########################################

# Keep all classes that might be loaded via Class.forName() or reflection
# This is critical for preventing NoClassDefFoundError without stack trace
-keep class com.facebook.react.PackageList { *; }
-keep class com.facebook.react.defaults.DefaultReactHost { *; }
-keep class com.facebook.react.ReactHost { *; }
-keep class com.facebook.react.ReactNativeHost { *; }
-keep class com.facebook.react.ReactApplication { *; }
-keep class com.facebook.react.ReactPackage { *; }

# Keep all classes that extend or implement critical interfaces
-keep class * implements com.facebook.react.ReactPackage { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }

# Keep all classes used by React Native initialization
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.devsupport.** { *; }

# Keep all classes that might be instantiated via reflection in MainApplication
-keep class com.androidircx.PlayIntegrityPackage { *; }
-keep class com.androidircx.HttpPostPackage { *; }
-keep class com.androidircx.IRCForegroundServicePackage { *; }
-keep class com.androidircx.IRCForegroundServiceModule { *; }

# Keep all classes used by Class.forName() calls
-keep class com.facebook.react.defaults.** { *; }
-keep class com.facebook.react.ReactNativeApplicationEntryPoint { *; }

# Keep all classes that might be loaded dynamically during app startup
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.jni.DestructorThread { *; }
-keep class com.facebook.jni.HybridData { *; }
-dontwarn com.facebook.jni.**

# ---------------------------------------------------------------------------
# MCP (Ktor + kotlinx-serialization + the MCP Kotlin SDK)
# ---------------------------------------------------------------------------

# Ktor asks java.lang.management whether an IntelliJ debugger is attached.
# Android has no java.lang.management, and the code path never runs here, but
# R8 fails the build on the dangling reference rather than warning.
-dontwarn java.lang.management.**
-dontwarn io.ktor.util.debug.**

# Other JVM-only corners Ktor and its dependencies reference but never reach
# on Android.
-dontwarn io.ktor.**
-dontwarn org.slf4j.**
-dontwarn reactor.blockhound.**

# kotlinx-serialization generates a companion $$serializer for every
# @Serializable type and looks it up by name at runtime. Shrinking those away
# builds fine and then fails at the first MCP message with a
# SerializationException, so keep them.
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class io.modelcontextprotocol.kotlin.sdk.**$$serializer { *; }
-keepclassmembers class io.modelcontextprotocol.kotlin.sdk.** {
    *** Companion;
    *** INSTANCE;
    kotlinx.serialization.KSerializer serializer(...);
}
-keepclasseswithmembers class io.modelcontextprotocol.kotlin.sdk.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# The two MCP native modules are reached through MainApplication like the
# other custom packages listed above.
-keep class com.androidircx.McpServerPackage { *; }
-keep class com.androidircx.McpServerModule { *; }
-keep class com.androidircx.McpClientPackage { *; }
-keep class com.androidircx.McpClientModule { *; }

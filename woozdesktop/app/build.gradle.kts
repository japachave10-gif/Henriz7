plugins {
    id("com.android.application")
}

android {
    namespace = "com.woozdesktop.client"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.woozdesktop.client"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

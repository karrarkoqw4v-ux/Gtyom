package com.alfarabi.school

import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.biometrics.BiometricManager
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.os.CancellationSignal

/**
 * قفل التطبيق بالبصمة. أندرويد ما يعطي أي تطبيق بيانات البصمة نفسها (تبقى داخل شريحة الأمان بالجهاز)،
 * فنستخدم نظام التحقق الرسمي: لما تنجح البصمة يفتح التطبيق، وإلا يبقى مقفول.
 */
object Bio {
    fun available(c: Context): Boolean {
        if (Build.VERSION.SDK_INT < 28) return false
        if (Build.VERSION.SDK_INT >= 30) {
            val bm = c.getSystemService(BiometricManager::class.java) ?: return false
            return bm.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL) == BiometricManager.BIOMETRIC_SUCCESS
        }
        return c.packageManager.hasSystemFeature(PackageManager.FEATURE_FINGERPRINT)
    }

    fun prompt(act: Activity, onOk: () -> Unit, onFail: (String) -> Unit) {
        try {
            val b = BiometricPrompt.Builder(act).setTitle("ثانوية الفارابي").setSubtitle("افتح التطبيق بالبصمة")
            if (Build.VERSION.SDK_INT >= 30) {
                b.setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL)
            } else {
                b.setNegativeButton("إلغاء", act.mainExecutor) { _, _ -> onFail("cancel") }
            }
            b.build().authenticate(CancellationSignal(), act.mainExecutor, object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult?) { onOk() }
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence?) { onFail(errString?.toString() ?: "error") }
            })
        } catch (e: Throwable) { onFail(e.message ?: "error") }
    }
}

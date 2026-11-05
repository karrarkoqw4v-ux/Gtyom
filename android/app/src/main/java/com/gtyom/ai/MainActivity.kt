package com.gtyom.ai

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

class MainActivity : Activity() {
    private lateinit var web: WebView
    private var llm: LlmInference? = null
    @Volatile private var busy = false
    private val model get() = File(filesDir, "model.task")

    private fun emit(o: JSONObject) {
        val js = "window.__native && window.__native($o)"
        runOnUiThread { web.evaluateJavascript(js, null) }
    }
    private fun err(m: String?) = emit(JSONObject().put("type", "err").put("m", m ?: "خطأ غير معروف"))

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.webViewClient = WebViewClient()
        web.addJavascriptInterface(Bridge(), "Android")
        setContentView(web)
        web.loadUrl("file:///android_asset/index.html")
    }

    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }

    inner class Bridge {
        @JavascriptInterface
        fun hasModel(): Boolean = model.exists() && model.length() > 1_000_000

        @JavascriptInterface
        fun downloadModel(url: String) {
            Thread {
                try {
                    val c = URL(url).openConnection() as HttpURLConnection
                    c.connectTimeout = 20000
                    c.readTimeout = 30000
                    c.instanceFollowRedirects = true
                    if (c.responseCode != 200) throw Exception("فشل التنزيل (${c.responseCode}). تأكد من الرابط.")
                    val total = c.contentLengthLong
                    val tmp = File(filesDir, "model.part")
                    var done = 0L
                    var last = -1
                    c.inputStream.use { i ->
                        tmp.outputStream().use { o ->
                            val buf = ByteArray(1 shl 16)
                            while (true) {
                                val n = i.read(buf)
                                if (n < 0) break
                                o.write(buf, 0, n)
                                done += n
                                if (total > 0) {
                                    val p = (done * 100 / total).toInt()
                                    if (p != last) { last = p; emit(JSONObject().put("type", "dl").put("pct", p)) }
                                }
                            }
                        }
                    }
                    llm = null
                    model.delete()
                    tmp.renameTo(model)
                    emit(JSONObject().put("type", "dlok"))
                } catch (e: Throwable) { err(e.message) }
            }.start()
        }

        @JavascriptInterface
        fun pickModel() {
            val i = Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*")
            runOnUiThread { startActivityForResult(i, 7) }
        }

        @JavascriptInterface
        fun generate(json: String) {
            if (busy) { err("النموذج مشغول، انتظر انتهاء الرد الحالي"); return }
            busy = true
            Thread {
                try {
                    if (llm == null) {
                        val opts = LlmInference.LlmInferenceOptions.builder()
                            .setModelPath(model.absolutePath)
                            .setMaxTokens(2048)
                            .setTopK(40)
                            .setTemperature(0.7f)
                            .setRandomSeed(1)
                            .setResultListener { part, done ->
                                emit(JSONObject().put("type", "tok").put("t", part ?: ""))
                                if (done) { busy = false; emit(JSONObject().put("type", "done")) }
                            }
                            .build()
                        llm = LlmInference.createFromOptions(this@MainActivity, opts)
                    }
                    llm!!.generateResponseAsync(chatML(json))
                } catch (e: Throwable) { busy = false; err(e.message) }
            }.start()
        }
    }

    // صيغة ChatML اللي يفهمها Qwen
    private fun chatML(json: String): String {
        val a = JSONArray(json)
        val sb = StringBuilder()
        for (k in 0 until a.length()) {
            val m = a.getJSONObject(k)
            sb.append("<|im_start|>").append(m.getString("role")).append('\n')
              .append(m.getString("content")).append("<|im_end|>\n")
        }
        return sb.append("<|im_start|>assistant\n").toString()
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        val uri = data?.data
        if (requestCode != 7 || resultCode != RESULT_OK || uri == null) return
        Thread {
            try {
                contentResolver.openInputStream(uri)!!.use { i -> model.outputStream().use { o -> i.copyTo(o) } }
                llm = null
                emit(JSONObject().put("type", "dlok"))
            } catch (e: Throwable) { err(e.message) }
        }.start()
    }
}

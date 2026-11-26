package com.alfarabi.school

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import android.media.MediaPlayer
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.io.File

/** محادثات أصلية (Kotlin + Compose): تقرأ وترسل مباشرة لقاعدة المدرسة بنفس بنية الويب */
class NativeChatActivity : ComponentActivity() {
    private var player: MediaPlayer? = null
    private var onPicked: (List<Uri>) -> Unit = {}
    private val picker = registerForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris -> if (uris.isNotEmpty()) onPicked(uris) }

    /** صورة من المعرض → JPEG بحجم أقصى 900px بصيغة data URL (نفس ما يرسله الويب) */
    private fun toDataUrl(u: Uri): String? = try {
        val cr = contentResolver
        val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        cr.openInputStream(u)?.use { BitmapFactory.decodeStream(it, null, o) }
        var ss = 1
        while (maxOf(o.outWidth, o.outHeight) / (ss * 2) >= 900) ss *= 2
        var bm = cr.openInputStream(u)?.use { BitmapFactory.decodeStream(it, null, BitmapFactory.Options().apply { inSampleSize = ss }) }
        if (bm == null) null else {
            val rot = try { cr.openInputStream(u)?.use { ExifInterface(it).getAttributeInt(ExifInterface.TAG_ORIENTATION, 1) } ?: 1 } catch (_: Throwable) { 1 }
            val deg = when (rot) { 6 -> 90f; 3 -> 180f; 8 -> 270f; else -> 0f }
            val sc = minOf(1f, 900f / maxOf(bm.width, bm.height))
            if (deg != 0f || sc < 1f) { val m = Matrix(); m.postRotate(deg); m.postScale(sc, sc); bm = Bitmap.createBitmap(bm, 0, 0, bm.width, bm.height, m, true) }
            val bo = ByteArrayOutputStream(); bm.compress(Bitmap.CompressFormat.JPEG, 75, bo)
            "data:image/jpeg;base64," + Base64.encodeToString(bo.toByteArray(), Base64.NO_WRAP)
        }
    } catch (_: Throwable) { null }

    private fun stopPlayer() { try { player?.stop() } catch (_: Throwable) {}; try { player?.release() } catch (_: Throwable) {}; player = null }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val me = ChatRepo.me(this)
        if (me == null) { finish(); return }
        val room = ChatRepo.roomOf(me)
        val title = if (room == "p") "أولياء الأمور" else "جروب الصف " + (mapOf("1" to "الأول", "2" to "الثاني", "3" to "الثالث", "4" to "الرابع", "5" to "الخامس")[me.grade] ?: me.grade)
        setContent {
            var msgs by remember { mutableStateOf(listOf<Msg>()) }
            var base by remember { mutableStateOf<String?>(null) }
            var typing by remember { mutableStateOf(listOf<String>()) }
            var playingId by remember { mutableStateOf(0L) }
            var lastTyp by remember { mutableStateOf(0L) }
            val scope = rememberCoroutineScope()

            LaunchedEffect(Unit) {
                withContext(Dispatchers.IO) { base = ChatRepo.base(this@NativeChatActivity) }
                while (isActive) {
                    val b = base
                    if (b != null) {
                        val got = withContext(Dispatchers.IO) { ChatRepo.load(b, room) }
                        if (got != null) {
                            // نُبقي رسائلي المعلّقة حتى تصل من الخادم
                            val ids = got.map { it.id }.toSet()
                            val merged = got + msgs.filter { it.sending && it.id !in ids }
                            if (merged != msgs) msgs = merged
                        }
                    }
                    delay(1500)
                }
            }
            LaunchedEffect(Unit) {
                while (isActive) {
                    val b = base
                    if (b != null) {
                        val t = withContext(Dispatchers.IO) { ChatRepo.typing(b, room, me) }
                        if (t != typing) typing = t
                    }
                    delay(2000)
                }
            }
            DisposableEffect(Unit) { onDispose { stopPlayer() } }

            fun sendMsg(text: String, img: String = "") {
                val b = base ?: return
                val tmpId = System.currentTimeMillis()
                msgs = msgs + Msg(tmpId, me.uid, me.name, me.role, tmpId, text, img.isNotEmpty(), true, img)
                scope.launch(Dispatchers.IO) { ChatRepo.send(b, room, me, text, img) }
            }
            onPicked = { uris ->
                scope.launch {
                    val list = uris.take(10)
                    for ((i, u) in list.withIndex()) {
                        if (list.size > 1) Toast.makeText(this@NativeChatActivity, "جاري تجهيز الصور (${i + 1}/${list.size})", Toast.LENGTH_SHORT).show()
                        val d = withContext(Dispatchers.IO) { toDataUrl(u) }
                        if (d == null) { Toast.makeText(this@NativeChatActivity, "تعذّر قراءة صورة", Toast.LENGTH_SHORT).show(); continue }
                        sendMsg("", d)
                        delay(30)
                    }
                }
            }
            ChatScreen(title, "${msgs.map { it.uid }.toSet().size} أعضاء", msgs, me.uid,
                onSend = { t -> sendMsg(t) },
                onBack = { finish() },
                typing = typing,
                onAttach = { try { picker.launch("image/*") } catch (_: Throwable) {} },
                onTyping = {
                    val now = System.currentTimeMillis()
                    val b = base
                    if (b != null && now - lastTyp > 3000) { lastTyp = now; scope.launch(Dispatchers.IO) { ChatRepo.setTyping(b, room, me) } }
                },
                onPlay = { m ->
                    if (playingId == m.id) { stopPlayer(); playingId = 0L }
                    else {
                        stopPlayer(); playingId = m.id
                        scope.launch {
                            val ok = withContext(Dispatchers.IO) {
                                try {
                                    val s = m.aud
                                    val bytes = Base64.decode(s.substring(s.indexOf(',') + 1), Base64.DEFAULT)
                                    val f = File(cacheDir, "vn_${m.id}.bin"); f.writeBytes(bytes)
                                    val mp = MediaPlayer()
                                    mp.setDataSource(f.absolutePath); mp.prepare()
                                    mp.setOnCompletionListener { stopPlayer(); playingId = 0L }
                                    player = mp; mp.start(); true
                                } catch (_: Throwable) { false }
                            }
                            if (!ok) { playingId = 0L; Toast.makeText(this@NativeChatActivity, "تعذّر تشغيل الرسالة الصوتية", Toast.LENGTH_SHORT).show() }
                        }
                    }
                },
                playingId = playingId)
        }
    }
}

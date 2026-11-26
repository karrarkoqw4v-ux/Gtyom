package com.alfarabi.school

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/** محادثات أصلية (Kotlin + Compose): تقرأ وترسل مباشرة لقاعدة المدرسة بنفس بنية الويب */
class NativeChatActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val me = ChatRepo.me(this)
        if (me == null) { finish(); return }
        val room = ChatRepo.roomOf(me)
        val title = if (room == "p") "أولياء الأمور" else "جروب الصف " + (mapOf("1" to "الأول", "2" to "الثاني", "3" to "الثالث", "4" to "الرابع", "5" to "الخامس")[me.grade] ?: me.grade)
        setContent {
            var msgs by remember { mutableStateOf(listOf<Msg>()) }
            var base by remember { mutableStateOf<String?>(null) }
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
                            msgs = got + msgs.filter { it.sending && it.id !in ids }
                        }
                    }
                    delay(1500)
                }
            }
            ChatScreen(title, "${msgs.map { it.uid }.toSet().size} أعضاء", msgs, me.uid,
                onSend = { t ->
                    val b = base ?: return@ChatScreen
                    val tmp = Msg(System.currentTimeMillis(), me.uid, me.name, me.role, System.currentTimeMillis(), t, sending = true)
                    msgs = msgs + tmp
                    scope.launch(Dispatchers.IO) { ChatRepo.send(b, room, me, t) }
                },
                onBack = { finish() })
        }
    }
}

package com.alfarabi.school

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

val Naskh = FontFamily(Font(R.font.naskh_regular, FontWeight.Normal), Font(R.font.naskh_bold, FontWeight.Bold))

private val BgTop = Color(0xFF0A0F18)
private val BgBottom = Color(0xFF0A0908)
private val Pill = Color(0xFF1A2333)
private val InBubble = Color(0xFF182533)
private val OutTop = Color(0xFF31608F)
private val OutBottom = Color(0xFF27527F)
private val Coral = Color(0xFFE2705B)
private val NameColors = listOf(Color(0xFF6C8CFF), Color(0xFF58C27D), Color(0xFFE5C158), Color(0xFFE5708A), Color(0xFFB07CFF), Color(0xFF4FC3D9))

private fun timeOf(ts: Long) = SimpleDateFormat("hh:mm a", Locale("ar")).format(Date(ts))

/** شاشة محادثة أصلية بتصميم تيليجرام وألوان الفارابي (RTL) */
@Composable
fun ChatScreen(title: String, subtitle: String, msgs: List<Msg>, myUid: String, onSend: (String) -> Unit, onBack: () -> Unit) {
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        val list = rememberLazyListState()
        LaunchedEffect(msgs.size) { if (msgs.isNotEmpty()) list.animateScrollToItem(msgs.size - 1) }
        Column(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(BgTop, BgBottom)))) {
            // الرأس: زر رجوع + كبسولة العنوان
            Row(Modifier.fillMaxWidth().statusBarsPadding().padding(horizontal = 10.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(44.dp).clip(CircleShape).background(Pill).clickable { onBack() }, contentAlignment = Alignment.Center) {
                    Text("›", color = Color.White, fontSize = 30.sp, fontFamily = Naskh)
                }
                Spacer(Modifier.width(10.dp))
                Row(Modifier.weight(1f).height(52.dp).clip(RoundedCornerShape(26.dp)).background(Pill).padding(horizontal = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(40.dp).clip(CircleShape).background(Brush.linearGradient(listOf(Color(0xFF38BDF8), Color(0xFF2563EB)))), contentAlignment = Alignment.Center) {
                        Text(title.take(1), color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
                    }
                    Spacer(Modifier.width(10.dp))
                    Column {
                        Text(title, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh, maxLines = 1)
                        Text(subtitle, color = Color(0xFFB9C6DC), fontSize = 12.sp, fontFamily = Naskh, maxLines = 1)
                    }
                }
            }
            // الرسائل
            LazyColumn(Modifier.weight(1f).fillMaxWidth(), state = list, contentPadding = PaddingValues(horizontal = 10.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                items(msgs, key = { it.id }) { m -> Bubble(m, mine = m.uid == myUid) }
            }
            Composer(onSend)
        }
    }
}

@Composable
private fun Bubble(m: Msg, mine: Boolean) {
    // حركة دخول ناعمة
    val a = remember { Animatable(0f) }
    LaunchedEffect(Unit) { a.animateTo(1f, tween(260, easing = FastOutSlowInEasing)) }
    Row(Modifier.fillMaxWidth().scale(0.94f + 0.06f * a.value), horizontalArrangement = if (mine) Arrangement.Start else Arrangement.End) {
        val shape = if (mine) RoundedCornerShape(18.dp, 18.dp, 4.dp, 18.dp) else RoundedCornerShape(18.dp, 18.dp, 18.dp, 4.dp)
        val bg = if (mine) Modifier.background(Brush.verticalGradient(listOf(OutTop, OutBottom)), shape) else Modifier.background(InBubble, shape)
        Column(Modifier.widthIn(max = 300.dp).then(bg).padding(horizontal = 12.dp, vertical = 7.dp)) {
            if (!mine && m.name.isNotEmpty()) {
                val col = NameColors[(m.name.hashCode() and 0x7fffffff) % NameColors.size]
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(m.name, color = col, fontSize = 13.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
                    if (m.role == "teacher" || m.role == "admin") {
                        Spacer(Modifier.width(6.dp))
                        Text("المشرف", color = Color(0xFF7FE0A0), fontSize = 10.sp, fontFamily = Naskh,
                            modifier = Modifier.clip(RoundedCornerShape(8.dp)).background(Color(0x3322A05A)).padding(horizontal = 6.dp, vertical = 1.dp))
                    }
                }
            }
            if (m.hasImg) Text("📷 صورة", color = Color(0xFFCFE3F7), fontSize = 14.sp, fontFamily = Naskh)
            if (m.text.isNotEmpty()) Text(m.text, color = Color.White, fontSize = 17.sp, lineHeight = 26.sp, fontFamily = Naskh)
            Row(Modifier.align(Alignment.Start).padding(top = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(timeOf(m.ts), color = Color(0xB3C8D6E8), fontSize = 11.sp, fontFamily = Naskh)
                if (mine) Text(if (m.sending) "  ⏳" else "  ✓✓", color = Color(0xFF8EC8FF), fontSize = 11.sp)
            }
        }
    }
}

@Composable
private fun Composer(onSend: (String) -> Unit) {
    var text by remember { mutableStateOf("") }
    Row(Modifier.fillMaxWidth().navigationBarsPadding().imePadding().padding(horizontal = 10.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        val press = remember { mutableStateOf(false) }
        val sc by animateFloatAsState(if (press.value) 0.86f else 1f, label = "send")
        Box(Modifier.size(50.dp).scale(sc).clip(CircleShape).background(Coral).clickable {
            val t = text.trim(); if (t.isNotEmpty()) { onSend(t); text = "" }
        }, contentAlignment = Alignment.Center) { Text("➤", color = Color.White, fontSize = 20.sp) }
        Spacer(Modifier.width(10.dp))
        Box(Modifier.weight(1f).heightIn(min = 50.dp).clip(RoundedCornerShape(26.dp)).background(Pill).padding(horizontal = 18.dp, vertical = 12.dp), contentAlignment = Alignment.CenterStart) {
            if (text.isEmpty()) Text("رسالة", color = Color(0xFF7F91A4), fontSize = 17.sp, fontFamily = Naskh)
            BasicTextField(text, { text = it }, textStyle = TextStyle(color = Color.White, fontSize = 17.sp, fontFamily = Naskh), cursorBrush = SolidColor(Color.White), modifier = Modifier.fillMaxWidth())
        }
    }
}

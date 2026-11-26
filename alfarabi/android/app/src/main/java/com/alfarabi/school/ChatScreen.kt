package com.alfarabi.school

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.util.LruCache
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

val Naskh = FontFamily(Font(R.font.naskh_regular, FontWeight.Normal), Font(R.font.naskh_bold, FontWeight.Bold))

private val Bg = Color(0xFF0D0F12)
private val Glass = Color(0xEB1A1C1B)
private val GlassLine = Color(0x2EFFFFFF)
private val InBubble = Color(0xFF212225)
private val OutBubble = Color(0xFF2F64B5)
private val Accent = Color(0xFF4F77F0)
private val Muted = Color(0xFF9B9EA4)
private val NameColors = listOf(Color(0xFF6C8CFF), Color(0xFF58C27D), Color(0xFFE5C158), Color(0xFFE5708A), Color(0xFFB07CFF), Color(0xFF4FC3D9))

private fun timeOf(ts: Long) = SimpleDateFormat("hh:mm a", Locale("ar")).format(Date(ts))
private fun dayKey(ts: Long): Int { val c = Calendar.getInstance(); c.timeInMillis = ts; return c.get(Calendar.YEAR) * 400 + c.get(Calendar.DAY_OF_YEAR) }
private fun dayLabel(ts: Long): String {
    val d = dayKey(ts); val now = dayKey(System.currentTimeMillis())
    return when (d) { now -> "اليوم"; now - 1 -> "أمس"; else -> SimpleDateFormat("d MMMM yyyy", Locale("ar")).format(Date(ts)) }
}

/** كاش صور المحادثة (فك الصورة خارج الخيط الرئيسي وبحجم مصغّر) */
object ChatImages {
    private val cache = object : LruCache<Long, Bitmap>(24 * 1024 * 1024) { override fun sizeOf(k: Long, v: Bitmap) = v.byteCount }
    suspend fun load(m: Msg): Bitmap? {
        cache.get(m.id)?.let { return it }
        return withContext(Dispatchers.Default) {
            try {
                val s = m.img
                val bytes = if (s.startsWith("data:")) Base64.decode(s.substring(s.indexOf(',') + 1), Base64.DEFAULT) else return@withContext null
                val o = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                BitmapFactory.decodeByteArray(bytes, 0, bytes.size, o)
                var ss = 1
                while (maxOf(o.outWidth, o.outHeight) / (ss * 2) >= 720) ss *= 2
                val bm = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, BitmapFactory.Options().apply { inSampleSize = ss })
                if (bm != null) cache.put(m.id, bm)
                bm
            } catch (_: Throwable) { null }
        }
    }
}

private enum class Ic { Back, Dots, Clip, Send, Play, Pause, Tick, Ticks }

@Composable
private fun Icon(k: Ic, color: Color, size: Dp = 24.dp) {
    Canvas(Modifier.size(size)) {
        val u = this.size.minDimension / 24f
        fun o(x: Float, y: Float) = Offset(x * u, y * u)
        val st = Stroke(width = 1.9f * u, cap = StrokeCap.Round, join = StrokeJoin.Round)
        when (k) {
            Ic.Back -> { val p = Path().apply { moveTo(19 * u, 12 * u); lineTo(5 * u, 12 * u); moveTo(11 * u, 6 * u); lineTo(5 * u, 12 * u); lineTo(11 * u, 18 * u) }; drawPath(p, color, style = st) }
            Ic.Dots -> { listOf(5f, 12f, 19f).forEach { drawCircle(color, 1.7f * u, o(12f, it)) } }
            Ic.Clip -> { val p = Path().apply {
                moveTo(21 * u, 11.5f * u); lineTo(12.5f * u, 20 * u)
                cubicTo(9.5f * u, 23 * u, 4.5f * u, 20.5f * u, 4.7f * u, 16.8f * u)
                cubicTo(4.8f * u, 15.5f * u, 5.5f * u, 14.6f * u, 6.2f * u, 14f * u)
                lineTo(13.5f * u, 6.5f * u)
                cubicTo(15.5f * u, 4.5f * u, 18.8f * u, 6.3f * u, 18.7f * u, 8.7f * u)
                cubicTo(18.7f * u, 9.4f * u, 18.4f * u, 10f * u, 17.9f * u, 10.5f * u)
                lineTo(10.2f * u, 17.6f * u)
            }; drawPath(p, color, style = st) }
            Ic.Send -> { val p = Path().apply { moveTo(3 * u, 11.5f * u); lineTo(21 * u, 3 * u); lineTo(14.5f * u, 21 * u); lineTo(11.3f * u, 13.7f * u); close() }; drawPath(p, color, style = Fill) }
            Ic.Play -> { val p = Path().apply { moveTo(8 * u, 5 * u); lineTo(19 * u, 12 * u); lineTo(8 * u, 19 * u); close() }; drawPath(p, color, style = Fill) }
            Ic.Pause -> { drawRect(color, o(6f, 5f), Size(4f * u, 14f * u)); drawRect(color, o(14f, 5f), Size(4f * u, 14f * u)) }
            Ic.Tick -> { val p = Path().apply { moveTo(5 * u, 12.5f * u); lineTo(10 * u, 17.5f * u); lineTo(19 * u, 7 * u) }; drawPath(p, color, style = st) }
            Ic.Ticks -> { val p = Path().apply { moveTo(2 * u, 12.5f * u); lineTo(6.5f * u, 17 * u); lineTo(15 * u, 7.5f * u); moveTo(10 * u, 16.5f * u); lineTo(11.5f * u, 18 * u); lineTo(21 * u, 7.5f * u) }; drawPath(p, color, style = st) }
        }
    }
}

private fun Modifier.glass(shape: androidx.compose.ui.graphics.Shape) = this.background(Glass, shape).border(1.dp, GlassLine, shape)

private sealed class Row_ {
    data class Day(val label: String, val key: Int) : Row_()
    data class M(val m: Msg, val first: Boolean, val last: Boolean) : Row_()
}

private fun buildRows(msgs: List<Msg>): List<Row_> {
    val out = ArrayList<Row_>()
    var prev: Msg? = null
    for ((i, m) in msgs.withIndex()) {
        val newDay = prev == null || dayKey(prev.ts) != dayKey(m.ts)
        if (newDay) out.add(Row_.Day(dayLabel(m.ts), dayKey(m.ts)))
        val first = newDay || prev!!.uid != m.uid || m.ts - prev.ts > 5 * 60_000
        val nx = msgs.getOrNull(i + 1)
        val last = nx == null || nx.uid != m.uid || nx.ts - m.ts > 5 * 60_000 || dayKey(nx.ts) != dayKey(m.ts)
        out.add(Row_.M(m, first, last))
        prev = m
    }
    return out
}

/** شاشة محادثة أصلية بنمط تيليجرام الزجاجي (واجهة LTR ونصوص عربية) */
@Composable
fun ChatScreen(
    title: String, subtitle: String, msgs: List<Msg>, myUid: String, onSend: (String) -> Unit, onBack: () -> Unit,
    typing: List<String> = emptyList(), onAttach: () -> Unit = {}, onTyping: () -> Unit = {},
    onPlay: (Msg) -> Unit = {}, playingId: Long = 0L
) {
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
        val rows = remember(msgs) { buildRows(msgs) }
        val list = rememberLazyListState()
        var firstScroll by remember { mutableStateOf(true) }
        LaunchedEffect(rows.size, msgs.lastOrNull()?.id) {
            if (rows.isEmpty()) return@LaunchedEffect
            val lastIdx = rows.size - 1
            val near = list.layoutInfo.visibleItemsInfo.lastOrNull()?.index?.let { it >= lastIdx - 2 } ?: true
            val mine = msgs.lastOrNull()?.uid == myUid
            if (firstScroll) { list.scrollToItem(lastIdx); firstScroll = false }
            else if (near || mine) list.animateScrollToItem(lastIdx)
        }
        Box(Modifier.fillMaxSize().background(Bg)) {
            Column(Modifier.fillMaxSize()) {
                // الشريط العلوي الزجاجي
                Row(Modifier.fillMaxWidth().statusBarsPadding().padding(horizontal = 8.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(46.dp).clip(CircleShape).glass(CircleShape).clickable { onBack() }, contentAlignment = Alignment.Center) { Icon(Ic.Back, Color(0xFFF1F3F6)) }
                    Spacer(Modifier.width(8.dp))
                    Row(Modifier.weight(1f).height(48.dp).glass(RoundedCornerShape(24.dp)).padding(horizontal = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(38.dp).clip(CircleShape).background(Brush.linearGradient(listOf(Color(0xFF38BDF8), Color(0xFF2563EB)))), contentAlignment = Alignment.Center) {
                            Text(title.take(1), color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
                        }
                        Spacer(Modifier.width(10.dp))
                        Column(Modifier.weight(1f)) {
                            Text(title, color = Color(0xFFF1F3F6), fontSize = 16.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh, maxLines = 1,
                                style = TextStyle(textDirection = TextDirection.Rtl, textAlign = TextAlign.Left), modifier = Modifier.fillMaxWidth())
                            Text(subtitle, color = Muted, fontSize = 12.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh, maxLines = 1,
                                style = TextStyle(textDirection = TextDirection.Rtl, textAlign = TextAlign.Left), modifier = Modifier.fillMaxWidth())
                        }
                    }
                    Spacer(Modifier.width(8.dp))
                    Box(Modifier.size(46.dp).clip(CircleShape).glass(CircleShape), contentAlignment = Alignment.Center) { Icon(Ic.Dots, Color(0xFFF1F3F6)) }
                }
                // الرسائل
                LazyColumn(Modifier.weight(1f).fillMaxWidth(), state = list, contentPadding = PaddingValues(horizontal = 8.dp, vertical = 6.dp)) {
                    items(rows.size, key = { i -> when (val r = rows[i]) { is Row_.Day -> "d" + r.key; is Row_.M -> "m" + r.m.id } }) { i ->
                        when (val r = rows[i]) {
                            is Row_.Day -> Box(Modifier.fillMaxWidth().padding(vertical = 8.dp), contentAlignment = Alignment.Center) {
                                Text(r.label, color = Color(0xFFC4C7CC), fontSize = 12.sp, fontFamily = Naskh,
                                    modifier = Modifier.clip(RoundedCornerShape(12.dp)).background(Color(0xD9282A2D)).padding(horizontal = 12.dp, vertical = 2.dp))
                            }
                            is Row_.M -> Bubble(r.m, r.first, r.last, r.m.uid == myUid, r.m.id == playingId, onPlay)
                        }
                    }
                }
                if (typing.isNotEmpty()) {
                    Text(typing.joinToString("، ") + (if (typing.size > 1) " يكتبون..." else " يكتب..."), color = Color(0xFF6AA8FF), fontSize = 12.sp, fontFamily = Naskh,
                        modifier = Modifier.padding(start = 52.dp, bottom = 2.dp))
                }
                Composer(onSend, onAttach, onTyping)
            }
        }
    }
}

@Composable
private fun Bubble(m: Msg, first: Boolean, last: Boolean, mine: Boolean, playing: Boolean, onPlay: (Msg) -> Unit) {
    val big = 18.dp; val small = 6.dp; val tail = 4.dp
    val shape = if (mine) RoundedCornerShape(big, if (first) big else small, if (last) tail else small, big)
                else RoundedCornerShape(if (first) big else small, big, big, if (last) tail else small)
    val bg = if (mine) OutBubble else InBubble
    val nameCol = NameColors[(m.name.hashCode() and 0x7fffffff) % NameColors.size]
    Row(Modifier.fillMaxWidth().padding(top = if (first) 8.dp else 2.dp), horizontalArrangement = if (mine) Arrangement.End else Arrangement.Start, verticalAlignment = Alignment.Bottom) {
        if (!mine) {
            if (last) Box(Modifier.size(34.dp).clip(CircleShape).background(nameCol), contentAlignment = Alignment.Center) {
                Text(m.name.take(1), color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
            } else Spacer(Modifier.size(34.dp))
            Spacer(Modifier.width(6.dp))
        }
        Column(Modifier.widthIn(max = 300.dp).clip(shape).background(bg).padding(horizontal = 11.dp, vertical = 6.dp)) {
            if (!mine && first && m.name.isNotEmpty()) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.End, modifier = Modifier.fillMaxWidth()) {
                    if (m.role == "teacher" || m.role == "admin") {
                        Text("المشرف", color = Color(0xFF62D17A), fontSize = 10.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh,
                            modifier = Modifier.clip(RoundedCornerShape(9.dp)).background(Color(0xFF17301F)).padding(horizontal = 7.dp))
                        Spacer(Modifier.width(6.dp))
                    }
                    Text(m.name, color = nameCol, fontSize = 13.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
                }
            }
            if (m.img.isNotEmpty()) {
                val bm by produceState<Bitmap?>(null, m.id) { value = ChatImages.load(m) }
                val b = bm
                if (b != null) Image(b.asImageBitmap(), null, Modifier.padding(vertical = 2.dp).widthIn(max = 240.dp).clip(RoundedCornerShape(12.dp)), contentScale = ContentScale.FillWidth)
                else Box(Modifier.padding(vertical = 2.dp).size(200.dp, 140.dp).clip(RoundedCornerShape(12.dp)).background(Color(0xFF2B2E33)))
            } else if (m.hasImg) Text("📷", color = Color.White, fontSize = 14.sp)
            if (m.aud.isNotEmpty()) {
                Row(Modifier.padding(vertical = 2.dp).widthIn(min = 200.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(38.dp).clip(CircleShape).background(Accent).clickable { onPlay(m) }, contentAlignment = Alignment.Center) { Icon(if (playing) Ic.Pause else Ic.Play, Color.White, 18.dp) }
                    Spacer(Modifier.width(10.dp))
                    Row(Modifier.weight(1f).height(28.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                        val hs = listOf(8, 14, 20, 11, 16, 24, 12, 18, 9, 15, 22, 10, 17, 13, 21, 9)
                        hs.forEach { h -> Box(Modifier.width(3.dp).height(h.dp).clip(RoundedCornerShape(2.dp)).background(if (playing) Color(0xFF9DB7FF) else Color(0xFF8C97A6))) }
                    }
                    Spacer(Modifier.width(8.dp))
                    Text("0:%02d".format(m.ad.coerceAtLeast(1)), color = Muted, fontSize = 11.sp, fontFamily = Naskh)
                }
            }
            if (m.text.isNotEmpty()) Text(m.text, color = Color.White, fontSize = 16.sp, lineHeight = 24.sp, fontFamily = Naskh,
                style = TextStyle(textDirection = TextDirection.Rtl, textAlign = TextAlign.Right), modifier = Modifier.fillMaxWidth())
            Row(Modifier.align(Alignment.End).padding(top = 1.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(timeOf(m.ts), color = if (mine) Color(0xFFC3D8F6) else Muted, fontSize = 10.5.sp, fontFamily = Naskh)
                if (mine) { Spacer(Modifier.width(4.dp)); if (m.sending) Icon(Ic.Tick, Color(0xFFC3D8F6), 14.dp) else Icon(Ic.Ticks, Color(0xFFC3D8F6), 14.dp) }
            }
        }
    }
}

@Composable
private fun Composer(onSend: (String) -> Unit, onAttach: () -> Unit, onTyping: () -> Unit) {
    var text by remember { mutableStateOf("") }
    val can = text.isNotBlank()
    Box(Modifier.fillMaxWidth().navigationBarsPadding().imePadding().padding(start = 8.dp, end = 8.dp, top = 6.dp, bottom = 10.dp)) {
        Row(Modifier.fillMaxWidth().heightIn(min = 47.dp).glass(RoundedCornerShape(24.dp)).padding(start = 6.dp, end = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(38.dp).clip(CircleShape).clickable { onAttach() }, contentAlignment = Alignment.Center) { Icon(Ic.Clip, Color(0xFFB6B9BF), 24.dp) }
            Box(Modifier.weight(1f).padding(horizontal = 8.dp, vertical = 10.dp), contentAlignment = Alignment.CenterStart) {
                if (text.isEmpty()) Text("الرسالة", color = Color(0xFF7B7E84), fontSize = 20.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
                BasicTextField(text, { text = it; if (it.isNotEmpty()) onTyping() },
                    textStyle = TextStyle(color = Color(0xFFECEEF1), fontSize = 17.sp, fontFamily = Naskh, textDirection = TextDirection.Content),
                    cursorBrush = SolidColor(Accent), maxLines = 5, modifier = Modifier.fillMaxWidth())
            }
            Box(Modifier.size(39.dp).clip(CircleShape).background(Accent).alpha(if (can) 1f else 0.6f).clickable {
                val t = text.trim(); if (t.isNotEmpty()) { onSend(t); text = "" }
            }, contentAlignment = Alignment.Center) { Icon(Ic.Send, Color.White, 22.dp) }
        }
    }
}

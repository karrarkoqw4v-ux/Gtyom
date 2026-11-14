package com.alfarabi.school

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Ink = Color(0xFF14213D)
private val Sub = Color(0xFF51647E)
private val Blue1 = Color(0xFF1AA7F2)
private val Blue2 = Color(0xFF2F5FD0)
private val PageBg = Brush.verticalGradient(listOf(Color(0xFFF4F9FF), Color(0xFFE6F0FF), Color(0xFFFFF3E6)))

data class Tile(val title: String, val sub: String, val icon: ImageVector, val c1: Color, val c2: Color, val key: String)
val Tiles = listOf(
    Tile("الجدول الأسبوعي", "جدول الحصص والدوام", Icons.Default.DateRange, Color(0xFF38BDF8), Color(0xFF0A86D6), "schedule"),
    Tile("غيابات الطلبة", "سجل الغيابات", Icons.Default.Person, Color(0xFFFB7185), Color(0xFFE11D48), "absence"),
    Tile("درجات الامتحانات", "درجات الامتحانات", Icons.Default.Star, Color(0xFF4ADE80), Color(0xFF16A34A), "grades"),
    Tile("تحاضير الدروس", "تحاضير الدروس اليومية", Icons.Default.Create, Color(0xFFA78BFA), Color(0xFF7C3AED), "plans"),
    Tile("المحادثات", "المحادثات والكروبات", Icons.Default.Email, Color(0xFF60A5FA), Color(0xFF2563EB), "chat")
)

@Composable private fun Rtl(content: @Composable () -> Unit) = CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl, content = content)

@Composable
private fun GradIcon(icon: ImageVector, c1: Color, c2: Color, size: Int = 54) {
    Box(Modifier.size(size.dp).shadow(10.dp, CircleShape, ambientColor = c2, spotColor = c2).clip(CircleShape)
        .background(Brush.linearGradient(listOf(c1, c2))).border(2.dp, Color.White.copy(alpha = .35f), CircleShape), contentAlignment = Alignment.Center) {
        Icon(icon, null, tint = Color.White, modifier = Modifier.size((size * 0.5f).dp))
    }
}

@Composable
fun Dock(selected: Int, onSelect: (Int) -> Unit) {
    val items = listOf("الرئيسية" to Icons.Default.Home, "قنوات المادة" to Icons.Default.Person, "صفحة المدرسة" to Icons.Default.Info, "كروب الطلاب" to Icons.Default.Email, "الإعدادات" to Icons.Default.Settings)
    Rtl {
        Row(Modifier.padding(horizontal = 18.dp, vertical = 14.dp).fillMaxWidth().shadow(14.dp, RoundedCornerShape(999.dp), ambientColor = Color(0x331E50A0), spotColor = Color(0x331E50A0))
            .clip(RoundedCornerShape(999.dp)).background(Color.White.copy(alpha = .94f)).padding(7.dp), horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
            items.forEachIndexed { i, (label, ic) ->
                val on = i == selected
                Row(Modifier.then(if (on) Modifier.weight(2.2f) else Modifier.weight(1f)).height(52.dp).clip(RoundedCornerShape(999.dp))
                    .then(if (on) Modifier.background(Brush.horizontalGradient(listOf(Color(0xFF0AA6F5), Color(0xFF2F7FB0)))) else Modifier)
                    .clickable { onSelect(i) }, horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                    Icon(ic, null, tint = if (on) Color.White else Color(0xFF0AA6F5), modifier = Modifier.size(24.dp))
                    if (on) { Spacer(Modifier.width(6.dp)); Text(label, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh, maxLines = 1) }
                }
            }
        }
    }
}

@Composable
fun PageScaffold(title: String?, content: @Composable ColumnScope.() -> Unit) {
    Rtl {
        Column(Modifier.fillMaxSize().background(PageBg).statusBarsPadding().verticalScroll(rememberScrollState()).padding(horizontal = 14.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (title != null) Text(title, color = Ink, fontSize = 26.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh, modifier = Modifier.padding(horizontal = 4.dp, vertical = 8.dp))
            content()
            Spacer(Modifier.height(90.dp))
        }
    }
}

@Composable
fun HomeScreen(userName: String, grade: String, role: String, onTile: (String) -> Unit) {
    PageScaffold(null) {
        Spacer(Modifier.height(44.dp))
        Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(30.dp)).background(Brush.linearGradient(listOf(Blue1, Blue2))).padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Image(painterResource(R.drawable.school_logo), null, contentScale = ContentScale.Fit, modifier = Modifier.size(84.dp).clip(CircleShape).background(Color.White).padding(10.dp))
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text("أهلاً بك في", color = Color.White.copy(alpha = .9f), fontSize = 14.sp, fontFamily = Naskh)
                Text("ثانوية الفارابي الأهلية للبنين", color = Color.White, fontSize = 19.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
                Spacer(Modifier.height(6.dp))
                Text(if (role == "teacher") "واجهة المدرس" else if (role == "parent") "واجهة ولي الأمر" else "واجهة الطالب", color = Color.White, fontSize = 13.sp, fontFamily = Naskh,
                    modifier = Modifier.clip(RoundedCornerShape(999.dp)).background(Color.White.copy(alpha = .22f)).padding(horizontal = 14.dp, vertical = 4.dp))
            }
        }
        Tiles.chunked(2).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { t ->
                    if (t.key == "chat") ChatTile(t, onTile, Modifier.weight(1f)) else SquareTile(t, onTile, Modifier.weight(1f))
                }
                if (row.size == 1 && row[0].key != "chat") Spacer(Modifier.weight(1f))
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            InfoPill("الاسم", userName, Modifier.weight(1f))
            InfoPill("الصف", grade, Modifier.weight(1f))
        }
    }
}

@Composable
private fun SquareTile(t: Tile, onTile: (String) -> Unit, modifier: Modifier) {
    Column(modifier.height(168.dp).clip(RoundedCornerShape(28.dp))
        .background(Brush.linearGradient(listOf(t.c1.copy(alpha = .22f), Color.White.copy(alpha = .7f))))
        .border(1.5.dp, t.c1.copy(alpha = .35f), RoundedCornerShape(28.dp)).clickable { onTile(t.key) }.padding(16.dp), verticalArrangement = Arrangement.SpaceBetween) {
        GradIcon(t.icon, t.c1, t.c2)
        Column { Text(t.title, color = Ink, fontSize = 17.5.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh); Text(t.sub, color = Sub, fontSize = 12.sp, fontFamily = Naskh) }
    }
}

@Composable
private fun ChatTile(t: Tile, onTile: (String) -> Unit, modifier: Modifier) {
    Row(modifier.height(100.dp).clip(RoundedCornerShape(28.dp))
        .background(Brush.linearGradient(listOf(t.c1.copy(alpha = .25f), Color.White.copy(alpha = .75f))))
        .border(1.5.dp, t.c1.copy(alpha = .35f), RoundedCornerShape(28.dp)).clickable { onTile(t.key) }.padding(horizontal = 16.dp), verticalAlignment = Alignment.CenterVertically) {
        GradIcon(t.icon, t.c1, t.c2, 60)
        Spacer(Modifier.width(14.dp))
        Column(Modifier.weight(1f)) { Text(t.title, color = Ink, fontSize = 19.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh); Text(t.sub, color = Sub, fontSize = 12.sp, fontFamily = Naskh) }
        Box(Modifier.size(34.dp).clip(CircleShape).background(Color.White.copy(alpha = .85f)), contentAlignment = Alignment.Center) { Icon(Icons.Default.KeyboardArrowLeft, null, tint = Blue2) }
    }
}

@Composable
private fun InfoPill(label: String, value: String, modifier: Modifier) {
    Column(modifier.clip(RoundedCornerShape(22.dp)).background(Color.White.copy(alpha = .72f)).border(1.5.dp, Color.White, RoundedCornerShape(22.dp)).padding(horizontal = 16.dp, vertical = 8.dp)) {
        Text(label, color = Sub, fontSize = 11.5.sp, fontFamily = Naskh)
        Text(value, color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
    }
}

data class GradeRow(val subject: String, val exam: String, val value: String, val note: String)
@Composable
fun GradesScreen(rows: List<GradeRow>) {
    PageScaffold("درجات الامتحانات") {
        rows.forEach { g ->
            val pct = g.value.substringBefore("/").toIntOrNull() ?: 0
            val col = if (pct >= 80) Color(0xFF16A34A) else if (pct >= 60) Color(0xFFFACC15) else if (pct >= 50) Color(0xFFF97316) else Color(0xFFDC2626)
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Color.White).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.width(5.dp).height(52.dp).clip(RoundedCornerShape(5.dp)).background(col))
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text("${g.subject} — ${g.exam}", color = Ink, fontSize = 16.5.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
                    if (g.note.isNotEmpty()) Text(g.note, color = Sub, fontSize = 12.sp, fontFamily = Naskh)
                }
                Box(Modifier.size(width = 88.dp, height = 56.dp).clip(RoundedCornerShape(18.dp)).background(col), contentAlignment = Alignment.Center) {
                    Text(g.value, color = if (pct in 60..79) Color(0xFF4A3B00) else Color.White, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

data class PlanRow(val title: String, val subject: String, val teacher: String, val body: String, val left: String)
@Composable
fun PlansScreen(rows: List<PlanRow>) {
    PageScaffold("تحاضير الدروس") {
        rows.forEach { p ->
            Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Color.White).padding(16.dp)) {
                Text(p.title, color = Ink, fontSize = 17.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
                Text("${p.subject} — ${p.teacher} — ${p.left}", color = Sub, fontSize = 12.sp, fontFamily = Naskh,
                    modifier = Modifier.padding(vertical = 6.dp).clip(RoundedCornerShape(999.dp)).background(Color(0xFFEEF5FF)).padding(horizontal = 10.dp, vertical = 2.dp))
                Text(p.body, color = Ink, fontSize = 14.5.sp, lineHeight = 24.sp, fontFamily = Naskh)
            }
        }
    }
}

data class ChannelRow(val name: String, val teacher: String, val subject: String)
@Composable
fun ChannelsScreen(rows: List<ChannelRow>) {
    val cols = listOf(Pair(Color(0xFF38BDF8), Color(0xFF2563EB)), Pair(Color(0xFFA78BFA), Color(0xFF7C3AED)), Pair(Color(0xFF4ADE80), Color(0xFF16A34A)))
    PageScaffold("قنوات المادة") {
        Row(Modifier.fillMaxWidth().height(58.dp).clip(RoundedCornerShape(20.dp)).background(Color.White).padding(horizontal = 14.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("الصق رابط القناة أو اسمها @username", color = Color(0xFF8394AA), fontSize = 13.sp, fontFamily = Naskh, modifier = Modifier.weight(1f))
            Text("فتح", color = Color.White, fontWeight = FontWeight.Bold, fontFamily = Naskh, modifier = Modifier.clip(RoundedCornerShape(15.dp)).background(Brush.linearGradient(listOf(Blue1, Blue2))).padding(horizontal = 20.dp, vertical = 10.dp))
        }
        rows.forEachIndexed { i, c ->
            val (a, b) = cols[i % cols.size]
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(Color.White).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(58.dp).clip(RoundedCornerShape(19.dp)).background(Brush.linearGradient(listOf(a, b))), contentAlignment = Alignment.Center) { Text(c.name.removePrefix("قناة ").take(1), color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh) }
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text(c.name, color = Ink, fontSize = 17.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh)
                    Text("${c.teacher} - ${c.subject}", color = Sub, fontSize = 12.5.sp, fontFamily = Naskh, modifier = Modifier.clip(RoundedCornerShape(999.dp)).background(Color(0xFFEEF5FF)).padding(horizontal = 10.dp, vertical = 2.dp))
                }
                Box(Modifier.size(32.dp).clip(CircleShape).background(Color(0xFFEEF5FF)), contentAlignment = Alignment.Center) { Icon(Icons.Default.KeyboardArrowLeft, null, tint = Blue2) }
            }
        }
    }
}

@Composable
fun SettingsScreen(items: List<String>) {
    PageScaffold("الإعدادات") {
        items.forEach { s ->
            Row(Modifier.fillMaxWidth().height(62.dp).clip(RoundedCornerShape(999.dp)).background(Color.White).border(1.dp, Color(0xFFE1E9F5), RoundedCornerShape(999.dp)).padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(s, color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Bold, fontFamily = Naskh, modifier = Modifier.weight(1f))
                Icon(Icons.Default.KeyboardArrowLeft, null, tint = Color(0xFF9DB0C8))
            }
        }
    }
}

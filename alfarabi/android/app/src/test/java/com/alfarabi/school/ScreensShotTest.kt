package com.alfarabi.school

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w392dp-h820dp-xxhdpi")
class ScreensShotTest {
    @get:Rule val rule = createComposeRule()

    private fun shot(name: String, tab: Int, content: @androidx.compose.runtime.Composable () -> Unit) {
        rule.setContent { Box(Modifier.fillMaxSize()) { content(); Box(Modifier.align(Alignment.BottomCenter)) { Dock(tab) {} } } }
        rule.onRoot().captureRoboImage("build/shots/native_$name.png")
    }

    @Test fun home() = shot("01_home", 0) { HomeScreen("كرار حيدر مرزه", "الثالث متوسط", "student") {} }
    @Test fun grades() = shot("02_grades", 0) { GradesScreen(listOf(GradeRow("الرياضيات", "الامتحان الشهري", "92/100", "ممتاز"), GradeRow("الفيزياء", "امتحان يومي", "74/100", ""), GradeRow("الكيمياء", "الامتحان الشهري", "55/100", "تحتاج مراجعة"), GradeRow("اللغة العربية", "امتحان يومي", "41/100", ""))) }
    @Test fun plans() = shot("03_plans", 0) { PlansScreen(listOf(PlanRow("الفصل الثالث: المعادلات التربيعية", "الرياضيات", "الأستاذ علي صادق", "مراجعة قانون الدستور وحل أمثلة الصفحة 45 مع تمارين الواجب.", "متبقي يوم"), PlanRow("قوانين نيوتن للحركة", "الفيزياء", "الأستاذة سارة علي", "القانون الأول والثاني وتطبيقاتهما، مع حل مسائل عن القوة والتسارع.", "متبقي يوم"))) }
    @Test fun channels() = shot("04_channels", 1) { ChannelsScreen(listOf(ChannelRow("قناة الرياضيات", "الأستاذ علي صادق", "الرياضيات"), ChannelRow("قناة اللغة الإنجليزية", "الأستاذ حسن كريم", "اللغة الإنجليزية"), ChannelRow("قناة الفيزياء", "الأستاذة سارة علي", "الفيزياء"))) }
    @Test fun settings() = shot("05_settings", 4) { SettingsScreen(listOf("صلاحية حسابي", "الملف الشخصي", "الأجهزة المسجلة", "الإعدادات والخصوصية", "إعدادات المحادثة", "صلاحيات التطبيق", "الإشعارات المهمة")) }
}

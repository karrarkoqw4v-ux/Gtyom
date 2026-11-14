package com.alfarabi.school

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
class ChatShotTest {
    @get:Rule val rule = createComposeRule()

    @Test fun chat() {
        val t = 1794400000000L
        val msgs = listOf(
            Msg(1, "111", "الأستاذ علي صادق", "teacher", t, "السلام عليكم، وصلت الملزمة الجديدة. حمّلوها من قسم الملازم."),
            Msg(2, "444", "حسين أحمد", "student", t + 60000, "شكراً أستاذ، بس شلون أحفظ الصفحة؟"),
            Msg(3, "222", "كرار حيدر", "student", t + 120000, "اضغط زر حفظ الصفحة بالأسفل ويتحفظ بالمعرض"),
            Msg(4, "333", "زينب كاظم", "student", t + 180000, "تمام وصلت، شكراً أستاذ"),
            Msg(5, "111", "الأستاذ علي صادق", "teacher", t + 240000, "الامتحان الشهري يوم الأحد الساعة التاسعة صباحاً"),
            Msg(6, "222", "كرار حيدر", "student", t + 300000, "ان شاء الله، هل يشمل الفصل الثالث؟"),
            Msg(7, "222", "كرار حيدر", "student", t + 360000, "هلا", sending = true)
        )
        rule.setContent { ChatScreen("جروب الصف الثالث متوسط", "5 أعضاء", msgs, "222", {}, {}) }
        rule.onRoot().captureRoboImage("build/shots/native_chat.png")
    }
}

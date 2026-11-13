# وسيط إشعارات الفارابي (FCM)

يرسل الإشعارات الفورية للأجهزة حتى والتطبيق مغلق. مجاني على Cloudflare Workers.

## الإعداد (مرة واحدة)

1. **حساب الخدمة:** Firebase Console ← مشروع `wiom-fab0d` ← Project settings ← Service accounts ← *Generate new private key*. يُحمَّل ملف JSON. **لا ترفعه على GitHub ولا ترسله في المحادثة.**
2. **Cloudflare:** Workers & Pages ← Create ← Worker ← الصق محتوى `worker.js` ← Deploy.
3. من إعدادات الـWorker ← Variables and Secrets:
   - `SA_JSON` (Secret): الصق محتوى ملف JSON كاملاً.
   - `PUSH_KEY` (Secret): كلمة طويلة عشوائية تختارها (مثلاً 32 حرفاً).
   - `RTDB` (Text): `https://shhb-1ae9e-default-rtdb.firebaseio.com` (أو عنوان قاعدتك إن كان مختلفاً).
4. اربط الوسيط بالتطبيق **بدون أي تحديث**: في Firebase ← Realtime Database (قاعدة المدرسة) أنشئ العقدة `config/push` بالقيمتين `url` (رابط الـWorker، يبدأ بـ https) و`key` (نفس قيمة `PUSH_KEY`). يلتقطها التطبيق تلقائياً خلال دقائق.

## كيف يعمل
- التطبيق يسجّل توكن جهازه تلقائياً في `fcm/<uid>/<الجهاز>` بقاعدة المدرسة.
- عند أي إرسال (رسالة، تحضير، إعلان…) ينادي التطبيق الوسيط بنفس صيغة `/push/send`: `{uids,title,body,tag}`.
- الوسيط يقرأ توكنات المستلمين ويرسل عبر FCM، ويحذف التوكنات الميتة تلقائياً.

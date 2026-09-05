<div align="center">

<img src="assets/vencord-arabic-logo.png" alt="Vencord Arabic" width="168" />

# Vencord Arabic

**نسخة عربية غير رسمية من Vencord مع تعريب مدمج وتحديثات متوافقة مع المشروع الاصلي**

[![DevBuild](https://github.com/ShadowUR0/Vencord/actions/workflows/arabic-release.yml/badge.svg?branch=main)](https://github.com/ShadowUR0/Vencord/actions/workflows/arabic-release.yml)
[![Tests](https://github.com/ShadowUR0/Vencord/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/ShadowUR0/Vencord/actions/workflows/test.yml)
[![Version](https://img.shields.io/github/package-json/v/ShadowUR0/Vencord?label=Vencord)](package.json)
[![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)](LICENSE)

[**تحميل Vencord Arabic**](https://shadowur0.github.io/Vencord/)
&nbsp;•&nbsp;
[**عرض DevBuild**](https://github.com/ShadowUR0/Vencord/releases/tag/devbuild)

</div>

## ما هو Vencord Arabic؟

Vencord Arabic هو fork غير رسمي من [Vencord](https://github.com/Vendicated/Vencord) يهدف الى تقديم تجربة Vencord عربية مع الحفاظ على توافق قريب مع المشروع الاصلي وتحديثاته.

المشروع يحتفظ بمزايا Vencord واضافاته المعتادة، ويضيف اضافة `VencordArabic` الخاصة بنا داخل المصدر لتعريب واجهات واعدادات Vencord.

هذا المشروع غير تابع لـDiscord ولا لفريق Vencord الرسمي، ولا يعني وجوده اي اعتماد او دعم رسمي منهم.

## ماذا يضيف المشروع؟

- تعريب مدمج لواجهات واعدادات Vencord
- دعم اتجاه النص من اليمين الى اليسار للنصوص العربية المترجمة
- تعريب العناوين والتلميحات وحقول الادخال وتسميات الوصول عندما تكون ضمن واجهة Vencord
- قواعد للنصوص الديناميكية مثل الاعداد والرسائل المتغيرة
- بقاء اسماء اضافات Vencord الاصلية بالانجليزية عمدا حتى تبقى قابلة للبحث ومتوافقة مع التوثيق والدعم
- التعريب يعمل محليا داخل Discord ولا يرسل النصوص الى خدمة ترجمة او API خارجي
- مزامنة دورية مع `main` في Vencord الرسمي مع اختبار المشروع قبل اعتماد تحديثات upstream في نسختنا

كود التعريب موجود في:

[`src/userplugins/VencordArabic`](src/userplugins/VencordArabic)

## التثبيت

صفحة التحميل الرسمية لهذا الـfork تعرض النسخة المناسبة لكل منصة:

**https://shadowur0.github.io/Vencord/**

### Windows

الطريقة الموصى بها هي **Vencord Arabic Installer** بواجهة رسومية:

1. حمل [`VencordArabicInstaller.exe`](https://github.com/ShadowUR0/Installer/releases/download/latest/VencordArabicInstaller.exe)
2. اغلق Discord بالكامل
3. اختر نسخة Discord المطلوبة مثل Stable او PTB او Canary، او حدد مسارا مخصصا
4. اضغط `Install`
5. افتح Discord من جديد

توجد ايضا نسخة CLI باسم [`VencordArabicInstallerCli.exe`](https://github.com/ShadowUR0/Installer/releases/download/latest/VencordArabicInstallerCli.exe).

> قد يعرض Windows SmartScreen تحذيرا لان الملفات غير موقعة رقميا حاليا. لا تشغل نسخة GUI كمسؤول Administrator.

### Linux

يتوفر Installer CLI لكل من `x86_64` و`arm64`. الطريقة الاسهل:

```sh
sh -c "$(curl -fsSL https://shadowur0.github.io/Vencord/install.sh)"
```

السكربت يكتشف معمارية الجهاز ويجلب نسخة Vencord Arabic المناسبة تلقائيا.

> Discord المثبت عبر Snap غير مدعوم. استخدم Flatpak او حزمة Discord الرسمية.

### macOS

يتوفر DMG موحد يعمل على **Intel وApple Silicon**:

[`VencordArabicInstaller-macos-universal.dmg`](https://github.com/ShadowUR0/Installer/releases/download/latest/VencordArabicInstaller-macos-universal.dmg)

> نسخة macOS مبنية بتوقيع ad-hoc وليست Apple-notarized حاليا، لذلك قد تحتاج فتحها عبر `Open` من Finder او السماح لها من Privacy & Security.

### Browser

يوفر DevBuild:

- Chromium extension لـChrome وEdge وBrave وOpera وVivaldi وغيرها
- Userscript باسم `Vencord.user.js` لمتصفحات Chromium وFirefox
- Firefox development ZIP للاختبار، مع قيود Firefox على تثبيت الاضافات الخارجية غير الموقعة

كل الخيارات وروابطها موجودة في [صفحة التحميل](https://shadowur0.github.io/Vencord/#browser).

جميع ملفات Installer المنشورة لها SHA-256 داخل [`SHA256SUMS.txt`](https://github.com/ShadowUR0/Installer/releases/download/latest/SHA256SUMS.txt).

يدعم الانستولر ايضا الاصلاح واعادة التثبيت والازالة وOpenAsar والمسارات المخصصة.

## التحديثات والـDevBuild

نتبع اسلوب Vencord الرسمي في توفير **DevBuild متجدد** بدلا من انشاء Release جديد لكل commit.

عند تغير مصدر Vencord Arabic، يبني GitHub Actions نسخة جديدة ويحدث Release باسم `devbuild`. الانستولر يجلب ملفات Vencord Arabic من هذا الـDevBuild مباشرة.

كما توجد مزامنة دورية من Vencord الرسمي الى هذا الـfork. قبل دفع تحديث upstream الى `main` يتم اختبار البناء وTypeScript والـlint وبناء نسخة الويب والتحقق من بنية الاضافات.

> المزامنة احادية الاتجاه: نحن نجلب تحديثات Vencord الى هذا الـfork. لا تقوم اي Automation في المشروع بانشاء Pull Request او ارسال اضافتنا الى Vencord الرسمي.

## البناء من المصدر

يتطلب المشروع Node.js وpnpm حسب المتطلبات الموجودة في `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm build --standalone
```

لبناء نسخة الويب:

```sh
pnpm buildWebStandalone
```

ولتشغيل مجموعة الاختبارات المستخدمة في المشروع:

```sh
pnpm test
```

## المستودعات

- **Vencord Arabic:** هذا المستودع، ويحتوي Vencord مع التعريب الخاص بنا
- **Vencord Arabic Installer:** [`ShadowUR0/Installer`](https://github.com/ShadowUR0/Installer)
- **Vencord upstream:** [`Vendicated/Vencord`](https://github.com/Vendicated/Vencord)

تفاصيل الاختلافات التي نحافظ عليها فوق upstream موثقة في [`MODIFICATIONS.md`](MODIFICATIONS.md).

## الخصوصية

اضافة `VencordArabic` نفسها لا تجمع بيانات ولا تحتوي كودا اصليا ولا تستخدم اتصال شبكة للترجمة. الترجمات مخزنة ضمن ملفات المشروع وتطبق محليا.

هذا لا يغير سلوك الشبكة الخاص بـDiscord او اضافات Vencord الاخرى؛ راجع مصدر كل ميزة او اضافة تستخدمها اذا كان ذلك مهما لك.

## الترخيص والاعتمادات

Vencord Arabic مشتق من Vencord ويستمر تحت ترخيص **GPL-3.0-or-later**. حقوق كود Vencord الاصلي تعود الى Vendicated ومساهمي Vencord، والتعديلات الخاصة بهذا الـfork تعود الى مساهميها بحسب الملفات والتاريخ البرمجي.

Discord علامة تجارية لشركة Discord Inc. ويذكر الاسم فقط لوصف التوافق. هذا المشروع غير تابع لـDiscord ولا معتمدا منها.

## تنبيه حول Discord

تعديلات عميل Discord قد تخالف شروط خدمة Discord. استخدام Vencord Arabic يكون على مسؤولية المستخدم، كما هو الحال مع تعديلات عملاء Discord الاخرى.

---

<sub>Vencord Arabic is an unofficial Arabic-focused fork of Vencord. It is not affiliated with Discord Inc. or the official Vencord project.</sub>


export interface SiteData {
    name: string;
    proxyType: string;
    profileNotes: string;
  }
  
  export const sitesByCategory = [
    {
      category: "🎖️ الفئة A+: المواقع ذات الجودة العالية والدفع المرتفع (Premium/High-Paying)",
      sites: [
        { name: "Pinecone Research", proxyType: "Dedicated Residential IP (مخصص)", profileNotes: "الأعلى جودة. يركز على اختبار المنتجات الجديدة (Product Testing). يتطلب بروفايلاً ذا دخل مرتفع (80K+)، واستجابات متأنية جدًا. يتميز بالدفع الثابت (غالباً $3 لكل استبيان)." },
        { name: "Opinion Outpost", proxyType: "Static Residential IP (ثابت)", profileNotes: "متشدد جدًا. يركز على عادات الشراء والتكنولوجيا. يتطلب بروفايلاً نشطًا على الإنترنت ومستهلكاً حقيقيًا. يجب أن يكون الـ IP ثابتًا لضمان ثبات الجلسة." },
        { name: "LifePoints", proxyType: "Static Residential IP (ثابت)", profileNotes: "يتطلب بروفايلاً عامًا، لكن يجب أن يكون متناسقًا مع الموقع الجغرافي. مهم جدًا: عدم التناقض بين الإجابات في فترة زمنية قصيرة." },
        { name: "Vindale Research", proxyType: "Dedicated or Static Residential", profileNotes: "يركز على البحث المالي والتقني. بروفايل يركز على الاستثمار أو الإدارة المالية في الأسرة (Financial Management)." },
        { name: "Ipsos iSay", proxyType: "Dedicated Residential IP", profileNotes: "منصة عالمية تابعة لشركة أبحاث كبيرة. تتطلب بروكسي ذا سمعة ممتازة لتجنب الكشف. يفضل بروفايل ذو تعليم عالي." },
        { name: "Respondent.io", proxyType: "Dedicated Residential IP (للمقابلات)", profileNotes: "أعلى مستوى دفع. هذا الموقع لا يقدم استبيانات عادية، بل مقابلات (Interviews) وأبحاث مستخدمين تدفع $50 - $150 في الساعة. يجب أن تكون بيانات البروفايل مهنية ومحددة جدًا (مدير تسويق، مطور برامج، طبيب)." },
        { name: "User Interviews", proxyType: "Dedicated Residential IP", profileNotes: "يشبه Respondent.io، ويركز على المقابلات المدفوعة. يتطلب بروفايل مهني عالي الدخل (عادة 100K+) لزيادة فرصة القبول في الأبحاث ذات الدفع الكبير." },
      ]
    },
    {
      category: "🥇 الفئة A: الأنظمة الأمنية العالية والشرسة (High Security - ثابت ومخصص)",
      sites: [
        { name: "SwagBucks", proxyType: "ثابت (Static Residential) أو مخصص (Dedicated)", profileNotes: "متشدد جدًا. يجب أن تكون بيانات البروفايل متناسقة مع الموقع الجغرافي للـ IP وتتجنب أي تضارب." },
        { name: "Survey Junkie", proxyType: "ثابت ومخصص (Dedicated IP)", profileNotes: "متشدد للغاية. يتطلب IP نظيفًا. يجب إنشاء شخصية وهمية ذات دخل مرتفع (عادةً 80K+) ومؤهل علمي جيد." },
        { name: "YouGov", proxyType: "ثابت ومخصص (Dedicated IP)", profileNotes: "يُفضل Mobile IP. التركيز على قضايا سياسية واجتماعية متناسقة مع المنطقة (الولاية). نظام صعب في تصفية الحسابات." },
        { name: "InboxDollars", proxyType: "ثابت (Static Residential)", profileNotes: "يركز على الكود البريدي (Zip Code) وعادات التسوق. يجب مطابقة الولاية والمدينة بدقة." },
        { name: "Toluna", proxyType: "ثابت (Static Residential)", profileNotes: "يركز على العلامات التجارية والاستهلاك. يجب إنشاء بروفايل يركز على القرارات الشرائية الكبيرة." },
        { name: "MyPoints", proxyType: "ثابت (Static Residential)", profileNotes: "متطلب بشكل خاص في فحص تاريخ المتصفح. يجب استخدام متصفح نظيف دائمًا." },
      ]
    },
    {
      category: "🥈 الفئة B: الأمن المتوسط والدوران المحدود (Moderate Security - Rotational/Semi-Static)",
      sites: [
        { name: "Freecash", proxyType: "دوران مع فترة ثبات (Rotating with Sticky Session)", profileNotes: "يركز على العروض والألعاب. البروفايل: محب للألعاب والتقنية (Tech-Savvy)." },
        { name: "Prime Opinion", proxyType: "دوران سكني (Rotating Residential)", profileNotes: "بروفايل عام، لكن يجب الحرص على عدم التناقض بين الاستبيانات المتتالية." },
        { name: "Branded Surveys", proxyType: "ثابت أو دوران (Static / Rotating)", profileNotes: "يفضل بروفايل يركز على الصحة والمال (Health & Finance). يجب الإجابة ببطء." },
        { name: "ySense", proxyType: "ثابت أو دوران مع ثبات الجلسة (Sticky Session)", profileNotes: "يركز على الاستخدام المنتظم. البروفايل: مستخدم إنترنت نشط." },
        { name: "PrizeRebel", proxyType: "ثابت أو دوران مع ثبات الجلسة", profileNotes: "يركز على عمر الحساب. يجب بناء الحساب ببطء." },
        { name: "Superpay.me", proxyType: "دوران سكني (Rotating Residential)", profileNotes: "بروفايل عام، لكن يجب الحذر من عروض الطرف الثالث." },
      ]
    },
    {
      category: "🥉 الفئة C: الأمن المنخفض/المنصات الصغيرة (Lower Security / Newer Sites)",
      sites: [
        { name: "HeyCash / HeyPiggy", proxyType: "دوران سكني (Rotating Residential)", profileNotes: "بروفايل عام، يمكن استهداف دخل متوسط (40K-60K)." },
        { name: "Pawns", proxyType: "بروكسي ثابت أو VPN نظيف", profileNotes: "يركز على مشاركة النطاق الترددي. الأهم هو ثبات الاتصال." },
        { name: "Triaba / Surveyeah", proxyType: "ثابت أو دوران", profileNotes: "بروفايل عام بسيط ومباشر." },
        { name: "appKarma / Earnably / Rewards1 / Reward XP", proxyType: "دوران سريع (Fast Rotating)", profileNotes: "تعتمد على عروض الطرف الثالث. الأمان يعتمد على المُعلِن." },
        // RedMonkey and Madai and Opinion Edge are not in the user's new list, so I'll add them here
        { name: "RedMonkey", proxyType: "دوران سكني (Rotating Residential)", profileNotes: "بروفايل عام." },
        { name: "Madai", proxyType: "ثابت أو دوران", profileNotes: "بروفايل عام." },
        { name: "Opinion Edge", proxyType: "ثابت أو دوران", profileNotes: "بروفايل عام." },
      ]
    }
  ];
  
// Note: TopSurveys was in the original list but not in the categorized one. Adding it to the most likely category.
const categoryC = sitesByCategory.find(c => c.category.startsWith("🥉"));
if(categoryC) {
    categoryC.sites.push({ name: "TopSurveys", proxyType: "ثابت أو دوران", profileNotes: "بروفايل عام." });
}

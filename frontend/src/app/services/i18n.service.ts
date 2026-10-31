import { Injectable, signal } from '@angular/core';

export type Lang = 'en' | 'hi';

type Dict = Record<string, { en: string; hi: string }>;

/**
 * Bilingual (English / Hindi) UI dictionary.
 * Covers navigation, headings, actions and labels across all three portals.
 */
const UI: Dict = {
  // Utility bar & nav
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.student': { en: 'Student Portal', hi: 'छात्र पोर्टल' },
  'nav.college': { en: 'College Admin', hi: 'महाविद्यालय प्रशासक' },
  'nav.aicte': { en: 'AICTE Super Admin', hi: 'AICTE मुख्य प्रशासक' },
  'nav.verify': { en: 'Verify APAAR ID', hi: 'APAAR ID सत्यापित करें' },
  'nav.badge.direct': { en: 'Direct APAAR', hi: 'सीधा APAAR' },
  'nav.badge.intake': { en: 'Intake Audit', hi: 'सीट ऑडिट' },
  'nav.badge.national': { en: 'Pan-India', hi: 'राष्ट्रीय' },
  'nav.login': { en: 'Web Portal Login', hi: 'वेब पोर्टल लॉगिन' },
  'nav.logout': { en: 'Logout', hi: 'लॉग आउट' },
  'util.smarautomation': { en: 'Smart Automation • AICTE Regulation Bureau', hi: 'स्मार्ट ऑटोमेशन • AICTE विनियमन ब्यूरो' },
  'util.screenreader': { en: 'Screen Reader Access', hi: 'स्क्रीन रीडर अभिगम' },

  // Chatbot
  'bot.title': { en: 'AICTE Sahayak Virtual Helpdesk', hi: 'AICTE सहायक वर्चुअल हेल्पडेस्क' },
  'bot.subtitle': { en: 'Government AI Student & Institutional Assistant', hi: 'सरकारी AI छात्र एवं संस्थागत सहायक' },
  'bot.placeholder': { en: 'Ask Sahayak anything...', hi: 'सहायक से कुछ भी पूछें...' },
  'bot.send': { en: 'Send', hi: 'भेजें' },
  'bot.faq.apaar': { en: 'What is APAAR ID?', hi: 'APAAR ID क्या है?' },
  'bot.faq.duplicate': { en: 'Duplicate Detection', hi: 'डुप्लिकेट पहचान' },
  'bot.faq.intake': { en: 'Intake Quotas', hi: 'सीट कोटा' },
  'bot.faq.credits': { en: 'ABC Credits', hi: 'ABC क्रेडिट' },
  'bot.faq.digilocker': { en: 'DigiLocker', hi: 'डिजिलॉकर' },
  'bot.faq.report': { en: 'Reports', hi: 'रिपोर्ट' },

  // Landing
  'landing.badge': { en: 'AICTE • REGULATION BUREAU', hi: 'AICTE • विनियमन ब्यूरो' },
  'landing.title': { en: 'One Nation, One Student ID', hi: 'एक राष्ट्र, एक छात्र ID' },
  'landing.subtitle': { en: 'APAAR Verification Platform for AICTE-Approved Institutions', hi: 'AICTE-मान्यता प्राप्त संस्थानों हेतु APAAR सत्यापन प्लेटफॉर्म' },
  'landing.try': { en: 'Try these sample IDs:', hi: 'नमूना IDs आज़माएँ:' },

  // Student portal
  'student.title': { en: 'Student APAAR ID Verification Portal', hi: 'छात्र APAAR ID सत्यापन पोर्टल' },
  'student.enter': { en: 'Enter 12-Digit APAAR ID / Academic Identifier', hi: '12-अंकीय APAAR ID दर्ज करें' },
  'student.fetch': { en: 'Fetch Student Profile', hi: 'छात्र प्रोफ़ाइल प्राप्त करें' },
  'student.fetching': { en: 'Querying DigiLocker...', hi: 'डिजिलॉकर से जानकारी ली जा रही है...' },
  'student.consent': { en: 'Demo acknowledgement', hi: 'डेमो स्वीकृति' },
  'student.consentText': { en: 'I understand this demonstration is not connected to DigiLocker and I will not enter real student data.', hi: 'मैं समझता/समझती हूँ कि यह डेमो DigiLocker से जुड़ा नहीं है और मैं वास्तविक छात्र डेटा दर्ज नहीं करूँगा/करूँगी।' },
  'student.pass': { en: 'Official Verifiable Academic Credential Pass', hi: 'आधिकारिक सत्यापित शैक्षणिक क्रेडेंशियल पास' },
  'student.print': { en: 'Print / Save as PDF', hi: 'प्रिंट / PDF सहेजें' },
  'student.timeline': { en: 'Verification Lifecycle Timeline', hi: 'सत्यापन प्रक्रिया टाइमलाइन' },

  // College portal
  'college.title': { en: 'College Admin Portal', hi: 'महाविद्यालय प्रशासक पोर्टल' },
  'college.signin': { en: 'Institutional Sign In', hi: 'संस्थागत साइन इन' },
  'college.register': { en: 'Register Institution', hi: 'संस्थान पंजीकृत करें' },
  'college.email': { en: 'INSTITUTIONAL EMAIL', hi: 'संस्थागत ईमेल' },
  'college.password': { en: 'PASSKEY / PASSWORD', hi: 'पासकी / पासवर्ड' },
  'college.signInBtn': { en: 'Sign In to Dashboard', hi: 'डैशबोर्ड में साइन इन करें' },
  'college.upload': { en: 'Bulk Upload CSV', hi: 'बल्क CSV अपलोड' },
  'college.registry': { en: 'Institutional Student Registry', hi: 'संस्थागत छात्र रजिस्टर' },
  'college.search': { en: 'Search by student name or 12-digit APAAR ID...', hi: 'छात्र के नाम या 12-अंकीय APAAR ID से खोजें...' },
  'college.total': { en: 'TOTAL ENROLLED', hi: 'कुल नामांकित' },
  'college.verified': { en: 'VERIFIED RECORDS', hi: 'सत्यापित रिकॉर्ड' },
  'college.pending': { en: 'PENDING VERIFICATION', hi: 'सत्यापन लंबित' },
  'college.duplicates': { en: 'DUPLICATE ENROLMENTS', hi: 'डुप्लिकेट नामांकन' },

  // AICTE portal
  'aicte.title': { en: 'AICTE Central Super Admin Dashboard', hi: 'AICTE केंद्रीय मुख्य प्रशासक डैशबोर्ड' },
  'aicte.adminLogin': { en: 'AICTE Administrator Sign In', hi: 'AICTE प्रशासक साइन इन' },
  'aicte.exportExcel': { en: 'Export National Compliance Report (.xlsx)', hi: 'राष्ट्रीय अनुपालन रिपोर्ट (.xlsx) निर्यात करें' },
  'aicte.exportPdf': { en: 'Export PDF Report', hi: 'PDF रिपोर्ट निर्यात करें' },
  'aicte.kpi.institutions': { en: 'APPROVED INSTITUTIONS', hi: 'मान्यता प्राप्त संस्थान' },
  'aicte.kpi.enrolled': { en: 'NATIONAL ENROLMENTS', hi: 'राष्ट्रीय नामांकन' },
  'aicte.kpi.verified': { en: 'APAAR VERIFIED RECORDS', hi: 'APAAR सत्यापित रिकॉर्ड' },
  'aicte.kpi.duplicates': { en: 'DUPLICATES INTERCEPTED', hi: 'रोके गए डुप्लिकेट' },
  'aicte.chart.title': { en: 'State-Wise APAAR Verification Progress', hi: 'राज्यवार APAAR सत्यापन प्रगति' },
  'aicte.table.title': { en: 'College-Wise Intake Compliance Master Table', hi: 'महाविद्यालयवार सीट अनुपालन मुख्य तालिका' },
  'aicte.alerts': { en: 'Duplicate Anomaly Alerts', hi: 'डुप्लिकेट असंगति चेतावनी' },
  'aicte.analytics': { en: 'Advanced Analytics', hi: 'उन्नत विश्लेषण' },
  'aicte.analyticsSub': { en: 'Aggregate analyses computed from the national registry', hi: 'राष्ट्रीय रजिस्टर के समेकित विश्लेषण' },
  'aicte.funnel': { en: 'Verification Funnel', hi: 'सत्यापन फ़नल' },
  'aicte.categoryMix': { en: 'Admission Category Mix', hi: 'प्रवेश श्रेणी संरचना' },
  'aicte.courseDist': { en: 'Course-wise Distribution', hi: 'पाठ्यक्रम-वार वितरण' },
  'aicte.yearDist': { en: 'Year-wise Enrolment', hi: 'वर्ष-वार नामांकन' },
  'aicte.stateStack': { en: 'State-wise Verification Stack', hi: 'राज्य-वार सत्यापन' },
  'aicte.quota': { en: 'Quota Utilisation', hi: 'कोटा उपयोग' },
  'aicte.creditsProg': { en: 'ABC Credits Progression', hi: 'ABC क्रेडिट प्रगति' },
  'aicte.overIntakeWatch': { en: 'Intake Compliance Watchlist', hi: 'इंटेक अनुपालन सूची' },
  'aicte.ledger': { en: 'Immutable System Audit Ledger', hi: 'अपरिवर्तनीय सिस्टम ऑडिट लेजर' },

  // Footer
  'footer.standards': { en: 'Regulatory Standards', hi: 'विनियामक मानक' },
  'footer.portals': { en: 'Platform Portals', hi: 'प्लेटफॉर्म पोर्टल' },
};

/**
 * Bilingual answers for the AICTE Sahayak assistant.
 */
export const BOT_FAQ: Array<{ keywords: string[]; en: string; hi: string }> = [
  {
    keywords: ['apaar', 'what is apaar', 'id'],
    en: 'APAAR ID (Automated Permanent Academic Account Registry) is a 12-digit lifelong academic identifier under NEP 2020. It links your DigiLocker documents, Academic Bank of Credits (ABC) balance and AICTE approval records into one verifiable identity.',
    hi: 'APAAR ID (स्वचालित स्थायी शैक्षणिक खाता रजिस्ट्री) NEP 2020 के अंतर्गत एक 12-अंकीय आजीवन शैक्षणिक पहचानकर्ता है। यह आपके डिजिलॉकर दस्तावेज़, ABC क्रेडिट और AICTE मान्यता रिकॉर्ड को एक सत्यापित पहचान में जोड़ता है।'
  },
  {
    keywords: ['duplicate', 'conflict', 'two college', 'double'],
    en: 'When the same APAAR ID shows an active seat at two institutions, the risk engine flags the record immediately. The college admin can resolve it (Verify or Reject), and the national dashboard tracks every conflict until closure.',
    hi: 'जब एक ही APAAR ID दो संस्थानों में सक्रिय सीट दिखाती है, तो रिस्क इंजन तुरंत रिकॉर्ड को चिह्नित करता है। महाविद्यालय प्रशासक उसे हल कर सकता है (Verify या Reject), और राष्ट्रीय डैशबोर्ड हर विवाद पर नज़र रखता है।'
  },
  {
    keywords: ['intake', 'quota', 'sanctioned', 'seats', 'over'],
    en: 'Colleges cannot admit students beyond their Sanctioned Approved Intake, except within the supernumerary TFW quota and the NRI/Foreign National quota. Any excess shows up instantly as an intake anomaly on both the college and national dashboards.',
    hi: 'महाविद्यालय अधिकृत सीट संख्या से अधिक प्रवेश नहीं दे सकते, सिवाय अतिरिक्त TFW कोटा और NRI/विदेशी कोटा के। कोई भी अधिकता तुरंत महाविद्यालय और राष्ट्रीय डैशबोर्ड पर दिखाई देती है।'
  },
  {
    keywords: ['credit', 'abc', 'bank'],
    en: 'ABC (Academic Bank of Credits) stores the credits you earn each semester. One year of study typically adds about 30 credits. Your ABC balance is shown on your verification pass and college registry.',
    hi: 'ABC (अकादमिक बैंक ऑफ क्रेडिट्स) आपके प्रत्येक सेमेस्टर के क्रेडिट संग्रहित करता है। एक वर्ष की पढ़ाई में लगभग 30 क्रेडिट जुड़ते हैं। आपका ABC बैलेंस सत्यापन पास और महाविद्यालय रजिस्टर में दिखता है।'
  },
  {
    keywords: ['digilocker', 'nad', 'depository', 'locker'],
    en: 'DigiLocker is the Government of India digital document wallet. The National Academic Depository (NAD) stores your marksheets and degrees there, so verification happens in seconds without physical paperwork.',
    hi: 'डिजिलॉकर भारत सरकार का डिजिटल दस्तावेज़ वॉलेट है। राष्ट्रीय शैक्षणिक भंडार (NAD) आपके मार्कशीट और डिग्री यहीं सुरक्षित रखता है, जिससे सत्यापन बिना कागज़ी कार्यवाही के सेकंडों में हो जाता है।'
  },
  {
    keywords: ['report', 'excel', 'download', 'export', 'xlsx'],
    en: 'The Super Admin portal exports an official multi-sheet Excel report: a national summary, college-wise compliance, and the complete student registry with photographs — generated live from the database.',
    hi: 'सुपर एडमिन पोर्टल से आधिकारिक बहु-पत्रक Excel रिपोर्ट निर्यात होती है: राष्ट्रीय सारांश, महाविद्यालयवार अनुपालन और फ़ोटो सहित संपूर्ण छात्र रजिस्टर — सीधे डेटाबेस से तैयार।'
  },
  {
    keywords: ['verify', 'status', 'pending', 'approval'],
    en: 'Verification status lifecycle: Pending -> Verified (seat approved) or Rejected. College admins act on pending records from the Institutional Student Registry; students see the result instantly on their credential pass.',
    hi: 'सत्यापन की प्रक्रिया: लंबित -> सत्यापित (सीट स्वीकृत) या अस्वीकृत। महाविद्यालय प्रशासक रजिस्टर से लंबित रिकॉर्ड पर कार्रवाई करते हैं; छात्रों को परिणाम तुरंत उनके पास पर दिखता है।'
  },
  {
    keywords: ['dpdp', 'privacy', 'consent', 'data safe', 'security'],
    en: 'This demonstration uses sample records. DigiLocker identity checks and production-grade consent verification are not connected.',
    hi: 'इस डेमो में नमूना रिकॉर्ड हैं। DigiLocker पहचान जाँच और उत्पादन-स्तर की सहमति सत्यापन सुविधा जुड़ी नहीं है।'
  },
  {
    keywords: ['register', 'college', 'institution', 'signup', 'new'],
    en: 'A new institution can self-register from the College Admin portal. Registration creates a real portal with zeroed statistics; the college then onboards students via bulk CSV upload and appears on the national dashboard.',
    hi: 'नया संस्थान महाविद्यालय प्रशासक पोर्टल से स्वयं पंजीकरण करा सकता है। पंजीकरण से शून्य आँकड़ों वाला वास्तविक पोर्टल बनता है; फिर महाविद्यालय CSV अपलोड द्वारा छात्र जोड़ता है और राष्ट्रीय डैशबोर्ड पर दिखाई देता है।'
  },
  {
    keywords: ['google', 'sign in', 'login'],
    en: 'Any Google account linked to a registered institution can use "Continue with Google". Institutional email + passkey sign-in is always available as an alternative.',
    hi: 'पंजीकृत संस्थान से जुड़ा कोई भी Google खाता "Continue with Google" का उपयोग कर सकता है। संस्थागत ईमेल + पासकी साइन इन हमेशा उपलब्ध विकल्प है।'
  },
  {
    keywords: ['tfw', 'nri', 'supernumerary', 'foreign'],
    en: 'TFW (Tuition Fee Waiver) seats are supernumerary — additional to sanctioned intake — for economically weaker students. NRI and Foreign National seats are separate statutory quotas tracked in every compliance report.',
    hi: 'TFW (ट्यूशन फीस वेवर) सीटें अतिरिक्त होती हैं — अधिकृत सीटों से अलग — आर्थिक रूप से कमजोर छात्रों के लिए। NRI और विदेशी छात्र सीटें अलग वैधानिक कोटा हैं जो हर अनुपालन रिपोर्ट में दर्ज होती हैं।'
  },
  {
    keywords: ['hello', 'hi', 'namaste', 'help', 'sahayak'],
    en: 'Namaste! I am AICTE Sahayak. I can explain APAAR ID, ABC credits, DigiLocker verification, intake quotas, duplicate handling, registration and reports. Ask me anything!',
    hi: 'नमस्ते! मैं AICTE सहायक हूँ। मैं APAAR ID, ABC क्रेडिट, डिजिलॉकर सत्यापन, सीट कोटा, डुप्लिकेट हैंडलिंग, पंजीकरण और रिपोर्ट समझा सकता हूँ। कुछ भी पूछें!'
  },
];

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly LANG_KEY = 'apaar_lang';

  readonly lang = signal<Lang>(this.restore());

  setLang(lang: Lang) {
    this.lang.set(lang);
    try {
      localStorage.setItem(this.LANG_KEY, lang);
    } catch { /* storage unavailable */ }
  }

  toggle() {
    this.setLang(this.lang() === 'en' ? 'hi' : 'en');
  }

  get isHindi(): boolean {
    return this.lang() === 'hi';
  }

  /** Translation lookup with graceful English fallback. */
  t(key: string): string {
    const entry = UI[key];
    if (!entry) return key;
    return this.lang() === 'hi' ? entry.hi : entry.en;
  }

  private restore(): Lang {
    try {
      const saved = localStorage.getItem(this.LANG_KEY);
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  }
}

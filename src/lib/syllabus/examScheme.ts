// RVUNL व डिस्कॉम (JVVNL, AVVNL, JdVVNL) — जूनियर असिस्टेंट / कमर्शियल असिस्टेंट-II
// Source: RVUN का आधिकारिक Advertisement No. RVUN/Rectt.-2026-27/03, दिनांक 04 अगस्त 2026
// (Chief Personnel Officer द्वारा digitally signed नोटिफिकेशन से सीधे लिया गया)

export interface ExamSchemeSection {
  id: string;
  title: string;
  points: string[];
}

export interface SubjectMarksRow {
  subject: string;
  questions: number;
  marks: number;
}

export const EXAM_SCHEME_META = {
  board: "RVUNL / डिस्कॉम (JVVNL, AVVNL, JdVVNL)",
  examName: "जूनियर असिस्टेंट / कमर्शियल असिस्टेंट-II भर्ती परीक्षा",
  totalQuestions: 140,
  totalMarks: 200,
  duration: "02:00 घंटे",
  notes: [
    "⚠️ ज़रूरी सुधार: आधिकारिक नोटिफिकेशन (04 अगस्त 2026) के अनुसार Phase-I असल में DO STAGE में होता है — Stage-1 'Pre-examination' (सिर्फ स्क्रीनिंग के लिए, वेटेज नहीं मिलता) और Stage-2 'Main-examination'। दोनों का सिलेबस same है (Reasoning, गणित, GK & Science, हिंदी, English)।",
    "फाइनल मेरिट में सिर्फ Main-examination (40%) और Phase-II टाइपिंग टेस्ट (60%) के अंक जुड़ते हैं — Pre-examination सिर्फ शॉर्टलिस्टिंग के लिए है (करीब वेकेंसी का 10 गुना कैंडिडेट्स आगे बढ़ते हैं)।",
    "नेगेटिव मार्किंग: Pre-examination में कोई नेगेटिव मार्किंग नहीं है। Main-examination में हर गलत उत्तर पर नेगेटिव मार्किंग है (सटीक प्रतिशत नोटिफिकेशन में नहीं दिया — कुछ स्रोतों के अनुसार 0.25, कन्फर्म कर लें)।",
    "न्यूनतम पासिंग मार्क्स: सामान्य (UR) — 30% | SC/ST/BC/MBC/EWS/भूतपूर्व सैनिक/PwBD — 20%",
    "कोई इंटरव्यू नहीं होता। प्रश्न पत्र (Hindi General व English General को छोड़कर) द्विभाषी (Hindi + English) होता है।",
  ],
};

// ⚠️ Ye subject-wise marks split third-party exam-prep saaइट्स (toppersexam.com) से लिया गया है —
// official notification में questions/marks ka exact subject-wise split nahi diya gaya, sirf
// total 140 questions/200 marks confirm hai. Isko indicative maano, exam se pehle recheck kar lena.
export const SUBJECT_MARKS_DISTRIBUTION: SubjectMarksRow[] = [
  { subject: "रीजनिंग और मानसिक योग्यता", questions: 20, marks: 20 },
  { subject: "सामान्य ज्ञान — राजस्थान विशेष", questions: 45, marks: 90 },
  { subject: "सामान्य ज्ञान — विश्व, भारत व दैनिक विज्ञान", questions: 15, marks: 30 },
  { subject: "गणित", questions: 20, marks: 20 },
  { subject: "सामान्य हिंदी", questions: 20, marks: 20 },
  { subject: "General English", questions: 20, marks: 20 },
];

export const EXAM_SCHEME_SECTIONS: ExamSchemeSection[] = [
  {
    id: "reasoning",
    title: "रीजनिंग और मानसिक योग्यता (Reasoning & Mental Ability)",
    points: [
      "आधिकारिक नोटिफिकेशन में दिए topics: Analytical Reasoning, Number Series, Letter Series, Odd Man Out, Coding-Decoding, Shapes and Mirror Images, Clocks, आदि (ये एक brief outline है, exhaustive नहीं)",
      "अतिरिक्त सामान्यतः पूछे जाने वाले टॉपिक: ब्लड रिलेशन, दिशा ज्ञान परीक्षण, कैलेंडर, पहेलियां, बैठक व्यवस्था",
    ],
  },
  {
    id: "maths",
    title: "गणित (Mathematics) — कक्षा 10वीं (Class-X) स्तर",
    points: [
      "आधिकारिक नोटिफिकेशन सिर्फ इतना कहता है: 'Mathematics (Class-X level)' — विस्तृत टॉपिक लिस्ट अलग से नहीं दी गई",
      "10वीं स्तर के सामान्य टॉपिक: संख्या पद्धति, प्रतिशत, अनुपात-समानुपात, औसत, ब्याज, लाभ-हानि, समय-कार्य, समय-दूरी आदि की तैयारी करें",
    ],
  },
  {
    id: "gk-science",
    title: "सामान्य ज्ञान और दैनिक विज्ञान (राजस्थान पर विशेष बल)",
    points: [
      "आधिकारिक नोटिफिकेशन के topics: समसामयिक घटनाएं (राजस्थान राज्य सहित), राष्ट्रीय व अंतरराष्ट्रीय महत्व, समसामयिक व्यक्ति व स्थान, खेल एवं खेलकूद, भारतीय इतिहास, नागरिक शास्त्र (Civics), भूगोल, विज्ञान, भारतीय राजव्यवस्था (Indian Polity) — सभी राजस्थान के विशेष संदर्भ के साथ",
    ],
  },
  {
    id: "hindi",
    title: "सामान्य हिंदी — कक्षा 10वीं (Class-X) स्तर",
    points: [
      "आधिकारिक नोटिफिकेशन: 'Hindi Grammar and language (Class-X level)'",
      "सामान्य टॉपिक: संधि-समास, उपसर्ग-प्रत्यय, पर्यायवाची-विलोम, वाक्य/शब्द शुद्धि, मुहावरे-लोकोक्तियां, अपठित बोध",
    ],
  },
  {
    id: "english",
    title: "General English — Class-X Level",
    points: [
      "Official notification: 'English Grammar and language (Class-X level)'",
      "Common topics: Tenses, Voice, Narration, Articles, Prepositions, Synonyms-Antonyms, One Word Substitution, Comprehension",
    ],
  },
  {
    id: "typing-test",
    title: "Phase-II: Type Writing Test — फाइनल मेरिट में 60% वेटेज",
    points: [
      "Hindi Typing — Speed Test: 10 मिनट (25 अंक)",
      "Hindi Typing — Efficiency Test: 10 मिनट (25 अंक)",
      "English Typing — Speed Test: 10 मिनट (25 अंक)",
      "English Typing — Efficiency Test: 10 मिनट (25 अंक)",
      "PwBD (बेंचमार्क दिव्यांग) उम्मीदवारों को Phase-II के बजाय Main-examination का औसत अंक दिया जाता है",
    ],
  },
];

// RVUNL (राजस्थान राज्य विद्युत उत्पादन निगम लिमिटेड) व डिस्कॉम (JVVNL, AVVNL, JdVVNL)
// जूनियर असिस्टेंट / कमर्शियल असिस्टेंट-II — पूर्ण आधिकारिक पाठ्यक्रम
// Hierarchy: Subject -> Unit -> Topic

export type Difficulty = "आसान" | "मध्यम" | "कठिन";

export interface SubTopic { id: string; title: string; }
export interface Topic {
  id: string;
  title: string;
  estimatedMinutes: number;
  subTopics?: SubTopic[];
}
export interface Unit { id: string; title: string; topics: Topic[]; }
export interface Subject {
  id: string;
  name: string;
  hindiName: string;
  icon: string;
  color: string;
  units: Unit[];
}

const t = (id: string, title: string, minutes = 45): Topic => ({ id, title, estimatedMinutes: minutes });

export const SYLLABUS: Subject[] = [
  {
    id: "reasoning", name: "Reasoning & Mental Ability", hindiName: "रीजनिंग और मानसिक योग्यता", icon: "Brain", color: "primary",
    units: [
      { id: "reasoning-verbal", title: "वर्बल रीजनिंग", topics: [
        t("reasoning-1", "नंबर सीरीज (Number Series)"),
        t("reasoning-2", "लेटर सीरीज (Letter Series)"),
        t("reasoning-3", "विषम छांटना (Odd Man Out)"),
        t("reasoning-4", "कोडिंग-डिकोडिंग (Coding-Decoding)"),
        t("reasoning-5", "ब्लड रिलेशन (Blood Relations)"),
        t("reasoning-6", "दिशा ज्ञान परीक्षण (Direction Sense Test)"),
        t("reasoning-7", "वर्गीकरण (Classification)"),
        t("reasoning-8", "तार्किक क्रम (Logical Sequence of Words)"),
      ]},
      { id: "reasoning-nonverbal", title: "नॉन-वर्बल रीजनिंग", topics: [
        t("reasoning-9", "आकृतियां और दर्पण प्रतिबिंब (Shapes and Mirror Images)"),
        t("reasoning-10", "घड़ियां (Clocks)"),
        t("reasoning-11", "कैलेंडर (Calendar)"),
        t("reasoning-12", "पहेलियां (Puzzles)"),
        t("reasoning-13", "बैठक व्यवस्था (Sitting Arrangement)"),
      ]},
    ],
  },
  {
    id: "maths", name: "Mathematics (Class 10th Level)", hindiName: "गणित (कक्षा 10वीं स्तर)", icon: "Calculator", color: "accent",
    units: [
      { id: "maths-number", title: "संख्या पद्धति व अंकगणित", topics: [
        t("maths-1", "संख्या पद्धति (Number System)"),
        t("maths-2", "दशमलव और भिन्न (Decimals and Fractions)"),
        t("maths-3", "प्रतिशत (Percentage)"),
        t("maths-4", "अनुपात और समानुपात (Ratio & Proportion)"),
        t("maths-5", "औसत (Average)"),
      ]},
      { id: "maths-commercial", title: "व्यावसायिक गणित", topics: [
        t("maths-6", "ब्याज — साधारण एवं चक्रवृद्धि (Simple & Compound Interest)"),
        t("maths-7", "लाभ-हानि और बट्टा (Profit & Loss, Discount)"),
        t("maths-8", "समय और कार्य (Time & Work)"),
        t("maths-9", "समय और दूरी (Time & Distance)"),
        t("maths-10", "यूनिटरी मेथड (Unitary Method)"),
        t("maths-11", "मिश्रण एवं साझेदारी (Mixture & Alligation, Partnership)"),
        t("maths-12", "क्षेत्रमिति व सरलीकरण (Mensuration & Simplification)"),
      ]},
    ],
  },
  {
    id: "gk-science", name: "General Knowledge & Everyday Science", hindiName: "सामान्य ज्ञान और दैनिक विज्ञान", icon: "Globe2", color: "primary",
    units: [
      { id: "gk-current", title: "समसामयिक घटनाएं", topics: [
        t("gk-1", "राजस्थान राज्य की वर्तमान समसामयिक घटनाएं"),
        t("gk-2", "राष्ट्रीय महत्व की वर्तमान घटनाएं"),
        t("gk-3", "अंतरराष्ट्रीय महत्व की वर्तमान घटनाएं"),
      ]},
      { id: "gk-geo", title: "भूगोल और प्राकृतिक संसाधन (राजस्थान संदर्भ)", topics: [
        t("gk-4", "राजस्थान का भौतिक भूगोल"),
        t("gk-5", "राजस्थान के प्राकृतिक संसाधन"),
        t("gk-6", "राजस्थान की जलवायु व अपवाह तंत्र"),
      ]},
      { id: "gk-eco", title: "कृषि और आर्थिक विकास (राजस्थान संदर्भ)", topics: [
        t("gk-7", "राजस्थान की प्रमुख फसलें व कृषि व्यवस्था"),
        t("gk-8", "राजस्थान का आर्थिक विकास व प्रमुख योजनाएं"),
      ]},
      { id: "gk-history", title: "इतिहास और संस्कृति (राजस्थान संदर्भ)", topics: [
        t("gk-9", "राजस्थान के प्रमुख किले व महल"),
        t("gk-10", "राजस्थान के लोक देवता व लोक संस्कृति"),
        t("gk-11", "राजस्थान के प्रमुख राजवंश"),
        t("gk-12", "राजस्थान की कला — चित्रकला, हस्तशिल्प"),
      ]},
      { id: "gk-polity", title: "भारतीय राजव्यवस्था, खेल व समसामयिकी", topics: [
        t("gk-16", "भारतीय राजव्यवस्था एवं नागरिक शास्त्र (Indian Polity & Civics)"),
        t("gk-17", "समसामयिक व्यक्ति और स्थान (Persons & Places in News)"),
        t("gk-18", "खेल एवं खेलकूद (Games & Sports)"),
      ]},
      { id: "gk-science-unit", title: "दैनिक विज्ञान (कक्षा 10वीं स्तर)", topics: [
        t("gk-13", "भौतिक विज्ञान के बुनियादी सिद्धांत"),
        t("gk-14", "रसायन विज्ञान के बुनियादी सिद्धांत"),
        t("gk-15", "जीव विज्ञान के बुनियादी सिद्धांत"),
      ]},
    ],
  },
  {
    id: "hindi", name: "General Hindi (Class 10th Level)", hindiName: "सामान्य हिंदी (कक्षा 10वीं स्तर)", icon: "BookOpen", color: "accent",
    units: [
      { id: "hindi-grammar", title: "हिंदी व्याकरण", topics: [
        t("hindi-1", "संधि और संधि विच्छेद"),
        t("hindi-2", "समास"),
        t("hindi-3", "उपसर्ग और प्रत्यय"),
        t("hindi-4", "पर्यायवाची और विलोम शब्द"),
        t("hindi-5", "अनेकार्थक शब्द"),
        t("hindi-6", "शब्द युग्म और शब्द शुद्धि"),
        t("hindi-7", "वाक्य शुद्धि"),
      ]},
      { id: "hindi-usage", title: "मुहावरे, लोकोक्तियां व शब्दावली", topics: [
        t("hindi-8", "मुहावरे और लोकोक्तियां"),
        t("hindi-9", "पारिभाषिक शब्दावली (प्रशासनिक शब्दों के हिंदी अर्थ)"),
        t("hindi-10", "त्रुटि पहचान (Error Detection)"),
        t("hindi-11", "रिक्त स्थानों की पूर्ति"),
        t("hindi-12", "गद्यांश (अपठित बोध / Comprehension)"),
      ]},
    ],
  },
  {
    id: "english", name: "General English (Class 10th Level)", hindiName: "सामान्य अंग्रेजी (कक्षा 10वीं स्तर)", icon: "Languages", color: "primary",
    units: [
      { id: "english-grammar", title: "Grammar", topics: [
        t("english-1", "Tenses / Sequence of Tenses"),
        t("english-2", "Voice: Active and Passive"),
        t("english-3", "Narration: Direct and Indirect"),
        t("english-4", "Use of Articles and Determiners"),
        t("english-5", "Use of Prepositions"),
      ]},
      { id: "english-vocab", title: "Vocabulary & Comprehension", topics: [
        t("english-6", "Translation: Hindi to English and vice-versa"),
        t("english-7", "Glossary of Official/Technical Terms (with Hindi version)"),
        t("english-8", "Synonyms and Antonyms"),
        t("english-9", "One Word Substitution"),
        t("english-10", "Comprehension of a Given Passage"),
        t("english-11", "Idioms and Phrases"),
        t("english-12", "Error Detection / Sentence Improvement"),
        t("english-13", "Cloze Test / Fill in the Blanks"),
      ]},
    ],
  },
];

export interface TopicRef { subject: Subject; unit: Unit; topic: Topic; }

export function getAllTopics(): TopicRef[] {
  const out: TopicRef[] = [];
  for (const subject of SYLLABUS) {
    for (const unit of subject.units) {
      for (const topic of unit.topics) {
        out.push({ subject, unit, topic });
      }
    }
  }
  return out;
}

export function findSubject(id: string) { return SYLLABUS.find((s) => s.id === id); }
export function findUnit(subjectId: string, unitId: string) {
  return findSubject(subjectId)?.units.find((u) => u.id === unitId);
}
export function findTopic(topicId: string): TopicRef | undefined {
  return getAllTopics().find((r) => r.topic.id === topicId);
}

export const HINDI_QUOTES = [
  "सफलता उन्हीं को मिलती है जो कड़ी मेहनत करते हैं।",
  "आज का अभ्यास कल की सफलता है।",
  "छोटे-छोटे कदम भी बड़ी मंज़िल तक ले जाते हैं।",
  "मेहनत का कोई विकल्प नहीं है।",
  "हर दिन एक नई शुरुआत है — आगे बढ़ो।",
  "जो पढ़ता है वही आगे बढ़ता है।",
  "कठिन परिश्रम ही सबसे बड़ा शॉर्टकट है।",
  "अपने सपनों को कभी छोटा मत समझो।",
  "आत्मविश्वास ही सफलता की कुंजी है।",
  "जीत उसी की होती है जो हार नहीं मानता।",
  "पढ़ाई वो हथियार है जिससे आप दुनिया बदल सकते हैं।",
  "आज की मेहनत, कल का सुनहरा भविष्य।",
];

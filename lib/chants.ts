export type ChantLevel = 'basic' | 'intermediate' | 'advanced';

export interface Chant {
  id: string;
  deityId: string;
  level: ChantLevel;
  duration: number; // in seconds
  text: string;
  transliteration: string;
  meaning: string;
  pronunciation: string[];
  requiredAmount: number; // minimum offering amount to unlock
}

export const DEITY_CHANTS: Record<string, Chant[]> = {
  ganesha: [
    {
      id: 'ganesha_basic',
      deityId: 'ganesha',
      level: 'basic',
      duration: 30,
      text: 'ॐ गणपतये नमः',
      transliteration: 'Om Ganapataye Namaha',
      meaning: 'Salutations to Lord Ganesha, the remover of obstacles',
      pronunciation: ['Om', 'Ga-na-pa-ta-ye', 'Na-ma-ha'],
      requiredAmount: 0
    },
    {
      id: 'ganesha_intermediate',
      deityId: 'ganesha',
      level: 'intermediate',
      duration: 60,
      text: 'ॐ गं गणपतये नमः। ॐ गणेश्याय नमः।',
      transliteration: 'Om Gam Ganapataye Namaha, Om Ganeshaya Namaha',
      meaning: 'Sacred seed mantra for Ganesha with salutations',
      pronunciation: ['Om', 'Gam', 'Ga-na-pa-ta-ye', 'Na-ma-ha', 'Om', 'Ga-ne-sha-ya', 'Na-ma-ha'],
      requiredAmount: 21
    },
    {
      id: 'ganesha_advanced',
      deityId: 'ganesha',
      level: 'advanced',
      duration: 120,
      text: 'ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा।।',
      transliteration: 'Om Vakratunda Mahakaya Suryakoti Samaprabha, Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada',
      meaning: 'O Lord with curved trunk and massive body, whose brilliance equals millions of suns, remove all obstacles from my endeavors always',
      pronunciation: ['Om', 'Vak-ra-tun-da', 'Ma-ha-ka-ya', 'Sur-ya-ko-ti', 'Sa-ma-pra-bha', 'Nir-vigh-nam', 'Ku-ru', 'Me', 'De-va', 'Sar-va-kar-ye-shu', 'Sar-va-da'],
      requiredAmount: 51
    }
  ],
  shiva: [
    {
      id: 'shiva_basic',
      deityId: 'shiva',
      level: 'basic',
      duration: 30,
      text: 'ॐ नमः शिवाय',
      transliteration: 'Om Namah Shivaya',
      meaning: 'Salutations to Lord Shiva',
      pronunciation: ['Om', 'Na-mah', 'Shi-va-ya'],
      requiredAmount: 0
    },
    {
      id: 'shiva_intermediate',
      deityId: 'shiva',
      level: 'intermediate',
      duration: 60,
      text: 'ॐ नमः शिवाय। ॐ हर हर महादेव।',
      transliteration: 'Om Namah Shivaya, Om Har Har Mahadev',
      meaning: 'Salutations to Shiva, the great divine destroyer of evil',
      pronunciation: ['Om', 'Na-mah', 'Shi-va-ya', 'Om', 'Har', 'Har', 'Ma-ha-dev'],
      requiredAmount: 21
    },
    {
      id: 'shiva_advanced',
      deityId: 'shiva',
      level: 'advanced',
      duration: 120,
      text: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्।।',
      transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
      meaning: 'We worship the three-eyed Lord Shiva who nourishes and increases our spiritual growth. May he liberate us from death for the sake of immortality',
      pronunciation: ['Om', 'Try-am-ba-kam', 'Ya-ja-ma-he', 'Su-gan-dhim', 'Push-ti-var-dha-nam', 'Ur-va-ru-ka-mi-va', 'Ban-dha-nan', 'Mrit-yor', 'Muk-shi-ya', 'Ma-am-ri-tat'],
      requiredAmount: 51
    }
  ],
  krishna: [
    {
      id: 'krishna_basic',
      deityId: 'krishna',
      level: 'basic',
      duration: 30,
      text: 'ॐ नमो भगवते वासुदेवाय',
      transliteration: 'Om Namo Bhagavate Vasudevaya',
      meaning: 'Salutations to the divine Lord Krishna',
      pronunciation: ['Om', 'Na-mo', 'Bha-ga-va-te', 'Va-su-de-va-ya'],
      requiredAmount: 0
    },
    {
      id: 'krishna_intermediate',
      deityId: 'krishna',
      level: 'intermediate',
      duration: 60,
      text: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे। हरे राम हरे राम राम राम हरे हरे।।',
      transliteration: 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare, Hare Rama Hare Rama Rama Rama Hare Hare',
      meaning: 'The great mantra for liberation, calling upon Krishna and Rama',
      pronunciation: ['Ha-re', 'Krish-na', 'Ha-re', 'Krish-na', 'Krish-na', 'Krish-na', 'Ha-re', 'Ha-re', 'Ha-re', 'Ra-ma', 'Ha-re', 'Ra-ma', 'Ra-ma', 'Ra-ma', 'Ha-re', 'Ha-re'],
      requiredAmount: 21
    },
    {
      id: 'krishna_advanced',
      deityId: 'krishna',
      level: 'advanced',
      duration: 120,
      text: 'क्लीं कृष्णाय गोविन्दाय गोपीजन वल्लभाय स्वाहा। ॐ नमो भगवते वासुदेवाय नमः।',
      transliteration: 'Kleem Krishnaya Govindaya Gopijana Vallabhaya Swaha, Om Namo Bhagavate Vasudevaya Namaha',
      meaning: 'Sacred seed mantra to Krishna, the protector of cows and beloved of the gopis',
      pronunciation: ['Kleem', 'Krish-na-ya', 'Go-vin-da-ya', 'Go-pi-ja-na', 'Val-la-bha-ya', 'Swa-ha', 'Om', 'Na-mo', 'Bha-ga-va-te', 'Va-su-de-va-ya', 'Na-ma-ha'],
      requiredAmount: 51
    }
  ],
  lakshmi: [
    {
      id: 'lakshmi_basic',
      deityId: 'lakshmi',
      level: 'basic',
      duration: 30,
      text: 'ॐ श्रीं महालक्ष्म्यै नमः',
      transliteration: 'Om Shreem Mahalakshmyai Namaha',
      meaning: 'Salutations to Goddess Lakshmi, the divine mother of prosperity',
      pronunciation: ['Om', 'Shreem', 'Ma-ha-lak-shmy-ai', 'Na-ma-ha'],
      requiredAmount: 0
    },
    {
      id: 'lakshmi_intermediate',
      deityId: 'lakshmi',
      level: 'intermediate',
      duration: 60,
      text: 'ॐ श्रीं श्रीये नमः। सर्व मंगल मांगल्ये शिवे सर्वार्थ साधिके।',
      transliteration: 'Om Shreem Shriye Namaha, Sarva Mangala Mangalye Shive Sarvartha Sadhike',
      meaning: 'Salutations to the auspicious one who fulfills all desires and brings prosperity',
      pronunciation: ['Om', 'Shreem', 'Shri-ye', 'Na-ma-ha', 'Sar-va', 'Man-ga-la', 'Man-gal-ye', 'Shi-ve', 'Sar-var-tha', 'Sa-dhi-ke'],
      requiredAmount: 21
    },
    {
      id: 'lakshmi_advanced',
      deityId: 'lakshmi',
      level: 'advanced',
      duration: 120,
      text: 'ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद। श्रीं ह्रीं श्रीं ॐ महालक्ष्म्यै नमः।।',
      transliteration: 'Om Shreem Hreem Shreem Kamale Kamalalaye Praseeda Praseeda, Shreem Hreem Shreem Om Mahalakshmyai Namaha',
      meaning: 'Sacred mantra to the lotus goddess dwelling in lotus, be gracious and bestow blessings',
      pronunciation: ['Om', 'Shreem', 'Hreem', 'Shreem', 'Ka-ma-le', 'Ka-ma-la-la-ye', 'Pra-see-da', 'Pra-see-da', 'Shreem', 'Hreem', 'Shreem', 'Om', 'Ma-ha-lak-shmy-ai', 'Na-ma-ha'],
      requiredAmount: 51
    }
  ],
  hanuman: [
    {
      id: 'hanuman_basic',
      deityId: 'hanuman',
      level: 'basic',
      duration: 30,
      text: 'ॐ हनुमते नमः',
      transliteration: 'Om Hanumate Namaha',
      meaning: 'Salutations to Lord Hanuman',
      pronunciation: ['Om', 'Ha-nu-ma-te', 'Na-ma-ha'],
      requiredAmount: 0
    },
    {
      id: 'hanuman_intermediate',
      deityId: 'hanuman',
      level: 'intermediate',
      duration: 60,
      text: 'ॐ हं हनुमते नमः। जय हनुमान ज्ञान गुण सागर।',
      transliteration: 'Om Ham Hanumate Namaha, Jai Hanuman Gyan Gun Sagar',
      meaning: 'Salutations to Hanuman, the ocean of knowledge and virtues',
      pronunciation: ['Om', 'Ham', 'Ha-nu-ma-te', 'Na-ma-ha', 'Jai', 'Ha-nu-man', 'Gyan', 'Gun', 'Sa-gar'],
      requiredAmount: 21
    },
    {
      id: 'hanuman_advanced',
      deityId: 'hanuman',
      level: 'advanced',
      duration: 120,
      text: 'ॐ ऐं भीम हनुमते नमः। मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्।',
      transliteration: 'Om Aim Bheem Hanumate Namaha, Manojavam Marutatulyavegam Jitendriyam Buddhimatam Varishtham',
      meaning: 'Swift as mind and wind, master of senses, supreme among the intelligent ones',
      pronunciation: ['Om', 'Aim', 'Bheem', 'Ha-nu-ma-te', 'Na-ma-ha', 'Ma-no-ja-vam', 'Ma-ru-ta-tul-ya-ve-gam', 'Ji-ten-dri-yam', 'Bud-dhi-ma-tam', 'Va-rish-tham'],
      requiredAmount: 51
    }
  ],
  ram: [
    {
      id: 'ram_basic',
      deityId: 'ram',
      level: 'basic',
      duration: 30,
      text: 'श्री राम जय राम जय जय राम',
      transliteration: 'Shri Ram Jai Ram Jai Jai Ram',
      meaning: 'Glory to Lord Rama',
      pronunciation: ['Shri', 'Ram', 'Jai', 'Ram', 'Jai', 'Jai', 'Ram'],
      requiredAmount: 0
    },
    {
      id: 'ram_intermediate',
      deityId: 'ram',
      level: 'intermediate',
      duration: 60,
      text: 'ॐ रां रामाय नमः। सीता राम सीता राम सीता राम कहो प्यारे।',
      transliteration: 'Om Raam Ramaya Namaha, Sita Ram Sita Ram Sita Ram Kaho Pyare',
      meaning: 'Chant the names of Sita and Rama with devotion',
      pronunciation: ['Om', 'Raam', 'Ra-ma-ya', 'Na-ma-ha', 'Si-ta', 'Ram', 'Si-ta', 'Ram', 'Si-ta', 'Ram', 'Ka-ho', 'Py-are'],
      requiredAmount: 21
    },
    {
      id: 'ram_advanced',
      deityId: 'ram',
      level: 'advanced',
      duration: 120,
      text: 'ॐ रामचन्द्राय नमः। राम रामेति रामेति रमे रामे मनोरमे। सहस्रनाम तत्तुल्यं रामनाम वरानने।।',
      transliteration: 'Om Ramachandraya Namaha, Ram Rameti Rameti Rame Rame Manorame, Sahasranama Tattulyam Ramanama Varanane',
      meaning: 'The name of Rama equals thousands of names and brings supreme delight to the mind',
      pronunciation: ['Om', 'Ra-ma-chan-dra-ya', 'Na-ma-ha', 'Ram', 'Ra-me-ti', 'Ra-me-ti', 'Ra-me', 'Ra-me', 'Ma-no-ra-me', 'Sa-has-ra-na-ma', 'Tat-tul-yam', 'Ra-ma-na-ma', 'Va-ra-na-ne'],
      requiredAmount: 51
    }
  ],
  durga: [
    {
      id: 'durga_basic',
      deityId: 'durga',
      level: 'basic',
      duration: 30,
      text: 'ॐ दुर्गायै नमः',
      transliteration: 'Om Durgayai Namaha',
      meaning: 'Salutations to Goddess Durga',
      pronunciation: ['Om', 'Dur-ga-yai', 'Na-ma-ha'],
      requiredAmount: 0
    },
    {
      id: 'durga_intermediate',
      deityId: 'durga',
      level: 'intermediate',
      duration: 60,
      text: 'ॐ दुं दुर्गायै नमः। जय माता दी जय माता दी।',
      transliteration: 'Om Dum Durgayai Namaha, Jai Mata Di Jai Mata Di',
      meaning: 'Victory to the Divine Mother Durga',
      pronunciation: ['Om', 'Dum', 'Dur-ga-yai', 'Na-ma-ha', 'Jai', 'Ma-ta', 'Di', 'Jai', 'Ma-ta', 'Di'],
      requiredAmount: 21
    },
    {
      id: 'durga_advanced',
      deityId: 'durga',
      level: 'advanced',
      duration: 120,
      text: 'या देवी सर्वभूतेषु माँ दुर्गा रूपेण संस्थिता। नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः।।',
      transliteration: 'Ya Devi Sarvabhuteshu Maa Durga Rupena Samsthita, Namastasyai Namastasyai Namastasyai Namo Namaha',
      meaning: 'To the goddess who resides in all beings in the form of Durga, salutations again and again',
      pronunciation: ['Ya', 'De-vi', 'Sar-va-bhu-te-shu', 'Maa', 'Dur-ga', 'Ru-pe-na', 'Sam-sthi-ta', 'Na-mas-tas-yai', 'Na-mas-tas-yai', 'Na-mas-tas-yai', 'Na-mo', 'Na-ma-ha'],
      requiredAmount: 51
    }
  ],
  saraswati: [
    {
      id: 'saraswati_basic',
      deityId: 'saraswati',
      level: 'basic',
      duration: 30,
      text: 'ॐ सरस्वत्यै नमः',
      transliteration: 'Om Saraswatyai Namaha',
      meaning: 'Salutations to Goddess Saraswati',
      pronunciation: ['Om', 'Sa-ras-wat-yai', 'Na-ma-ha'],
      requiredAmount: 0
    },
    {
      id: 'saraswati_intermediate',
      deityId: 'saraswati',
      level: 'intermediate',
      duration: 60,
      text: 'ॐ ऐं सरस्वत्यै नमः। या कुन्देन्दु तुषार हार धवला।',
      transliteration: 'Om Aim Saraswatyai Namaha, Ya Kundendu Tushar Har Dhavala',
      meaning: 'She who is pure and white like jasmine, moon and snow',
      pronunciation: ['Om', 'Aim', 'Sa-ras-wat-yai', 'Na-ma-ha', 'Ya', 'Kun-den-du', 'Tu-shar', 'Har', 'Dha-va-la'],
      requiredAmount: 21
    },
    {
      id: 'saraswati_advanced',
      deityId: 'saraswati',
      level: 'advanced',
      duration: 120,
      text: 'ॐ ऐं ह्रीं श्रीं वाग्देव्यै सरस्वत्यै नमः। विद्या ददाति विनयं विनयाद् याति पात्रताम्।',
      transliteration: 'Om Aim Hreem Shreem Vagdevyai Saraswatyai Namaha, Vidya Dadati Vinayam Vinayard Yati Patratam',
      meaning: 'Sacred mantra to the goddess of speech and knowledge, who grants learning and humility',
      pronunciation: ['Om', 'Aim', 'Hreem', 'Shreem', 'Vag-dev-yai', 'Sa-ras-wat-yai', 'Na-ma-ha', 'Vid-ya', 'Da-da-ti', 'Vi-na-yam', 'Vi-na-yard', 'Ya-ti', 'Pa-tra-tam'],
      requiredAmount: 51
    }
  ]
};

export function getChantForOffering(deityId: string, amount: number): Chant | null {
  const deityChants = DEITY_CHANTS[deityId];
  if (!deityChants) return null;

  // Find the appropriate chant based on offering amount
  const availableChants = deityChants.filter(chant => amount >= chant.requiredAmount);
  if (availableChants.length === 0) return null;

  // Return the most advanced chant available for this amount
  return availableChants[availableChants.length - 1];
}

export function getChantDuration(amount: number): number {
  if (amount >= 101) return 180; // 3 minutes for highest offering
  if (amount >= 51) return 120;  // 2 minutes
  if (amount >= 21) return 90;   // 1.5 minutes
  if (amount >= 11) return 60;   // 1 minute
  return 45; // 45 seconds for free offering
}
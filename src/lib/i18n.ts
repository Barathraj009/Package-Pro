/**
 * Full interface-copy dictionary (en/hi/ta) plus data-driven labels that are
 * keyed by enum value (theme, tier, slot, segment, guide specialisation,
 * room type, transfer mode, place). Keys are BCP-47 base tags.
 *
 * The hi/ta enum labels live in data/content/labels.json — the same file the
 * content-locale build (scripts/content-build.mjs) consumes — so the UI and
 * the DB-derived content stay in one vocabulary. Filling a gap here is the
 * documented stretch item 9 of the README (full multilingual content).
 */
import labels from "../../data/content/labels.json";

export const SUPPORTED_UI_LANGUAGES = ["en", "hi", "ta"] as const;
export type UiLanguage = (typeof SUPPORTED_UI_LANGUAGES)[number];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.packages": "Packages",
  "nav.preferences": "Preferences",
  "nav.build": "Build with AI",
  "nav.login": "Log in",

  // Home
  "home.badge": "Kognivera Hackathon 2026 · PS-04 · Travel & Tourism",
  "home.tagline1": "Plot the trip,",
  "home.tagline2": "watch the price",
  "home.tagline3": "move with it.",
  "home.lead":
    "Start from a curated package. Swap the hotel tier, add a Tamil-speaking heritage guide, stretch the trip by a day — the itinerary and total reprice live, in your language.",
  "home.browse": "Browse packages",
  "home.buildCta": "Build with AI",
  "home.setLang": "Set your language first",
  "home.step1Title": "Start curated",
  "home.step1Body": "Adventure, honeymoon, pilgrimage, family and more — or let AI build one from what you tell it.",
  "home.step2Title": "Swap components",
  "home.step2Body": "Hotel tier, activities, transfer, a local guide by language and specialism — price updates live.",
  "home.step3Title": "Book in your language",
  "home.step3Body": "Interface and guide language both follow your preference, end to end.",

  // Packages list
  "packages.title": "Curated tour packages",
  "packages.subtitle": "Browse by theme, then customise anything.",
  "packages.recommendedForYou": "Recommended for your language",
  "packages.viewDetails": "View details",
  "packages.from": "From",
  "packages.matchesLanguage": "Matches your language",
  "packages.duration": "{d}d / {n}n",
  "packages.empty": "No packages match this theme yet.",

  // Package detail
  "detail.itinerary": "Itinerary",
  "detail.inclusions": "Inclusions",
  "detail.exclusions": "Exclusions",
  "detail.priceBreakdown": "Price breakdown",
  "detail.total": "Total",
  "detail.customise": "Customise this package",
  "detail.hotelTier": "Hotel room tier",
  "detail.transfer": "Transfer",
  "detail.guide": "Local guide",
  "detail.noGuide": "No guide",
  "detail.addGuide": "Add a guide",
  "detail.removeGuide": "Remove guide",
  "detail.extraDays": "Extra days",
  "detail.book": "Book this package",
  "detail.save": "Save",
  "detail.share": "Share",
  "detail.day": "Day",
  "detail.added": "Added",
  "detail.extraDayInfo": "Extra day — estimated at the package's own average daily cost.",
  "detail.includeGuide": "Include a guide on this trip",
  "detail.unassigned": "Unassigned (generic estimate)",
  "detail.defaultRoom": "Default (package's included tier)",
  "detail.defaultTransfer": "Default (package's included transfer)",
  "detail.includedExtras": "Included extras",
  "detail.base": "Base",
  "detail.swapped": "swapped",
  "detail.splitAcross": "Split across",
  "detail.perNight": "/night",
  "detail.sleeps": "sleeps",
  "detail.traveller": "traveller",
  "detail.saved": "Saved.",
  "detail.shareLink": "Share link:",
  "detail.booked": "Booked — reference {ref}.",
  "detail.tripStart": "Trip start:",
  "detail.daysRange": "{a} → {b} days",
  "detail.saveError": "Could not save",
  "detail.loginFirstBook":
    "Log in first to book (pick a demo traveller). Read the language note below the package — the app follows it.",

  "guide.language": "Speaks",
  "guide.specialisation": "Specialises in",
  "guide.dayRate": "Full day",
  "guide.halfDayRate": "Half day",

  // Login
  "login.title": "Pick a traveller",
  "login.subtitle":
    "PackagePro uses the seeded catalog users for this demo — no signup needed. Segments span heavy users (rich history), light users, and cold-start (little to no history, good for trying the AI builder).",
  "login.pick": "Pick a traveller",
  "login.loggingIn": "Logging in…",

  // Preferences
  "prefs.title": "Language & travel preferences",
  "prefs.interfaceLanguage": "Interface language",
  "prefs.guideLanguage": "Preferred guide language",
  "prefs.preferredLanguages": "Preferred languages",
  "prefs.save": "Save preferences",
  "prefs.saved": "Preferences saved — packages and guides are now filtered for you.",
  "prefs.loginFirst": "Log in as a demo traveller first to set preferences.",
  "prefs.note":
    "This drives which packages rank first, which UI language you see, and which guides are recommended first on package pages.",
  "prefs.noPref": "No preference",
  "prefs.interests": "Your interests",
  "prefs.interestsPlaceholder": "e.g. heritage temples, beaches, cooking, hill views",
  "prefs.interestsHint": "Helps the AI builder suggest the right packages — use free text, comma-separated.",

  // Shared share page
  "share.badge": "Shared itinerary · read-only",
  "share.customise": "Customise your own version of this package →",

  // Pricing breakdown copy
  "price.extraDayLabel": "Extra day {n} (est., based on package average)",
  "price.extraDayNote":
    "Estimated from the package's own mandatory-cost-per-day — no per-extra-day catalog data exists for this package.",
  "price.roomNote": "{room} at {hotel} ({currency}{rate}/night vs cheapest {currency}{cheapest}/night)",
  "price.transferNote": "{mode} · {from} → {to} ({min} min)",
  "price.availNote": "not available on this date, showing rate anyway",
  "price.guideLabel": "Local guide — {name}",
  "price.guideNote": "{spec}{extra} · {langs} · {rateWord} × {mult}{avail}",
  "price.rateFull": "full day rate",
  "price.rateHalf": "half day rate",

  "theme.all": "All",

  // AI builder
  "builder.title": "Build with AI",
  "builder.subtitle":
    "Tell us what you love — temples, beaches, slow mornings, street food — and your rough budget. We'll pull real packages and a local guide that fit, grounded in the catalog.",
  "builder.interestsLabel": "What do you enjoy?",
  "builder.interestsPlaceholder": "e.g. heritage temples, beaches, cooking classes, hill views…",
  "builder.budgetLabel": "Rough budget",
  "builder.budgetHint": "per package · INR (leave blank to skip)",
  "builder.langLabel": "Guide languages",
  "builder.build": "Build my trip",
  "builder.building": "Building…",
  "builder.aiPowered": "Composed with AI",
  "builder.ruleMatched": "Matched by keyword rules",
  "builder.recommended": "Recommended",
  "builder.reasoning": "Why this one",
  "builder.guide": "Suggested local guide",
  "builder.guideNoMatch": "No specific guide matched — pick one on the package page.",
  "builder.alternates": "Other good fits",
  "builder.empty": "No packages matched your budget and language — try widening the budget.",
  "builder.loggedInAs": "Building as {name}",
  "builder.loginFirst": "Log in first so we can use your language preferences.",
  "builder.attachSession": "As the logged-in traveller",
  "builder.attachGuest": "Logged out — we'll use catalog languages",

  // Bookings
  "booking.myTripsTitle": "My trips",
  "booking.myTripsSubtitle": "Everything you've booked, in one place.",
  "booking.empty": "You haven't booked any trips yet — go explore.",
  "booking.confirmedTitle": "Booking confirmed",
  "booking.packageLabel": "Package",
  "booking.bookedOn": "Booked on",
  "booking.total": "Total",
  "booking.openPackage": "Open package",
  "booking.myTrips": "My trips",
  "booking.backToPackages": "Browse packages",
  "booking.loginFirst": "Log in first so we know whose trips these are.",
  "booking.noRef": "No booking reference provided.",
  "booking.notFound": "No booking found for {ref}.",
  "booking.notFoundInline": "This booking's details are no longer available (the customization may have been removed).",

  // Account
  "account.title": "Your account",
  "account.welcomeBack": "Welcome back, {name}.",
  "account.userId": "User ID",
  "account.segment": "Travel segment",
  "account.logout": "Log out",
  "account.loggingOut": "Logging out…",
};

const hi: Dict = {
  "nav.packages": "पैकेज",
  "nav.preferences": "प्राथमिकताएँ",
  "nav.build": "एआई से बनाएँ",
  "nav.login": "लॉग इन करें",

  "home.badge": "कोग्निवेरा हैकाथॉन 2026 · पीएस-04 · यात्रा और पर्यटन",
  "home.tagline1": "यात्रा की रूपरेखा बनाएँ",
  "home.tagline2": "कीमत पर नज़र रखें",
  "home.tagline3": "और उसके साथ चलें।",
  "home.lead":
    "एक क्यूरेटेड पैकेज से शुरू करें। होटल श्रेणी बदलें, तमिल-भाषी विरासत गाइड जोड़ें, यात्रा को एक दिन बढ़ाएँ — यात्रा कार्यक्रम और कुल कीमत आपकी भाषा में लाइव अपडेट होती है।",
  "home.browse": "पैकेज देखें",
  "home.buildCta": "एआई से बनाएँ",
  "home.setLang": "पहले अपनी भाषा चुनें",
  "home.step1Title": "क्यूरेटेड शुरुआत",
  "home.step1Body": "साहसिक, हनीमून, तीर्थयात्रा, परिवार और बहुत कुछ — या AI को अपनी बात से पैकेज बनाने दें।",
  "home.step2Title": "घटक बदलें",
  "home.step2Body": "होटल श्रेणी, गतिविधियाँ, ट्रांसफर, भाषा और विशेषज्ञता के अनुसार स्थानीय गाइड — कीमत लाइव अपडेट होती है।",
  "home.step3Title": "अपनी भाषा में बुक करें",
  "home.step3Body": "इंटरफ़ेस और गाइड की भाषा दोनों, शुरू से अंत तक आपकी पसंद का पालन करती हैं।",

  "packages.title": "क्यूरेटेड टूर पैकेज",
  "packages.subtitle": "थीम के अनुसार ब्राउज़ करें, फिर कुछ भी अनुकूलित करें।",
  "packages.recommendedForYou": "आपकी भाषा के लिए अनुशंसित",
  "packages.viewDetails": "विवरण देखें",
  "packages.from": "शुरुआती कीमत",
  "packages.matchesLanguage": "आपकी भाषा से मेल खाता है",
  "packages.duration": "{d}दिन / {n}रात",
  "packages.empty": "इस थीम से मेल खाता कोई पैकेज अभी तक नहीं है।",

  "detail.itinerary": "यात्रा कार्यक्रम",
  "detail.inclusions": "शामिल",
  "detail.exclusions": "शामिल नहीं",
  "detail.priceBreakdown": "मूल्य विवरण",
  "detail.total": "कुल",
  "detail.customise": "इस पैकेज को अनुकूलित करें",
  "detail.hotelTier": "होटल रूम श्रेणी",
  "detail.transfer": "ट्रांसफर",
  "detail.guide": "स्थानीय गाइड",
  "detail.noGuide": "कोई गाइड नहीं",
  "detail.addGuide": "गाइड जोड़ें",
  "detail.removeGuide": "गाइड हटाएँ",
  "detail.extraDays": "अतिरिक्त दिन",
  "detail.book": "यह पैकेज बुक करें",
  "detail.save": "सहेजें",
  "detail.share": "साझा करें",
  "detail.day": "दिन",
  "detail.added": "जोड़ा गया",
  "detail.extraDayInfo": "अतिरिक्त दिन — पैकेज की अपनी औसत दैनिक लागत पर अनुमानित।",
  "detail.includeGuide": "इस यात्रा में गाइड शामिल करें",
  "detail.unassigned": "अनिर्धारित (सामान्य अनुमान)",
  "detail.defaultRoom": "डिफ़ॉल्ट (पैकेज की शामिल श्रेणी)",
  "detail.defaultTransfer": "डिफ़ॉल्ट (पैकेज का शामिल स्थानांतरण)",
  "detail.includedExtras": "शामिल अतिरिक्त सेवाएँ",
  "detail.base": "आधार",
  "detail.swapped": "बदला गया",
  "detail.splitAcross": "इनमें बाँटें",
  "detail.perNight": "/रात",
  "detail.sleeps": "रह सकते हैं",
  "detail.traveller": "यात्री",
  "detail.saved": "सहेजा गया।",
  "detail.shareLink": "साझा लिंक:",
  "detail.booked": "बुक किया गया — संदर्भ {ref}।",
  "detail.tripStart": "यात्रा आरंभ:",
  "detail.daysRange": "{a} → {b} दिन",
  "detail.saveError": "सहेजा नहीं जा सका",
  "detail.loginFirstBook":
    "बुक करने के लिए पहले लॉग इन करें (डेमो यात्री चुनें)। पैकेज के नीचे भाषा नोट पढ़ें — ऐप उसी का पालन करता है।",

  "guide.language": "भाषा",
  "guide.specialisation": "विशेषज्ञता",
  "guide.dayRate": "पूरा दिन",
  "guide.halfDayRate": "आधा दिन",

  "login.title": "यात्री चुनें",
  "login.subtitle":
    "PackagePro इस डेमो के लिए सीडेड कैटलॉग उपयोगकर्ताओं का उपयोग करता है — साइनअप की आवश्यकता नहीं। श्रेणियाँ भारी उपयोगकर्ताओं (समृद्ध इतिहास), हल्के उपयोगकर्ताओं और नए आगंतुकों (कम या कोई इतिहास, AI बिल्डर आज़माने के लिए अच्छे) तक फैली हैं।",
  "login.pick": "यात्री चुनें",
  "login.loggingIn": "लॉग इन हो रहा है…",

  "prefs.title": "भाषा और यात्रा प्राथमिकताएँ",
  "prefs.interfaceLanguage": "इंटरफ़ेस भाषा",
  "prefs.guideLanguage": "पसंदीदा गाइड भाषा",
  "prefs.preferredLanguages": "पसंदीदा भाषाएँ",
  "prefs.save": "प्राथमिकताएँ सहेजें",
  "prefs.saved": "प्राथमिकताएँ सहेजी गईं — पैकेज और गाइड अब आपके लिए फ़िल्टर किए गए हैं।",
  "prefs.loginFirst": "प्राथमिकताएँ सेट करने के लिए पहले किसी डेमो यात्री के रूप में लॉग इन करें।",
  "prefs.note":
    "यह तय करता है कि कौन से पैकेज पहले रैंक करते हैं, आप कौन सी UI भाषा देखते हैं, और पैकेज पृष्ठों पर कौन से गाइड पहले अनुशंसित किए जाते हैं।",
  "prefs.noPref": "कोई प्राथमिकता नहीं",
  "prefs.interests": "आपकी रुचियाँ",
  "prefs.interestsPlaceholder": "जैसे विरासत मंदिर, समुद्र तट, खाना बनाना, पहाड़ी दृश्य",
  "prefs.interestsHint": "एआई बिल्डर को सही पैकेज सुझाने में मदद — मुफ्त टेक्स्ट, अल्पविराम से अलग करें।",

  "share.badge": "साझा यात्रा कार्यक्रम · केवल-पठनीय",
  "share.customise": "इस पैकेज का अपना संस्करण अनुकूलित करें →",

  "price.extraDayLabel": "अतिरिक्त दिन {n} (अनुमानित, पैकेज औसत पर आधारित)",
  "price.extraDayNote":
    "पैकेज की अपनी अनिवार्य लागत-प्रति-दिन से अनुमानित — इस पैकेज के लिए प्रति-अतिरिक्त-दिन कैटलॉग डेटा मौजूद नहीं है।",
  "price.roomNote": "{hotel} में {room} ({currency}{rate}/रात बनाम सबसे सस्ती {currency}{cheapest}/रात)",
  "price.transferNote": "{mode} · {from} → {to} ({min} मिनट)",
  "price.availNote": "इस तारीख पर उपलब्ध नहीं, फिर भी दर दिखाई जा रही है",
  "price.guideLabel": "स्थानीय गाइड — {name}",
  "price.guideNote": "{spec}{extra} · {langs} · {rateWord} × {mult}{avail}",
  "price.rateFull": "पूरा दिन दर",
  "price.rateHalf": "आधा दिन दर",

  "theme.all": "सभी",

  // AI builder
  "builder.title": "एआई से बनाएँ",
  "builder.subtitle":
    "हमें बताएँ कि आपको क्या पसंद है — मंदिर, समुद्र तट, धीमी सुबह, स्ट्रीट फूड — और आपका मोटा बजट। हम कैटलॉग से वास्तविक पैकेज और एक स्थानीय गाइड मिलाते हैं जो फिट बैठता है।",
  "builder.interestsLabel": "आपको क्या पसंद है?",
  "builder.interestsPlaceholder": "जैसे विरासत मंदिर, समुद्र तट, कुकिंग क्लास, पहाड़ी दृश्य…",
  "builder.budgetLabel": "मोटा बजट",
  "builder.budgetHint": "प्रति पैकेज · INR (छोड़ने के लिए खाली)",
  "builder.langLabel": "गाइड भाषाएँ",
  "builder.build": "मेरी यात्रा बनाएँ",
  "builder.building": "बना रहे हैं…",
  "builder.aiPowered": "एआई से रचा गया",
  "builder.ruleMatched": "कीवर्ड नियमों से मिलान",
  "builder.recommended": "अनुशंसित",
  "builder.reasoning": "ऐसा क्यों",
  "builder.guide": "सुझाया गया स्थानीय गाइड",
  "builder.guideNoMatch": "कोई विशेष गाइड मेल नहीं खाया — पैकेज पेज पर चुनें।",
  "builder.alternates": "अन्य अच्छे विकल्प",
  "builder.empty": "आपके बजट और भाषा से कोई पैकेज मेल नहीं खाया — बजट बढ़ाएँ।",
  "builder.loggedInAs": "{name} के रूप में बना रहे हैं",
  "builder.loginFirst": "पहले लॉग इन करें ताकि हम आपकी भाषा प्राथमिकताएँ उपयोग कर सकें।",
  "builder.attachSession": "लॉग इन यात्री के रूप में",
  "builder.attachGuest": "लॉग आउट — हम कैटलॉग भाषाएँ उपयोग करेंगे",

  // Bookings
  "booking.myTripsTitle": "मेरी यात्राएँ",
  "booking.myTripsSubtitle": "आपने जो भी बुक किया है, एक जगह।",
  "booking.empty": "आपने अभी कोई यात्रा बुक नहीं की है — देखें।",
  "booking.confirmedTitle": "बुकिंग की पुष्टि हो गई",
  "booking.packageLabel": "पैकेज",
  "booking.bookedOn": "बुक हुई",
  "booking.total": "कुल",
  "booking.openPackage": "पैकेज खोलें",
  "booking.myTrips": "मेरी यात्राएँ",
  "booking.backToPackages": "पैकेज देखें",
  "booking.loginFirst": "पहले लॉग इन करें ताकि हम जान सकें कि ये यात्राएँ किसकी हैं।",
  "booking.noRef": "कोई बुकिंग संदर्भ नहीं दिया गया।",
  "booking.notFound": "{ref} के लिए कोई बुकिंग नहीं मिली।",
  "booking.notFoundInline": "इस बुकिंग का विवरण अब उपलब्ध नहीं है (कस्टमाइज़ेशन हटाया गया हो सकता है)।",

  // Account
  "account.title": "आपका खाता",
  "account.welcomeBack": "वापसी पर स्वागत है, {name}.",
  "account.userId": "उपयोगकर्ता आईडी",
  "account.segment": "यात्रा खंड",
  "account.logout": "लॉग आउट",
  "account.loggingOut": "लॉग आउट हो रहा है…",
};

const ta: Dict = {
  "nav.packages": "பேக்கேஜ்கள்",
  "nav.preferences": "விருப்பங்கள்",
  "nav.build": "AI மூலம் உருவாக்கு",
  "nav.login": "உள்நுழைக",

  "home.badge": "காக்னிவேரா ஹேக்கத்தான் 2026 · பிஎஸ்-04 · பயணம் மற்றும் சுற்றுலா",
  "home.tagline1": "பயணத்தை திட்டமிடுங்கள்",
  "home.tagline2": "விலையை கவனியுங்கள்",
  "home.tagline3": "அதனுடன் நகர்ந்து செல்லுங்கள்.",
  "home.lead":
    "தேர்ந்தெடுக்கப்பட்ட பேக்கேஜில் தொடங்குங்கள். ஹோட்டல் நிலையை மாற்றுங்கள், தமிழ் பேசும் பாரம்பரிய வழிகாட்டியைச் சேருங்கள், பயணத்தை ஒரு நாள் நீட்டுங்கள் — பயணத் திட்டமும் மொத்த விலையும் உங்கள் மொழியில் நேரலையாகப் புதுப்பிக்கப்படும்.",
  "home.browse": "பேக்கேஜ்களைப் பார்க்க",
  "home.buildCta": "AI மூலம் உருவாக்கு",
  "home.setLang": "முதலில் உங்கள் மொழியை அமைக்கவும்",
  "home.step1Title": "தேர்ந்தெடுக்கப்பட்ட ஆரம்பம்",
  "home.step1Body":
    "சாகசம், தேனிலவு, யாத்திரை, குடும்பம் மற்றும் பல — அல்லது நீங்கள் சொல்வதிலிருந்து AI ஒன்றை உருவாக்கட்டும்.",
  "home.step2Title": "கூறுகளை மாற்றவும்",
  "home.step2Body":
    "ஹோட்டல் நிலை, செயல்பாடுகள், இடமாற்றம், மொழி மற்றும் நிபுணத்துவத்தின்படி உள்ளூர் வழிகாட்டி — விலை நேரலையாகப் புதுப்பிக்கப்படும்.",
  "home.step3Title": "உங்கள் மொழியில் முன்பதிவு செய்யுங்கள்",
  "home.step3Body": "இடைமுகமும் வழிகாட்டி மொழியும் இரண்டும், தொடக்கத்திலிருந்து இறுதிவரை உங்கள் விருப்பத்தைப் பின்பற்றுகின்றன.",

  "packages.title": "தேர்ந்தெடுக்கப்பட்ட சுற்றுலா பேக்கேஜ்கள்",
  "packages.subtitle": "தீம் வாரியாக உலாவவும், பின் எதையும் தனிப்பயனாக்கவும்.",
  "packages.recommendedForYou": "உங்கள் மொழிக்கு பரிந்துரைக்கப்பட்டவை",
  "packages.viewDetails": "விவரங்களைப் பார்க்க",
  "packages.from": "தொடக்க விலை",
  "packages.matchesLanguage": "உங்கள் மொழியுடன் பொருந்துகிறது",
  "packages.duration": "{d}நாள் / {n}இரவு",
  "packages.empty": "இந்த தீமுடன் பொருந்தும் பேக்கேஜ் இன்னும் இல்லை.",

  "detail.itinerary": "பயண அட்டவணை",
  "detail.inclusions": "சேர்க்கப்பட்டவை",
  "detail.exclusions": "விலக்கப்பட்டவை",
  "detail.priceBreakdown": "விலை விவரம்",
  "detail.total": "மொத்தம்",
  "detail.customise": "இந்த பேக்கேஜை தனிப்பயனாக்கு",
  "detail.hotelTier": "ஹோட்டல் அறை நிலை",
  "detail.transfer": "இடமாற்றம்",
  "detail.guide": "உள்ளூர் வழிகாட்டி",
  "detail.noGuide": "வழிகாட்டி இல்லை",
  "detail.addGuide": "வழிகாட்டியைச் சேர்",
  "detail.removeGuide": "வழிகாட்டியை அகற்று",
  "detail.extraDays": "கூடுதல் நாட்கள்",
  "detail.book": "இந்த பேக்கேஜை முன்பதிவு செய்",
  "detail.save": "சேமி",
  "detail.share": "பகிர்",
  "detail.day": "நாள்",
  "detail.added": "சேர்க்கப்பட்டது",
  "detail.extraDayInfo": "கூடுதல் நாள் — பேக்கேஜின் சொந்த சராசரி தினசரி செலவில் மதிப்பிடப்பட்டது.",
  "detail.includeGuide": "இந்த பயணத்தில் வழிகாட்டியை சேர்க்கவும்",
  "detail.unassigned": "நியமிக்கப்படவில்லை (பொது மதிப்பீடு)",
  "detail.defaultRoom": "இயல்பு (பேக்கேஜின் சேர்க்கப்பட்ட நிலை)",
  "detail.defaultTransfer": "இயல்பு (பேக்கேஜின் சேர்க்கப்பட்ட இடமாற்றம்)",
  "detail.includedExtras": "சேர்க்கப்பட்ட கூடுதல் வசதிகள்",
  "detail.base": "அடிப்படை",
  "detail.swapped": "மாற்றப்பட்டது",
  "detail.splitAcross": "இவ்வாறு பிரிக்கவும்",
  "detail.perNight": "/இரவு",
  "detail.sleeps": "தங்கலாம்",
  "detail.traveller": "பயணி",
  "detail.saved": "சேமிக்கப்பட்டது.",
  "detail.shareLink": "பகிர்வு இணைப்பு:",
  "detail.booked": "முன்பதிவு செய்யப்பட்டது — குறிப்பு {ref}.",
  "detail.tripStart": "பயண தொடக்கம்:",
  "detail.daysRange": "{a} → {b} நாட்கள்",
  "detail.saveError": "சேமிக்க முடியவில்லை",
  "detail.loginFirstBook":
    "முன்பதிவு செய்ய முதலில் உள்நுழைக (டெமோ பயணியைத் தேர்ந்தெடுக்கவும்). பேக்கேஜின் கீழ் உள்ள மொழி குறிப்பைப் படிக்கவும் — பயன்பாடு அதைப் பின்பற்றும்.",

  "guide.language": "பேசும் மொழி",
  "guide.specialisation": "நிபுணத்துவம்",
  "guide.dayRate": "முழு நாள்",
  "guide.halfDayRate": "அரை நாள்",

  "login.title": "பயணியைத் தேர்ந்தெடுக்கவும்",
  "login.subtitle":
    "PackagePro இந்த டெமோவிற்காக சீட் செய்யப்பட்ட பட்டியல் பயனர்களைப் பயன்படுத்துகிறது — பதிவு தேவையில்லை. பிரிவுகள் அதிக வரலாறு கொண்ட பயனர்கள், குறைவான பயனர்கள், மற்றும் புதிய பயனர்கள் (சிறிய அல்லது வரலாறு இல்லாதவை, AI பில்டரை முயற்சிக்க நல்லது) என விரிவடைகின்றன.",
  "login.pick": "பயணியைத் தேர்ந்தெடுக்கவும்",
  "login.loggingIn": "உள்நுழைகிறது…",

  "prefs.title": "மொழி மற்றும் பயண விருப்பங்கள்",
  "prefs.interfaceLanguage": "இடைமுக மொழி",
  "prefs.guideLanguage": "விருப்பமான வழிகாட்டி மொழி",
  "prefs.preferredLanguages": "விருப்பமான மொழிகள்",
  "prefs.save": "விருப்பங்களை சேமி",
  "prefs.saved": "விருப்பங்கள் சேமிக்கப்பட்டன — பேக்கேஜ்கள் மற்றும் வழிகாட்டிகள் இப்போது உங்களுக்காக வடிகட்டப்பட்டுள்ளன.",
  "prefs.loginFirst": "விருப்பங்களை அமைக்க முதலில் ஒரு டெமோ பயணியாக உள்நுழைக.",
  "prefs.note":
    "இது எந்த பேக்கேஜ்கள் முதலில் தரமிடப்படுகின்றன, நீங்கள் எந்த இடைமுக மொழியைப் பார்க்கிறீர்கள், எந்த வழிகாட்டிகள் முதலில் பரிந்துரைக்கப்படுகிறார்கள் என்பதை தீர்மானிக்கிறது.",
  "prefs.noPref": "விருப்பம் இல்லை",
  "prefs.interests": "உங்கள் ஆர்வங்கள்",
  "prefs.interestsPlaceholder": "எ.கா. பாரம்பரிய கோவில்கள், கடற்கரைகள், சமையல், மலை காட்சிகள்",
  "prefs.interestsHint": "AI பில்டருக்கு சரியான பேக்கேஜ்களை பரிந்துரைக்க உதவும் — காமா பிரித்து, இலவச உரையாக எழுதுங்கள்.",

  "share.badge": "பகிரப்பட்ட பயணத் திட்டம் · படிக்க மட்டும்",
  "share.customise": "இந்த பேக்கேஜின் உங்கள் சொந்த பதிப்பை தனிப்பயனாக்கு →",

  "price.extraDayLabel": "கூடுதல் நாள் {n} (மதிப்பீடு, பேக்கேஜ் சராசரி அடிப்படையில்)",
  "price.extraDayNote":
    "பேக்கேஜின் சொந்த கட்டாய செலவு-ஒரு-நாள் அடிப்படையில் மதிப்பிடப்பட்டது — இந்த பேக்கேஜுக்கு ஒரு-நாள்-கூடுதல் பட்டியல் தரவு இல்லை.",
  "price.roomNote":
    "{hotel} இல் {room} ({currency}{rate}/இரவு, மலிவான {currency}{cheapest}/இரவுடன் ஒப்பிடும்போது)",
  "price.transferNote": "{mode} · {from} → {to} ({min} நிமிடம்)",
  "price.availNote": "இந்த தேதியில் கிடைக்கவில்லை, எப்படியும் விலை காட்டப்படுகிறது",
  "price.guideLabel": "உள்ளூர் வழிகாட்டி — {name}",
  "price.guideNote": "{spec}{extra} · {langs} · {rateWord} × {mult}{avail}",
  "price.rateFull": "முழு நாள் விலை",
  "price.rateHalf": "அரை நாள் விலை",

  "theme.all": "அனைத்தும்",

  // AI builder
  "builder.title": "AI மூலம் உருவாக்கு",
  "builder.subtitle":
    "உங்களுக்கு பிடித்ததைச் சொல்லுங்கள் — கோவில்கள், கடற்கரைகள், மெதுவான காலை, தெரு உணவு — மற்றும் உங்கள் தோராயமான பட்ஜெட். கேடலாக்கிலிருந்து உண்மையான பேக்கேஜ்களையும் பொருந்தும் உள்ளூர் வழிகாட்டியையும் இணைக்கிறோம்.",
  "builder.interestsLabel": "எதை ரசிக்கிறீர்கள்?",
  "builder.interestsPlaceholder": "எ.கா. பாரம்பரிய கோவில்கள், கடற்கரைகள், சமையல் வகுப்பு, மலை காட்சிகள்…",
  "builder.budgetLabel": "தோராயமான பட்ஜெட்",
  "builder.budgetHint": "ஒரு பேக்கேஜிற்கு · INR (விட எழுத்து)",
  "builder.langLabel": "வழிகாட்டி மொழிகள்",
  "builder.build": "என் பயணத்தை உருவாக்கு",
  "builder.building": "உருவாக்குகிறது…",
  "builder.aiPowered": "AI மூலம் உருவாக்கப்பட்டது",
  "builder.ruleMatched": "முக்கிய வார்த்தை விதிகளால் பொருத்தப்பட்டது",
  "builder.recommended": "பரிந்துரைக்கப்பட்டது",
  "builder.reasoning": "இதற்கான காரணம்",
  "builder.guide": "பரிந்துரைக்கப்பட்ட உள்ளூர் வழிகாட்டி",
  "builder.guideNoMatch": "குறிப்பிட்ட வழிகாட்டி பொருந்தவில்லை — பேக்கேஜ் பக்கத்தில் தேர்வு செய்யவும்.",
  "builder.alternates": "மற்ற நல்ல விருப்பங்கள்",
  "builder.empty": "உங்கள் பட்ஜெட் மற்றும் மொழிக்கு எந்த பேக்கேஜும் பொருந்தவில்லை — பட்ஜெட்டை அதிகரிக்கவும்.",
  "builder.loggedInAs": "{name} ஆக உருவாக்குகிறது",
  "builder.loginFirst": "முதலில் உள்நுழையுங்கள் — உங்கள் மொழி விருப்பங்களைப் பயன்படுத்தலாம்.",
  "builder.attachSession": "உள்நுழைந்த பயணியாக",
  "builder.attachGuest": "வெளியேறியது — கேடலாக் மொழிகளைப் பயன்படுத்துகிறோம்",

  // Bookings
  "booking.myTripsTitle": "என் பயணங்கள்",
  "booking.myTripsSubtitle": "நீங்கள் பதிவு செய்த அனைத்தும், ஒரே இடத்தில்.",
  "booking.empty": "நீங்கள் இன்னும் எந்த பயணத்தையும் பதிவு செய்யவில்லை — பாருங்கள்.",
  "booking.confirmedTitle": "பதிவு உறுதிசெய்யப்பட்டது",
  "booking.packageLabel": "பேக்கேஜ்",
  "booking.bookedOn": "பதிவு செய்யப்பட்டது",
  "booking.total": "மொத்தம்",
  "booking.openPackage": "பேக்கேஜைத் திற",
  "booking.myTrips": "என் பயணங்கள்",
  "booking.backToPackages": "பேக்கேஜ்களைப் பார்க்க",
  "booking.loginFirst": "முதலில் உள்நுழையுங்கள் — யாருடைய பயணங்கள் என்பதை நாங்கள் அறிய.",
  "booking.noRef": "பதிவு குறிப்பு வழங்கப்படவில்லை.",
  "booking.notFound": "{ref} க்கு எந்த பதிவும் இல்லை.",
  "booking.notFoundInline": "இந்த பதிவின் விவரங்கள் இனி கிடைக்கவில்லை (தனிப்பயனாக்கம் நீக்கப்பட்டிருக்கலாம்).",

  // Account
  "account.title": "உங்கள் கணக்கு",
  "account.welcomeBack": "மீண்டும் வரவேற்கிறோம், {name}.",
  "account.userId": "பயனர் ஐடி",
  "account.segment": "பயண பிரிவு",
  "account.logout": "வெளியேறு",
  "account.loggingOut": "வெளியேறுகிறது…",
};

const LABEL_GROUPS = ["theme", "tier", "slot", "seg", "spec", "room", "mode", "place"] as const;

function mergeLabels(dict: Dict, pick: (v: { en: string; hi: string; ta: string }) => string) {
  for (const group of LABEL_GROUPS) {
    const entries = labels[group] as Record<string, { en: string; hi: string; ta: string }>;
    for (const [key, value] of Object.entries(entries)) {
      dict[`${group}.${key}`] = pick(value);
    }
  }
}

mergeLabels(en, (v) => v.en);
mergeLabels(hi, (v) => v.hi);
mergeLabels(ta, (v) => v.ta);

const dictionaries: Record<UiLanguage, Dict> = { en, hi, ta };

export function t(key: string, lang: string | null | undefined): string {
  const base = (lang ?? "en").split("-")[0]!.toLowerCase();
  const dict = dictionaries[base as UiLanguage] ?? dictionaries.en;
  return dict[key] ?? dictionaries.en[key] ?? key;
}

/**
 * Localized enum label with English fallback: returns the translated value for
 * `group.value`, or the raw `value` when no key exists (unknown enums).
 */
export function tLabel(group: string, value: string, lang: string | null | undefined): string {
  const key = `${group}.${value}`;
  const v = t(key, lang);
  return v === key ? value : v;
}

/** Translate then interpolate `{token}` placeholders, e.g. tf("packages.duration", uiLang, { d: 3, n: 2 }). */
export function tf(key: string, lang: string | null | undefined, vars: Record<string, string | number> = {}): string {
  let s = t(key, lang);
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

export function resolveUiLanguage(preferredLanguages: string[]): UiLanguage {
  for (const p of preferredLanguages) {
    const base = p.split("-")[0]!.toLowerCase();
    if ((SUPPORTED_UI_LANGUAGES as readonly string[]).includes(base)) return base as UiLanguage;
  }
  return "en";
}
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = process.env.CATALOG_DB_PATH ?? path.join(root, "data", "PS-04.db");
const outDir = path.join(root, "data", "content");

const seed = JSON.parse(fs.readFileSync(path.join(root, "data", "content", "seed.json"), "utf8"));
const labels = JSON.parse(fs.readFileSync(path.join(root, "data", "content", "labels.json"), "utf8"));

const T = {
  hi: {
    days: "दिन",
    name: "{city} {theme} — {n} {days}",
    descHead: "{city} पर आधारित {n}-दिवसीय {theme} यात्रा कार्यक्रम।",
    descSlowTail: "धीमी सुबह के लिए नियोजित, एक पूरी निःशुल्क दोपहर के साथ ताकि योजना वास्तविकता के संपर्क में बनी रहे।",
    descEarlyTail: "जल्दी उठने वालों के लिए नियोजित, एक पूरी निःशुल्क दोपहर के साथ ताकि योजना वास्तविकता के संपर्क में बनी रहे।",
    inclusions: "आवास, दैनिक नाश्ता, निजी स्थानांतरण, सूचीबद्ध स्थानों के प्रवेश टिकट।",
    exclusions: "हवाई किराया, व्यक्तिगत खर्च, शामिल विवरण में नहीं दी गई कोई भी चीज़।"
  },
  ta: {
    days: "நாட்கள்",
    name: "{city} {theme} — {n} {days}",
    descHead: "{city} யை அடிப்படையாகக் கொண்ட {n}-நாள் {theme} பயணத்திட்டம்.",
    descSlowTail: "மெதுவான காலைக்காகத் திட்டமிடப்பட்டது, ஒரு முழு இலவச மதிய நேரத்துடன் திட்டம் நிஜத்துடன் ஒத்து நிற்கும்.",
    descEarlyTail: "அதிகாலையில் எழுபவர்களுக்காகத் திட்டமிடப்பட்டது, ஒரு முழு இலவச மதிய நேரத்துடன் திட்டம் நிஜத்துடன் ஒத்து நிற்கும்.",
    inclusions: "தங்குமிடம், தினசரி காலை உணவு, தனிப்பட்ட இடமாற்றங்கள், பட்டியலிடப்பட்ட இடங்களுக்கான நுழைவுச் சீட்டுகள்.",
    exclusions: "விமானக் கட்டணம், தனிப்பட்ட செலவுகள், சேர்க்கப்பட்டவற்றில் பட்டியலிடப்படாத எதுவும்."
  }
};

function byEn(list) {
  const m = new Map();
  for (const row of list) m.set(row.en.trim(), { hi: row.hi, ta: row.ta });
  return m;
}

const titleMap = byEn(seed.title);
const cityMap = byEn(seed.city);
const stateMap = byEn(seed.state);

const missing = new Set();
function pick(map, en, label) {
  const v = map.get((en ?? "").trim());
  if (!v) {
    missing.add(label);
    return null;
  }
  return v;
}

const db = new Database(dbPath, { readonly: true });
const packages = db.prepare(`
  SELECT p.package_id, p.name, p.description, p.theme, p.duration_days, c.name AS city_name, c.city_id
  FROM tour_packages p JOIN cities c ON c.city_id = p.city_id
  WHERE p.status='active'
`).all();
const components = db.prepare(`
  SELECT c.component_id, c.title FROM package_components c
  JOIN tour_packages p ON p.package_id = c.package_id
  WHERE p.status='active'
`).all();
const cities = db.prepare(`
  SELECT DISTINCT c.city_id, c.name, c.state FROM cities c
  JOIN tour_packages p ON p.city_id = c.city_id WHERE p.status='active'
`).all();
const hotels = db.prepare(`
  SELECT DISTINCT h.hotel_id, h.name FROM hotels h
  JOIN package_components c ON c.entity_id = h.hotel_id AND c.component_type='hotel'
  JOIN tour_packages p ON p.package_id = c.package_id AND p.status='active'
`).all();

const hi = {};
const ta = {};

for (const lang of ["hi", "ta"]) {
  const t = T[lang];
  const target = lang === "hi" ? hi : ta;

  for (const p of packages) {
    const cityTr = pick(cityMap, p.city_name, `city(${p.city_name})`);
    const themeL = labels.theme[p.theme]?.[lang] ?? null;
    const n = p.duration_days;

    if (cityTr && themeL) {
      const name = t.name.replace("{city}", cityTr[lang]).replace("{theme}", themeL).replace("{n}", String(n)).replace("{days}", t.days);
      target[`pkg:${p.package_id}:name`] = name;
      const tail = /early risers/.test(p.description) ? t.descEarlyTail : t.descSlowTail;
      const desc = `${t.descHead.replace("{city}", cityTr[lang]).replace("{theme}", themeL).replace("{n}", String(n))} ${tail}`;
      target[`pkg:${p.package_id}:description`] = desc;
    } else {
      if (!cityTr) missing.add(`city(${p.city_name})`);
      if (!themeL) missing.add(`themeLabel(${p.theme})`);
    }
    target[`pkg:${p.package_id}:inclusions`] = t.inclusions;
    target[`pkg:${p.package_id}:exclusions`] = t.exclusions;
  }

  for (const c of components) {
    const tr = pick(titleMap, c.title, `title(${c.title})`);
    if (tr) target[`comp:${c.component_id}`] = tr[lang];
  }

  for (const ct of cities) {
    const tr = pick(cityMap, ct.name, `city(${ct.name})`);
    if (tr) target[`cty:${ct.city_id}`] = tr[lang];
    if (ct.state) {
      const st = pick(stateMap, ct.state, `state(${ct.state})`);
      if (st) target[`ctySt:${ct.state.trim()}`] = st[lang];
    }
  }

  for (const h of hotels) {
    const tr = pick(titleMap, h.name, `hotel(${h.name})`);
    if (tr) target[`htl:${h.hotel_id}`] = tr[lang];
  }
}

db.close();
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "hi.json"), JSON.stringify(hi));
fs.writeFileSync(path.join(outDir, "ta.json"), JSON.stringify(ta));

const report = {
  packages: packages.length,
  components: components.length,
  cities: cities.length,
  hotels: hotels.length,
  hiKeys: Object.keys(hi).length,
  taKeys: Object.keys(ta).length,
  missing: Array.from(missing).sort()
};
console.log(JSON.stringify(report, null, 2));
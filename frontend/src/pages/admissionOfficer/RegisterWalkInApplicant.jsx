import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  Loader2,
  Save,
  UserPlus,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getSchools,
  getSessions,
  getTerms,
  getClassLevels,
  getDepartments,
} from "../../services/academicsService";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

/* ============================================================
   NIGERIA STATES AND LOCAL GOVERNMENT AREAS

   KEEP YOUR EXISTING NIGERIA_STATES OBJECT HERE EXACTLY
   AS YOU ALREADY HAVE IT.
   ============================================================ */

const NIGERIA_STATES = {
  Abia: [
    "Aba North",
    "Aba South",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa North",
    "Isiala Ngwa South",
    "Isuikwuato",
    "Obi Ngwa",
    "Ohafia",
    "Osisioma Ngwa",
    "Ugwunagbo",
    "Ukwa East",
    "Ukwa West",
    "Umuahia North",
    "Umuahia South",
    "Umunneochi",
  ],

  Adamawa: [
    "Demsa",
    "Fufore",
    "Ganye",
    "Girei",
    "Gombi",
    "Guyuk",
    "Hong",
    "Jada",
    "Jimeta",
    "Lamurde",
    "Madagali",
    "Maiha",
    "Mayo-Belwa",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Numan",
    "Shelleng",
    "Song",
    "Toungo",
    "Yola North",
    "Yola South",
  ],

  Akwa_Ibom: [
    "Abak",
    "Eastern Obolo",
    "Eket",
    "Esit Eket",
    "Essien Udim",
    "Etim Ekpo",
    "Etinan",
    "Ibeno",
    "Ibesikpo Asutan",
    "Ibiono Ibom",
    "Ika",
    "Ikono",
    "Ikot Abasi",
    "Ikot Ekpene",
    "Ini",
    "Itu",
    "Mbo",
    "Mkpat Enin",
    "Nsit Atai",
    "Nsit Ibom",
    "Nsit Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Oruk Anam",
    "Udung Uko",
    "Ukanafun",
    "Uruan",
    "Urue-Offong/Oruko",
    "Uyo",
  ],

  Anambra: [
    "Aguata",
    "Anambra East",
    "Anambra West",
    "Anaocha",
    "Awka North",
    "Awka South",
    "Ayamelum",
    "Dunukofia",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Njikoka",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],

  Bauchi: [
    "Bauchi",
    "Bogoro",
    "Damban",
    "Darazo",
    "Dass",
    "Gamawa",
    "Ganjuwa",
    "Giade",
    "Itas/Gadau",
    "Jama'are",
    "Katagum",
    "Kirfi",
    "Misau",
    "Ningi",
    "Shira",
    "Tafawa Balewa",
    "Toro",
    "Warji",
    "Zaki",
  ],

  Bayelsa: [
    "Brass",
    "Ekeremor",
    "Kolokuma/Opokuma",
    "Nembe",
    "Ogbia",
    "Sagbama",
    "Southern Ijaw",
    "Yenagoa",
  ],

  Benue: [
    "Ado",
    "Agatu",
    "Apa",
    "Buruku",
    "Gboko",
    "Guma",
    "Gwer East",
    "Gwer West",
    "Katsina-Ala",
    "Konshisha",
    "Kwande",
    "Logo",
    "Makurdi",
    "Obi",
    "Ogbadibo",
    "Ohimini",
    "Oju",
    "Okpokwu",
    "Oturkpo",
    "Tarka",
    "Ukum",
    "Ushongo",
    "Vandeikya",
  ],

  Borno: [
    "Abadam",
    "Askira/Uba",
    "Bama",
    "Bayo",
    "Biu",
    "Chibok",
    "Damboa",
    "Dikwa",
    "Gubio",
    "Guzamala",
    "Gwoza",
    "Hawul",
    "Jere",
    "Kaga",
    "Kala/Balge",
    "Konduga",
    "Kukawa",
    "Kwaya Kusar",
    "Mafa",
    "Magumeri",
    "Maiduguri",
    "Marte",
    "Mobbar",
    "Monguno",
    "Ngala",
    "Nganzai",
    "Shani",
  ],

  Cross_River: [
    "Abi",
    "Akamkpa",
    "Akpabuyo",
    "Bakassi",
    "Bekwarra",
    "Biase",
    "Boki",
    "Calabar Municipal",
    "Calabar South",
    "Etung",
    "Ikom",
    "Obanliku",
    "Obubra",
    "Obudu",
    "Odukpani",
    "Ogoja",
    "Yakurr",
    "Yala",
  ],

  Delta: [
    "Aniocha North",
    "Aniocha South",
    "Bomadi",
    "Burutu",
    "Ethiope East",
    "Ethiope West",
    "Ika North East",
    "Ika South",
    "Isoko North",
    "Isoko South",
    "Ndokwa East",
    "Ndokwa West",
    "Okpe",
    "Oshimili North",
    "Oshimili South",
    "Patani",
    "Sapele",
    "Udu",
    "Ughelli North",
    "Ughelli South",
    "Ukwuani",
    "Uvwie",
    "Warri North",
    "Warri South",
    "Warri South West",
  ],

  Ebonyi: [
    "Abakaliki",
    "Afikpo North",
    "Afikpo South",
    "Ebonyi",
    "Ezza North",
    "Ezza South",
    "Ikwo",
    "Ishielu",
    "Ivo",
    "Izzi",
    "Ohaukwu",
    "Ohaozara",
    "Onicha",
  ],

  Edo: [
    "Akoko-Edo",
    "Egor",
    "Esan Central",
    "Esan North-East",
    "Esan South-East",
    "Esan West",
    "Etsako Central",
    "Etsako East",
    "Etsako West",
    "Igueben",
    "Ikpoba-Okha",
    "Oredo",
    "Orhionmwon",
    "Ovia North-East",
    "Ovia South-West",
    "Owan East",
    "Owan West",
    "Uhunmwonde",
  ],

  Ekiti: [
    "Ado Ekiti",
    "Efon",
    "Ekiti East",
    "Ekiti South-West",
    "Ekiti West",
    "Emure",
    "Gbonyin",
    "Ido Osi",
    "Ijero",
    "Ikere",
    "Ikole",
    "Ilejemeje",
    "Irepodun/Ifelodun",
    "Ise/Orun",
    "Moba",
    "Oye",
  ],

  Enugu: [
    "Aninri",
    "Awgu",
    "Enugu East",
    "Enugu North",
    "Enugu South",
    "Ezeagu",
    "Igbo-Etiti",
    "Igbo-Eze North",
    "Igbo-Eze South",
    "Isi-Uzo",
    "Nkanu East",
    "Nkanu West",
    "Nsukka",
    "Oji River",
    "Udenu",
    "Udi",
    "Uzo-Uwani",
  ],

  Gombe: [
    "Akko",
    "Balanga",
    "Billiri",
    "Dukku",
    "Funakaye",
    "Gombe",
    "Kaltungo",
    "Kwami",
    "Nafada",
    "Shongom",
    "Yamaltu/Deba",
  ],

  Imo: [
    "Ahiazu Mbaise",
    "Ehime Mbano",
    "Ezinihitte",
    "Ideato North",
    "Ideato South",
    "Ihitte/Uboma",
    "Ikeduru",
    "Isiala Mbano",
    "Isu",
    "Mbaitoli",
    "Ngor Okpala",
    "Njaba",
    "Nkwerre",
    "Nwangele",
    "Obowo",
    "Oguta",
    "Ohaji/Egbema",
    "Okigwe",
    "Orlu",
    "Orsu",
    "Oru East",
    "Oru West",
    "Owerri Municipal",
    "Owerri North",
    "Owerri West",
    "Unuimo",
  ],

  Jigawa: [
    "Auyo",
    "Babura",
    "Biriniwa",
    "Birnin Kudu",
    "Buji",
    "Dutse",
    "Gagarawa",
    "Garki",
    "Gumel",
    "Guri",
    "Gwaram",
    "Gwiwa",
    "Hadejia",
    "Jahun",
    "Kafin Hausa",
    "Kaugama",
    "Kazaure",
    "Kiri Kasama",
    "Kiyawa",
    "Maigatari",
    "Malam Madori",
    "Miga",
    "Ringim",
    "Roni",
    "Sule Tankarkar",
    "Taura",
    "Yankwashi",
  ],

  Kaduna: [
    "Birnin Gwari",
    "Chikun",
    "Giwa",
    "Igabi",
    "Ikara",
    "Jaba",
    "Jema'a",
    "Kachia",
    "Kaduna North",
    "Kaduna South",
    "Kagarko",
    "Kajuru",
    "Kaura",
    "Kauru",
    "Kubau",
    "Kudan",
    "Lere",
    "Makarfi",
    "Sabon Gari",
    "Sanga",
    "Soba",
    "Zangon Kataf",
    "Zaria",
  ],

  Kano: [
    "Ajingi",
    "Albasu",
    "Bagwai",
    "Bebeji",
    "Bichi",
    "Bunkure",
    "Dala",
    "Dambatta",
    "Dawakin Kudu",
    "Dawakin Tofa",
    "Doguwa",
    "Fagge",
    "Gabasawa",
    "Garko",
    "Garun Mallam",
    "Gaya",
    "Gezawa",
    "Gwale",
    "Gwarzo",
    "Kabo",
    "Kano Municipal",
    "Karaye",
    "Kibiya",
    "Kiru",
    "Kumbotso",
    "Kunchi",
    "Kura",
    "Madobi",
    "Makoda",
    "Minjibir",
    "Nasarawa",
    "Rano",
    "Rimin Gado",
    "Rogo",
    "Shanono",
    "Sumaila",
    "Takai",
    "Tarauni",
    "Tofa",
    "Tsanyawa",
    "Tudun Wada",
    "Ungogo",
    "Warawa",
    "Wudil",
  ],

  Katsina: [
    "Bakori",
    "Batagarawa",
    "Batsari",
    "Baure",
    "Bindawa",
    "Charanchi",
    "Dan Musa",
    "Dandume",
    "Danja",
    "Daura",
    "Dutsi",
    "Dutsin-Ma",
    "Faskari",
    "Funtua",
    "Ingawa",
    "Jibia",
    "Kafur",
    "Kaita",
    "Kankara",
    "Kankia",
    "Katsina",
    "Kurfi",
    "Kusada",
    "Mai'Adua",
    "Malumfashi",
    "Mani",
    "Mashi",
    "Matazu",
    "Musawa",
    "Rimi",
    "Sabuwa",
    "Safana",
    "Sandamu",
    "Zango",
  ],

  Kebbi: [
    "Aleiro",
    "Arewa Dandi",
    "Argungu",
    "Augie",
    "Bagudo",
    "Birnin Kebbi",
    "Bunza",
    "Dandi",
    "Danko/Wasagu",
    "Fakai",
    "Gwandu",
    "Jega",
    "Kalgo",
    "Koko/Besse",
    "Maiyama",
    "Ngaski",
    "Sakaba",
    "Shanga",
    "Suru",
    "Wasagu/Danko",
    "Yauri",
    "Zuru",
  ],

  Kogi: [
    "Adavi",
    "Ajaokuta",
    "Ankpa",
    "Bassa",
    "Dekina",
    "Ibaji",
    "Idah",
    "Igalamela-Odolu",
    "Ijumu",
    "Kabba/Bunu",
    "Kogi",
    "Lokoja",
    "Mopa-Muro",
    "Ofu",
    "Ogori/Magongo",
    "Okehi",
    "Okene",
    "Olamaboro",
    "Omala",
    "Yagba East",
    "Yagba West",
  ],

  Kwara: [
    "Asa",
    "Baruten",
    "Edu",
    "Ekiti",
    "Ifelodun",
    "Ilorin East",
    "Ilorin South",
    "Ilorin West",
    "Irepodun",
    "Isin",
    "Kaiama",
    "Moro",
    "Offa",
    "Oke Ero",
    "Oyun",
    "Pategi",
  ],

  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
  ],

  Nasarawa: [
    "Akwanga",
    "Awe",
    "Doma",
    "Karu",
    "Keana",
    "Keffi",
    "Kokona",
    "Lafia",
    "Nasarawa",
    "Nasarawa Eggon",
    "Obi",
    "Toto",
    "Wamba",
  ],

  Niger: [
    "Agaie",
    "Agwara",
    "Bida",
    "Borgu",
    "Bosso",
    "Chanchaga",
    "Edati",
    "Gbako",
    "Gurara",
    "Katcha",
    "Kontagora",
    "Lapai",
    "Lavun",
    "Magama",
    "Mariga",
    "Mashegu",
    "Mokwa",
    "Munya",
    "Paikoro",
    "Rafi",
    "Rijau",
    "Shiroro",
    "Suleja",
    "Tafa",
    "Wushishi",
  ],

  Ogun: [
    "Abeokuta North",
    "Abeokuta South",
    "Ado-Odo/Ota",
    "Egbado North",
    "Egbado South",
    "Ewekoro",
    "Ifo",
    "Ijebu East",
    "Ijebu North",
    "Ijebu North East",
    "Ijebu Ode",
    "Ikenne",
    "Imeko Afon",
    "Ipokia",
    "Obafemi Owode",
    "Odeda",
    "Odogbolu",
    "Ogun Waterside",
    "Remo North",
    "Sagamu",
  ],

  Ondo: [
    "Akoko North-East",
    "Akoko North-West",
    "Akoko South-East",
    "Akoko South-West",
    "Akure North",
    "Akure South",
    "Ese Odo",
    "Idanre",
    "Ifedore",
    "Ilaje",
    "Ile Oluji/Okeigbo",
    "Irele",
    "Odigbo",
    "Okitipupa",
    "Ondo East",
    "Ondo West",
    "Ose",
    "Owo",
  ],

  Osun: [
    "Atakunmosa East",
    "Atakunmosa West",
    "Ayedaade",
    "Ayedire",
    "Boluwaduro",
    "Boripe",
    "Ede North",
    "Ede South",
    "Egbedore",
    "Ejigbo",
    "Ife Central",
    "Ife East",
    "Ife North",
    "Ife South",
    "Ifedayo",
    "Ila",
    "Ilesa East",
    "Ilesa West",
    "Irepodun",
    "Irewole",
    "Isokan",
    "Iwo",
    "Obokun",
    "Odo Otin",
    "Ola Oluwa",
    "Olorunda",
    "Oriade",
    "Orolu",
    "Osogbo",
  ],

  Oyo: [
    "Afijio",
    "Akinyele",
    "Atiba",
    "Atisbo",
    "Egbeda",
    "Ibadan North",
    "Ibadan North-East",
    "Ibadan North-West",
    "Ibadan South-East",
    "Ibadan South-West",
    "Ibarapa Central",
    "Ibarapa East",
    "Ibarapa North",
    "Ido",
    "Irepo",
    "Iseyin",
    "Itesiwaju",
    "Iwajowa",
    "Kajola",
    "Lagelu",
    "Ogbomosho North",
    "Ogbomosho South",
    "Ogo Oluwa",
    "Olorunsogo",
    "Oluyole",
    "Ona Ara",
    "Orelope",
    "Oriire",
    "Oyo East",
    "Oyo West",
    "Saki East",
    "Saki West",
    "Surulere",
  ],

  Plateau: [
    "Barkin Ladi",
    "Bassa",
    "Bokkos",
    "Jos East",
    "Jos North",
    "Jos South",
    "Kanam",
    "Kanke",
    "Langtang North",
    "Langtang South",
    "Mangu",
    "Mikang",
    "Pankshin",
    "Qua'an Pan",
    "Riyom",
    "Shendam",
    "Wase",
  ],

  Rivers: [
    "Abua/Odual",
    "Ahoada East",
    "Ahoada West",
    "Akuku-Toru",
    "Andoni",
    "Asari-Toru",
    "Bonny",
    "Degema",
    "Eleme",
    "Emohua",
    "Etche",
    "Gokana",
    "Ikwerre",
    "Khana",
    "Obio/Akpor",
    "Ogba/Egbema/Ndoni",
    "Ogu/Bolo",
    "Okrika",
    "Omuma",
    "Opobo/Nkoro",
    "Oyigbo",
    "Port Harcourt",
    "Tai",
  ],

  Sokoto: [
    "Binji",
    "Bodinga",
    "Dange Shuni",
    "Gada",
    "Goronyo",
    "Gudu",
    "Gwadabawa",
    "Illela",
    "Isa",
    "Kebbe",
    "Kware",
    "Rabah",
    "Sabon Birni",
    "Shagari",
    "Silame",
    "Sokoto North",
    "Sokoto South",
    "Tambuwal",
    "Tangaza",
    "Tureta",
    "Wamakko",
    "Wurno",
    "Yabo",
  ],

  Taraba: [
    "Ardo-Kola",
    "Bali",
    "Donga",
    "Gashaka",
    "Gassol",
    "Ibi",
    "Jalingo",
    "Karim Lamido",
    "Kumi",
    "Lau",
    "Sardauna",
    "Takum",
    "Ussa",
    "Wukari",
    "Yorro",
    "Zing",
  ],

  Yobe: [
    "Bade",
    "Bursari",
    "Damaturu",
    "Fika",
    "Fune",
    "Geidam",
    "Gujba",
    "Gulani",
    "Jakusko",
    "Karasuwa",
    "Machina",
    "Nangere",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
    "Yunusari",
    "Yusufari",
  ],

  Zamfara: [
    "Anka",
    "Bakura",
    "Birnin Magaji/Kiyaw",
    "Bukun Yum",
    "Bungudu",
    "Gummi",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Maru",
    "Shinkafi",
    "Talata Mafara",
    "Tsafe",
    "Zurmi",
  ],

  FCT: [
    "Abuja Municipal Area Council",
    "Abaji",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
  ],
};

/* ============================================================
   COUNTRIES
   ============================================================ */

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Canada",
  "Other",
];

/* ============================================================
   COMPONENT
   ============================================================ */

function RegisterWalkInApplicant() {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",

    school: "",
    academicSession: "",
    term: "",
    classLevel: "",
    department: "",

    gender: "",
    dob: "",
    admissionDate: "",
    roll: "",

    email: "",
    phone: "",
    address: "",
    previousSchool: "",

    country: "Nigeria",
    stateOfOrigin: "",
    localGovernment: "",

    bloodGroup: "",

    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianAddress: "",
  });

  /* ============================================================
     AUTH / ROLE
     ============================================================ */

  const userRole = String(user?.role || "").toUpperCase();

  const isAdmissionOfficer =
    userRole === "ADMISSION_OFFICER";

  const isSuperAdmin =
    userRole === "SUPER_ADMIN";

  /*
   * Support the possible formats returned by the
   * Django login serializer:
   *
   * user.school_id
   * user.school
   * user.school.id
   */

  const userSchoolId = useMemo(() => {
    if (!user) {
      return "";
    }

    if (user.school_id !== undefined && user.school_id !== null) {
      return String(user.school_id);
    }

    if (
      user.school &&
      typeof user.school === "object" &&
      user.school.id !== undefined &&
      user.school.id !== null
    ) {
      return String(user.school.id);
    }

    if (
      user.school !== undefined &&
      user.school !== null &&
      typeof user.school !== "object"
    ) {
      return String(user.school);
    }

    return "";
  }, [user]);

  /* ============================================================
     LOAD ACADEMIC DATA
     ============================================================ */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          schoolsData,
          sessionsData,
          termsData,
          classesData,
          departmentsData,
        ] = await Promise.all([
          getSchools(),
          getSessions(),
          getTerms(),
          getClassLevels(),
          getDepartments(),
        ]);

        if (!mounted) {
          return;
        }

        const schoolsList = Array.isArray(schoolsData)
          ? schoolsData
          : schoolsData?.results || [];

        const sessionsList = Array.isArray(sessionsData)
          ? sessionsData
          : sessionsData?.results || [];

        const termsList = Array.isArray(termsData)
          ? termsData
          : termsData?.results || [];

        const classesList = Array.isArray(classesData)
          ? classesData
          : classesData?.results || [];

        const departmentsList = Array.isArray(departmentsData)
          ? departmentsData
          : departmentsData?.results || [];

        setSchools(schoolsList);
        setSessions(sessionsList);
        setTerms(termsList);
        setClassLevels(classesList);
        setDepartments(departmentsList);

        /*
         * ========================================================
         * ADMISSION OFFICER
         * ========================================================
         *
         * The Admission Officer must work only with the school
         * assigned to their account.
         */

        if (isAdmissionOfficer) {
          if (userSchoolId) {
            setForm((previous) => ({
              ...previous,
              school: String(userSchoolId),
              academicSession: "",
              term: "",
              classLevel: "",
              department: "",
            }));
          } else if (schoolsList.length === 1) {
            /*
             * Fallback:
             * The backend may return only the officer's school.
             */

            setForm((previous) => ({
              ...previous,
              school: String(schoolsList[0].id),
              academicSession: "",
              term: "",
              classLevel: "",
              department: "",
            }));
          } else {
            setError(
              "Your account is not assigned to a school. Please contact the school administrator."
            );
          }
        }
      } catch (err) {
        console.error(err);

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Unable to load school and academic information."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [
    authLoading,
    isAdmissionOfficer,
    userSchoolId,
  ]);

  /* ============================================================
     HANDLE INPUT
     ============================================================ */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* ============================================================
     SCHOOL CHANGE
     ============================================================ */

  const handleSchoolChange = (event) => {
    /*
     * Admission Officers cannot change their school.
     */

    if (isAdmissionOfficer) {
      return;
    }

    const school = event.target.value;

    setForm((previous) => ({
      ...previous,
      school,
      academicSession: "",
      term: "",
      classLevel: "",
      department: "",
    }));

    setError("");
    setSuccess("");
  };

  /* ============================================================
     SESSION CHANGE
     ============================================================ */

  const handleSessionChange = (event) => {
    const academicSession = event.target.value;

    setForm((previous) => ({
      ...previous,
      academicSession,
      term: "",
    }));

    setError("");
    setSuccess("");
  };

  /* ============================================================
     CLASS CHANGE
     ============================================================ */

  const handleClassChange = (event) => {
    const classLevel = event.target.value;

    const selected = classLevels.find(
      (item) =>
        String(item.id) === String(classLevel)
    );

    const isSS =
      selected?.education_level === "SS";

    setForm((previous) => ({
      ...previous,
      classLevel,
      department: isSS
        ? previous.department
        : "",
    }));

    setError("");
    setSuccess("");
  };

  /* ============================================================
     COUNTRY CHANGE
     ============================================================ */

  const handleCountryChange = (event) => {
    const country = event.target.value;

    setForm((previous) => ({
      ...previous,
      country,
      stateOfOrigin: "",
      localGovernment: "",
    }));

    setError("");
    setSuccess("");
  };

  /* ============================================================
     STATE CHANGE
     ============================================================ */

  const handleStateChange = (event) => {
    const state = event.target.value;

    setForm((previous) => ({
      ...previous,
      stateOfOrigin: state,
      localGovernment: "",
    }));

    setError("");
    setSuccess("");
  };

  /* ============================================================
     AVAILABLE NIGERIAN STATES
     ============================================================ */

  const availableStates = useMemo(() => {
    if (form.country !== "Nigeria") {
      return [];
    }

    return Object.keys(NIGERIA_STATES)
      .map((state) => ({
        value: state,
        label: state.replaceAll("_", " "),
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label)
      );
  }, [form.country]);

  /* ============================================================
     AVAILABLE LGAs
     ============================================================ */

  const availableLGAs = useMemo(() => {
    if (
      form.country !== "Nigeria" ||
      !form.stateOfOrigin
    ) {
      return [];
    }

    return (
      NIGERIA_STATES[
        form.stateOfOrigin
      ] || []
    );
  }, [
    form.country,
    form.stateOfOrigin,
  ]);

  /* ============================================================
     FILTER SESSIONS BY SCHOOL
     ============================================================ */

  const filteredSessions = useMemo(() => {
    if (!form.school) {
      return [];
    }

    return sessions.filter((session) => {
      const sessionSchool =
        session.school_id ??
        session.school;

      return (
        String(sessionSchool) ===
        String(form.school)
      );
    });
  }, [
    sessions,
    form.school,
  ]);

  /* ============================================================
     FILTER CLASSES BY SCHOOL
     ============================================================ */

  const filteredClasses = useMemo(() => {
    if (!form.school) {
      return [];
    }

    return classLevels.filter((classLevel) => {
      const classSchool =
        classLevel.school_id ??
        classLevel.school;

      return (
        String(classSchool) ===
        String(form.school)
      );
    });
  }, [
    classLevels,
    form.school,
  ]);

  /* ============================================================
     FILTER DEPARTMENTS BY SCHOOL
     ============================================================ */

  const filteredDepartments = useMemo(() => {
    if (!form.school) {
      return [];
    }

    return departments.filter((department) => {
      const departmentSchool =
        department.school_id ??
        department.school;

      return (
        String(departmentSchool) ===
        String(form.school)
      );
    });
  }, [
    departments,
    form.school,
  ]);

  /* ============================================================
     FILTER TERMS BY SESSION
     ============================================================ */

  const filteredTerms = useMemo(() => {
    if (!form.academicSession) {
      return [];
    }

    return terms.filter((term) => {
      const termSession =
        term.academic_session_id ??
        term.academic_session ??
        term.academicSession;

      return (
        String(termSession) ===
        String(form.academicSession)
      );
    });
  }, [
    terms,
    form.academicSession,
  ]);

  /* ============================================================
     SELECTED CLASS
     ============================================================ */

  const selectedClass = useMemo(() => {
    return filteredClasses.find(
      (item) =>
        String(item.id) ===
        String(form.classLevel)
    );
  }, [
    filteredClasses,
    form.classLevel,
  ]);

  const isSeniorSecondary =
    selectedClass?.education_level === "SS";

  /* ============================================================
     SELECTED SCHOOL
     ============================================================ */

  const selectedSchool = useMemo(() => {
    return schools.find(
      (school) =>
        String(school.id) ===
        String(form.school)
    );
  }, [
    schools,
    form.school,
  ]);

  /* ============================================================
     IMAGE
     ============================================================ */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile image must not exceed 5MB."
      );

      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);

    setError("");
    setSuccess("");
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImageFile(null);
    setImagePreview("");
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  /* ============================================================
     VALIDATION
     ============================================================ */

  const validateForm = () => {
    if (!form.firstName.trim()) {
      return "First name is required.";
    }

    if (!form.lastName.trim()) {
      return "Last name is required.";
    }

    if (!form.school) {
      return "Please select a school.";
    }

    /*
     * Extra security check on the frontend.
     * An Admission Officer cannot submit another school ID.
     */

    if (
      isAdmissionOfficer &&
      userSchoolId &&
      String(form.school) !==
        String(userSchoolId)
    ) {
      return "You can only register applicants for your assigned school.";
    }

    if (!form.academicSession) {
      return "Please select an academic session.";
    }

    if (!form.term) {
      return "Please select a term.";
    }

    if (!form.classLevel) {
      return "Please select a class.";
    }

    if (!form.gender) {
      return "Please select gender.";
    }

    if (!form.dob) {
      return "Date of birth is required.";
    }

    if (
      isSeniorSecondary &&
      !form.department
    ) {
      return "Department is required for Senior Secondary classes.";
    }

    if (
      !isSeniorSecondary &&
      form.department
    ) {
      return "Department should not be selected for Primary or JSS classes.";
    }

    if (!form.country) {
      return "Please select a country.";
    }

    if (
      form.country === "Nigeria" &&
      !form.stateOfOrigin
    ) {
      return "Please select a state of origin.";
    }

    if (
      form.country === "Nigeria" &&
      !form.localGovernment
    ) {
      return "Please select a local government.";
    }

    return "";
  };

  /* ============================================================
     EXTRACT APPLICANT ID
     ============================================================ */

  const getApplicantId = (data) => {
    return (
      data?.id ||
      data?.applicant?.id ||
      data?.data?.id ||
      data?.applicant_id ||
      data?.applicant?.applicant_id ||
      null
    );
  };

  /* ============================================================
     SUBMIT
     ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSaving(true);

      /*
       * AuthContext stores the token in sessionStorage,
       * NOT localStorage.
       */

      const token =
        sessionStorage.getItem(
          "access_token"
        );

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const formData =
        new FormData();

      /* ========================================================
         ACADEMIC
      ======================================================== */

      formData.append(
        "school",
        form.school
      );

      formData.append(
        "academic_session",
        form.academicSession
      );

      formData.append(
        "term",
        form.term
      );

      formData.append(
        "class_level",
        form.classLevel
      );

      if (
        isSeniorSecondary &&
        form.department
      ) {
        formData.append(
          "department",
          form.department
        );
      }

      /* ========================================================
         PERSONAL
      ======================================================== */

      formData.append(
        "first_name",
        form.firstName.trim()
      );

      formData.append(
        "middle_name",
        form.middleName.trim()
      );

      formData.append(
        "last_name",
        form.lastName.trim()
      );

      formData.append(
        "date_of_birth",
        form.dob
      );

      formData.append(
        "gender",
        form.gender
      );

      formData.append(
        "blood_group",
        form.bloodGroup
      );

      /* ========================================================
         CONTACT
      ======================================================== */

      formData.append(
        "email",
        form.email.trim()
      );

      formData.append(
        "phone_number",
        form.phone.trim()
      );

      formData.append(
        "address",
        form.address.trim()
      );

      formData.append(
        "previous_school",
        form.previousSchool.trim()
      );

      /* ========================================================
         ADMISSION DETAILS
      ======================================================== */

      if (form.admissionDate) {
        formData.append(
          "admission_date",
          form.admissionDate
        );
      }

      if (form.roll) {
        formData.append(
          "roll_number",
          form.roll
        );
      }

      /* ========================================================
         LOCATION
      ======================================================== */

      formData.append(
        "nationality",
        form.country
      );

      formData.append(
        "state_of_origin",
        form.stateOfOrigin
      );

      formData.append(
        "local_government",
        form.localGovernment
      );

      /* ========================================================
         GUARDIAN
      ======================================================== */

      formData.append(
        "guardian_name",
        form.guardianName.trim()
      );

      formData.append(
        "guardian_phone",
        form.guardianPhone.trim()
      );

      formData.append(
        "guardian_email",
        form.guardianEmail.trim()
      );

      formData.append(
        "guardian_address",
        form.guardianAddress.trim()
      );

      /* ========================================================
         IMAGE
      ======================================================== */

      if (imageFile) {
        formData.append(
          "profile_image",
          imageFile
        );
      }

      /* ========================================================
         POST
      ======================================================== */

      const response =
        await fetch(
          `${API_URL}/admissions/applicants/`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body: formData,
          }
        );

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      console.log(
        "Applicant creation response:",
        data
      );

      /* ========================================================
         API ERROR
      ======================================================== */

      if (!response.ok) {
        let message =
          data?.detail ||
          data?.message ||
          "Unable to register applicant.";

        if (
          typeof data === "object" &&
          !data.detail &&
          !data.message
        ) {
          const errors = [];

          Object.entries(data).forEach(
            ([field, value]) => {
              if (
                Array.isArray(value)
              ) {
                errors.push(
                  `${field}: ${value.join(", ")}`
                );
              } else if (value) {
                errors.push(
                  `${field}: ${String(value)}`
                );
              }
            }
          );

          if (errors.length) {
            message =
              errors.join(" ");
          }
        }

        throw new Error(
          message
        );
      }

      /* ========================================================
         GET CREATED APPLICANT ID
      ======================================================== */

      const applicantId =
        getApplicantId(data);

      if (!applicantId) {
        console.error(
          "Applicant was created, but no ID was found:",
          data
        );

        throw new Error(
          "Applicant was created successfully, but the applicant ID was not returned by the server."
        );
      }

      /* ========================================================
         SUCCESS
      ======================================================== */

      setSuccess(
        "Walk-in applicant registered successfully."
      );

      setTimeout(() => {
        navigate(
          `/admission-officer/applicants/${applicantId}`,
          {
            replace: true,
          }
        );
      }, 700);
    } catch (err) {
      console.error(
        "Register applicant error:",
        err
      );

      setError(
        err?.message ||
          "Unable to register applicant."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     LOADING
     ============================================================ */

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-3xl bg-white px-6 py-5 shadow-sm dark:bg-[var(--color-card)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />

          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Loading application form...
          </span>
        </div>
      </div>
    );
  }

  /* ============================================================
     COMMON CLASSES
     ============================================================ */

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-900";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

  const disabledClass =
    "disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admission-officer/applicants"
                )
              }
              disabled={saving}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--color-card)] dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/40">
                <UserPlus className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Register Walk-in Applicant
                </h1>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Register a new applicant at the admission desk.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <X className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ===================================================
              PERSONAL INFORMATION
          ==================================================== */}

          <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter the applicant's basic personal information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <div>
                <label className={labelClass}>
                  First Name *
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Middle Name
                </label>

                <input
                  type="text"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Middle name"
                  autoComplete="additional-name"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Last Name *
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Gender *
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="MALE">
                    Male
                  </option>

                  <option value="FEMALE">
                    Female
                  </option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Date of Birth *
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Blood Group
                </label>

                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">
                    Select blood group
                  </option>

                  <option value="A+">
                    A+
                  </option>
                  <option value="A-">
                    A-
                  </option>
                  <option value="B+">
                    B+
                  </option>
                  <option value="B-">
                    B-
                  </option>
                  <option value="AB+">
                    AB+
                  </option>
                  <option value="AB-">
                    AB-
                  </option>
                  <option value="O+">
                    O+
                  </option>
                  <option value="O-">
                    O-
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* ===================================================
              PROFILE PHOTO
          ==================================================== */}

          <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Profile Photo
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Upload a profile photo. Maximum size is 5MB.
              </p>
            </div>

            <div className="flex flex-col items-center gap-5 sm:flex-row">

              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800">

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Applicant preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera className="h-10 w-10 text-slate-400" />
                )}

              </div>

              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">

                  <Camera className="h-4 w-4" />

                  Choose Photo

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="ml-3 text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

            </div>
          </section>

          {/* ===================================================
              ACADEMIC INFORMATION
          ==================================================== */}

          <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Academic Information
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Select the applicant's school and intended enrollment details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {/* SCHOOL */}

              <div>
                <label className={labelClass}>
                  School *
                </label>

                {isAdmissionOfficer ? (
                  <div
                    className={`${inputClass} flex min-h-[48px] items-center bg-slate-100 dark:bg-slate-800`}
                  >
                    {selectedSchool?.name ||
                      "Your assigned school"}
                  </div>
                ) : (
                  <select
                    name="school"
                    value={form.school}
                    onChange={handleSchoolChange}
                    className={inputClass}
                  >
                    <option value="">
                      Select school
                    </option>

                    {schools.map(
                      (school) => (
                        <option
                          key={school.id}
                          value={school.id}
                        >
                          {school.name}
                        </option>
                      )
                    )}
                  </select>
                )}

                {isAdmissionOfficer && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Your school is automatically assigned from your admission officer account.
                  </p>
                )}
              </div>

              {/* SESSION */}

              <div>
                <label className={labelClass}>
                  Academic Session *
                </label>

                <select
                  name="academicSession"
                  value={form.academicSession}
                  onChange={handleSessionChange}
                  disabled={!form.school}
                  className={`${inputClass} ${disabledClass}`}
                >
                  <option value="">
                    Select session
                  </option>

                  {filteredSessions.map(
                    (session) => (
                      <option
                        key={session.id}
                        value={session.id}
                      >
                        {session.name ||
                          session.session_name ||
                          session.title ||
                          `Session ${session.id}`}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* TERM */}

              <div>
                <label className={labelClass}>
                  Term *
                </label>

                <select
                  name="term"
                  value={form.term}
                  onChange={handleChange}
                  disabled={
                    !form.academicSession
                  }
                  className={`${inputClass} ${disabledClass}`}
                >
                  <option value="">
                    Select term
                  </option>

                  {filteredTerms.map(
                    (term) => (
                      <option
                        key={term.id}
                        value={term.id}
                      >
                        {term.name ||
                          term.term_name ||
                          term.title ||
                          `Term ${term.id}`}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* CLASS */}

              <div>
                <label className={labelClass}>
                  Class *
                </label>

                <select
                  name="classLevel"
                  value={form.classLevel}
                  onChange={handleClassChange}
                  disabled={!form.school}
                  className={`${inputClass} ${disabledClass}`}
                >
                  <option value="">
                    Select class
                  </option>

                  {filteredClasses.map(
                    (classLevel) => (
                      <option
                        key={classLevel.id}
                        value={classLevel.id}
                      >
                        {classLevel.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* DEPARTMENT */}

              <div>
                <label className={labelClass}>
                  Department
                  {isSeniorSecondary &&
                    " *"}
                </label>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  disabled={
                    !form.school ||
                    !isSeniorSecondary
                  }
                  className={`${inputClass} ${disabledClass}`}
                >
                  <option value="">
                    {isSeniorSecondary
                      ? "Select department"
                      : "Not required"}
                  </option>

                  {isSeniorSecondary &&
                    filteredDepartments.map(
                      (department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.name}
                        </option>
                      )
                    )}
                </select>
              </div>

              {/* ADMISSION DATE */}

              <div>
                <label className={labelClass}>
                  Admission Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="date"
                    name="admissionDate"
                    value={form.admissionDate}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              {/* ROLL */}

              <div>
                <label className={labelClass}>
                  Roll Number
                </label>

                <input
                  type="number"
                  name="roll"
                  value={form.roll}
                  onChange={handleChange}
                  min="1"
                  className={inputClass}
                  placeholder="Roll number"
                />
              </div>

            </div>
          </section>

          {/* ===================================================
              CONTACT INFORMATION
          ==================================================== */}

          <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Contact Information
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className={labelClass}>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="student@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="08012345678"
                  autoComplete="tel"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  placeholder="Residential address"
                  autoComplete="street-address"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Previous School
                </label>

                <input
                  type="text"
                  name="previousSchool"
                  value={form.previousSchool}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Previous school"
                />
              </div>

            </div>
          </section>

          {/* ===================================================
              ORIGIN & LOCATION
          ==================================================== */}

          <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Origin & Location
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Select the applicant's country, state and local government.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              {/* COUNTRY */}

              <div>
                <label className={labelClass}>
                  Country *
                </label>

                <select
                  name="country"
                  value={form.country}
                  onChange={handleCountryChange}
                  className={inputClass}
                >
                  <option value="">
                    Select country
                  </option>

                  {COUNTRIES.map(
                    (country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {country}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* STATE */}

              <div>
                <label className={labelClass}>
                  State / Province *
                </label>

                {form.country ===
                "Nigeria" ? (
                  <select
                    name="stateOfOrigin"
                    value={
                      form.stateOfOrigin
                    }
                    onChange={
                      handleStateChange
                    }
                    disabled={!form.country}
                    className={`${inputClass} ${disabledClass}`}
                  >
                    <option value="">
                      Select state
                    </option>

                    {availableStates.map(
                      (state) => (
                        <option
                          key={
                            state.value
                          }
                          value={
                            state.value
                          }
                        >
                          {state.label}
                        </option>
                      )
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="stateOfOrigin"
                    value={
                      form.stateOfOrigin
                    }
                    onChange={
                      handleChange
                    }
                    disabled={!form.country}
                    className={`${inputClass} ${disabledClass}`}
                    placeholder="Enter state / province"
                  />
                )}
              </div>

              {/* LGA / DISTRICT */}

              <div>
                <label className={labelClass}>
                  Local Government / District *
                </label>

                {form.country ===
                "Nigeria" ? (
                  <select
                    name="localGovernment"
                    value={
                      form.localGovernment
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      !form.stateOfOrigin
                    }
                    className={`${inputClass} ${disabledClass}`}
                  >
                    <option value="">
                      Select local government
                    </option>

                    {availableLGAs.map(
                      (lga) => (
                        <option
                          key={lga}
                          value={lga}
                        >
                          {lga}
                        </option>
                      )
                    )}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="localGovernment"
                    value={
                      form.localGovernment
                    }
                    onChange={
                      handleChange
                    }
                    disabled={!form.country}
                    className={`${inputClass} ${disabledClass}`}
                    placeholder="Enter district / local area"
                  />
                )}
              </div>

            </div>
          </section>

          {/* ===================================================
              GUARDIAN INFORMATION
          ==================================================== */}

          <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-[var(--color-card)]">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Guardian Information
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter the parent or guardian's information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className={labelClass}>
                  Guardian Name
                </label>

                <input
                  type="text"
                  name="guardianName"
                  value={
                    form.guardianName
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Guardian Phone
                </label>

                <input
                  type="tel"
                  name="guardianPhone"
                  value={
                    form.guardianPhone
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="08012345678"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Guardian Email
                </label>

                <input
                  type="email"
                  name="guardianEmail"
                  value={
                    form.guardianEmail
                  }
                  onChange={
                    handleChange
                  }
                  className={inputClass}
                  placeholder="guardian@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Guardian Address
                </label>

                <textarea
                  name="guardianAddress"
                  value={
                    form.guardianAddress
                  }
                  onChange={
                    handleChange
                  }
                  rows={3}
                  className={inputClass}
                  placeholder="Guardian residential address"
                />
              </div>

            </div>
          </section>

          {/* ===================================================
              ACTION BUTTONS
          ==================================================== */}

          <div className="mb-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admission-officer/applicants"
                )
              }
              disabled={saving}
              className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Register Applicant
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default RegisterWalkInApplicant;
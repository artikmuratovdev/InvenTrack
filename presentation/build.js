const pptxgen = require("pptxgenjs");
const React = require("react"), RDS = require("react-dom/server"), sharp = require("sharp");
const fa = require("react-icons/fa");
const SK = "C:/Users/Savitar/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/eb44084a-d234-43fe-b614-73759c50a399/0e225018-ef32-4635-9cc1-888fb8834cad/skills/pptx/scripts/apply_theme.js";
const { applyTheme } = require(SK);

const THEME = { name: "InvenTrack", headFontFace: "Cambria", bodyFontFace: "Calibri",
  colors: { dk1:"1B2B34", lt1:"FFFFFF", dk2:"0B3C49", lt2:"E8F4F3", accent1:"0E7C86", accent2:"14A3A8",
            accent3:"F2A541", accent4:"5B7C99", accent5:"C8553D", accent6:"3C9D6B", hlink:"0E7C86", folHlink:"5B7C99" } };
const P = { dark:"0B3C49", teal:"0E7C86", teal2:"14A3A8", light:"E8F4F3", amber:"F2A541", red:"C8553D", green:"3C9D6B", text:"1B2B34", mute:"5E7480", white:"FFFFFF" };

const pres = new pptxgen(); pres.layout = "LAYOUT_16x9"; pres.theme = { headFontFace:"Cambria", bodyFontFace:"Calibri" };
pres.title = "InvenTrack"; pres.author = "404 Found";

async function ic(Comp, color="FFFFFF") {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { color:"#"+color, size:256 }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox:true, margin:0, fontFace:"Calibri", color:P.text }, o));
function title(s, text, dark) { T(s, text, { x:0.6, y:0.4, w:8.8, h:0.8, fontFace:"Cambria", bold:true, fontSize:36, color: dark?P.white:P.dark, valign:"middle" }); }
async function iconCircle(s, Comp, x, y, d, bg=P.teal) {
  s.addShape(pres.shapes.OVAL, { x, y, w:d, h:d, fill:{color:bg}, line:{color:bg} });
  s.addImage({ data: await ic(Comp), x:x+d*0.25, y:y+d*0.25, w:d*0.5, h:d*0.5 });
}
const card = (s, x, y, w, h, fill=P.light) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius:0.12, fill:{color:fill}, line:{color:fill} });

function mock(s, x, y, w, h, kind) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius:0.06, fill:{color:P.white}, line:{color:"B8CED3", width:1} });
  s.addShape(pres.shapes.RECTANGLE, { x:x+0.01, y:y+0.01, w:w-0.02, h:0.22, fill:{color:P.dark}, line:{color:P.dark} });
  s.addShape(pres.shapes.RECTANGLE, { x:x+0.01, y:y+0.23, w:0.55, h:h-0.24, fill:{color:P.light}, line:{color:P.light} });
  const cx = x+0.7, cw = w-0.85, cy = y+0.4;
  if (kind==="dash") {
    for (let i=0;i<3;i++) s.addShape(pres.shapes.RECTANGLE,{x:cx+i*(cw/3),y:cy,w:cw/3-0.08,h:0.4,fill:{color:[P.teal,P.teal2,P.amber][i]},line:{color:P.white}});
    [0.5,0.9,0.7,0.4].forEach((v,i)=>s.addShape(pres.shapes.RECTANGLE,{x:cx+0.1+i*0.45,y:cy+1.45-v,w:0.3,h:v,fill:{color:P.teal},line:{color:P.teal}}));
    s.addShape(pres.shapes.OVAL,{x:cx+cw-0.95,y:cy+0.55,w:0.85,h:0.85,fill:{color:P.teal2},line:{color:P.amber,width:6}});
  } else if (kind==="list") {
    s.addShape(pres.shapes.RECTANGLE,{x:cx,y:cy,w:cw*0.6,h:0.2,fill:{color:P.light},line:{color:"B8CED3"}});
    for (let i=0;i<5;i++) { s.addShape(pres.shapes.RECTANGLE,{x:cx,y:cy+0.32+i*0.25,w:cw,h:0.2,fill:{color:i%2?P.white:P.light},line:{color:"DCE8EA"}});
      s.addShape(pres.shapes.RECTANGLE,{x:cx+cw-0.5,y:cy+0.36+i*0.25,w:0.42,h:0.12,fill:{color:[P.green,P.amber,P.teal,P.red,P.green][i]},line:{color:P.white}}); }
  } else if (kind==="card") {
    s.addShape(pres.shapes.RECTANGLE,{x:cx,y:cy,w:0.6,h:0.6,fill:{color:P.dark},line:{color:P.dark}});
    for (let i=0;i<4;i++) s.addShape(pres.shapes.RECTANGLE,{x:cx+0.75,y:cy+i*0.17,w:cw*0.4,h:0.1,fill:{color:"B8CED3"},line:{color:"B8CED3"}});
    for (let i=0;i<3;i++) { s.addShape(pres.shapes.OVAL,{x:cx,y:cy+0.8+i*0.28,w:0.14,h:0.14,fill:{color:P.teal},line:{color:P.teal}});
      s.addShape(pres.shapes.RECTANGLE,{x:cx+0.25,y:cy+0.83+i*0.28,w:cw*0.6,h:0.08,fill:{color:"B8CED3"},line:{color:"B8CED3"}}); }
  } else {
    for (let i=0;i<4;i++) { s.addShape(pres.shapes.RECTANGLE,{x:cx+(i%2)*(cw/2),y:cy+Math.floor(i/2)*0.45,w:cw/2-0.1,h:0.3,fill:{color:P.white},line:{color:"8FB0B7"}}); }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:cx,y:cy+1.05,w:0.9,h:0.28,rectRadius:0.05,fill:{color:P.teal},line:{color:P.teal}});
  }
}

(async () => {
  let s;
  // 1 Titul
  s = pres.addSlide(); s.background = { color:P.dark };
  s.addShape(pres.shapes.OVAL,{x:6.9,y:-1.2,w:4.6,h:4.6,fill:{color:P.teal},line:{color:P.teal}});
  s.addShape(pres.shapes.OVAL,{x:7.9,y:2.8,w:3,h:3,fill:{color:P.teal2},line:{color:P.teal2}});
  await iconCircle(s, fa.FaBoxes, 0.7, 0.7, 0.9, P.amber);
  T(s,"InvenTrack",{x:0.7,y:1.8,w:7,h:1,fontFace:"Cambria",bold:true,fontSize:60,color:P.white});
  T(s,"Har bir jihoz hisobda, har bir o'zgarish tarixda.",{x:0.7,y:2.9,w:7,h:0.6,fontSize:22,italic:true,color:"BFE6E4"});
  T(s,[{text:"Jamoa: 404 Found",options:{bold:true,breakLine:true}},{text:"Boynazarov N. · Artikmuratov D. · Ro’ziboyev G. · Yo’ldosheva S. · Eshnazarova F. · Tursunov A.",options:{fontSize:13}}],{x:0.7,y:4.2,w:8.6,h:0.8,fontSize:16,color:P.white});
  s.addNotes("Assalomu alaykum! Biz 404 Found jamoasimiz. Bugun sizga InvenTrack — tashkilotdagi kompyuter va texnik vositalarni elektron hisobga olish tizimini taqdim etamiz. Shiorimiz: har bir jihoz hisobda, har bir o'zgarish tarixda.");

  // 2 Muammo
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Muammo");
  const prob = [[fa.FaFileExcel,"Qog'oz va Excel","Hisob tarqoq fayllarda yuritiladi"],[fa.FaHistory,"Eskirgan ma'lumot","Kim, qayerda — noma'lum"],[fa.FaSearch,"Yo'qolgan texnika","Jihozni topish qiyin"],[fa.FaClock,"Uzoq inventarizatsiya","Haftalab qo'lda sanash"]];
  for (let i=0;i<4;i++){ const x=0.6+(i%2)*4.5, y=1.5+Math.floor(i/2)*1.9; card(s,x,y,4.2,1.6);
    await iconCircle(s,prob[i][0],x+0.25,y+0.35,0.9,P.red);
    T(s,prob[i][1],{x:x+1.4,y:y+0.35,w:2.7,h:0.45,fontSize:20,bold:true,color:P.dark});
    T(s,prob[i][2],{x:x+1.4,y:y+0.85,w:2.7,h:0.5,fontSize:14,color:P.mute}); }
  s.addNotes("Ko'pchilik tashkilotlarda jihozlar qog'oz yoki Excel'da yuritiladi. Natijada ma'lumot eskiradi, texnika yo'qoladi, inventarizatsiya esa juda ko'p vaqt oladi.");

  // 3 Maqsad
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Maqsad va yechim");
  card(s,0.6,1.5,4.2,3.2,"F6E3DE"); card(s,5.2,1.5,4.2,3.2,P.light);
  T(s,"Maqsad",{x:0.9,y:1.7,w:3.6,h:0.5,fontSize:22,bold:true,color:P.red});
  T(s,"Jihozlarni elektron hisobga olish web-tizimini yaratish",{x:0.9,y:2.3,w:3.6,h:1.6,fontSize:20,color:P.text});
  T(s,"Yechim",{x:5.5,y:1.7,w:3.6,h:0.5,fontSize:22,bold:true,color:P.teal});
  T(s,[{text:"Yagona baza",options:{bullet:true,breakLine:true}},{text:"Avtomatik inventar raqam",options:{bullet:true,breakLine:true}},{text:"To'liq o'zgarishlar tarixi",options:{bullet:true,breakLine:true}},{text:"Bir tugmada hisobot",options:{bullet:true}}],{x:5.5,y:2.3,w:3.6,h:2.2,fontSize:18,paraSpaceAfter:6});
  s.addNotes("Maqsadimiz — jihozlarni bitta web-tizimda hisobga olish. Yechim: yagona baza, avtomatik inventar raqam, to'liq tarix va tez hisobot.");

  // 4 Funksiyalar
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Asosiy funksiyalar");
  const fn = [[fa.FaPlusCircle,"Hisobga olish","Qo'shish, tahrirlash, arxivlash, INV-2026-0001"],[fa.FaMapMarkerAlt,"Joylashuv va mas'ul","Xona, bo'lim, mas'ul shaxs"],[fa.FaTools,"Holat va ta'mir","Texnik holat, ta'mir qaydlari"],[fa.FaFileExport,"Tarix va hisobot","Timeline, Excel/PDF, QR-kod"]];
  for (let i=0;i<4;i++){ const x=0.6+(i%2)*4.5, y=1.5+Math.floor(i/2)*1.9; card(s,x,y,4.2,1.6);
    await iconCircle(s,fn[i][0],x+0.25,y+0.35,0.9);
    T(s,fn[i][1],{x:x+1.4,y:y+0.3,w:2.7,h:0.45,fontSize:20,bold:true,color:P.dark});
    T(s,fn[i][2],{x:x+1.4,y:y+0.8,w:2.7,h:0.65,fontSize:14,color:P.mute}); }
  s.addNotes("Funksiyalarni to'rt guruhga ajratdik: hisobga olish, joylashuv va mas'ul, holat va ta'mir, tarix va hisobot.");

  // 5 Jihoz
  s = pres.addSlide(); s.background={color:P.dark}; title(s,"Hisobga olinadigan jihozlar",true);
  const eq = [[fa.FaDesktop,"Kompyuter"],[fa.FaTv,"Monitor"],[fa.FaPrint,"Printer"],[fa.FaVideo,"Proyektor"],[fa.FaWifi,"Router"],[fa.FaBatteryFull,"UPS"],[fa.FaLaptop,"Noutbuk"],[fa.FaPlus,"Yangi tur"]];
  for (let i=0;i<8;i++){ const x=0.8+(i%4)*2.2, y=1.6+Math.floor(i/4)*1.7;
    await iconCircle(s,eq[i][0],x+0.45,y,1.0,i===7?P.amber:P.teal);
    T(s,eq[i][1],{x:x,y:y+1.1,w:1.9,h:0.4,fontSize:16,color:P.white,align:"center"}); }
  s.addNotes("Tizim yettita asosiy jihoz turini qo'llab-quvvatlaydi. Administrator istalgan vaqtda yangi tur qo'sha oladi.");

  // 6 Jarayon
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Tizim ishlash jarayoni");
  const fl = [["Kirish","Login, rol"],["Qo'shish","INV raqam"],["Biriktirish","Xona, mas'ul"],["Yangilash","Holat, ta'mir"],["Hisobot","Excel / PDF"]];
  for (let i=0;i<5;i++){ const x=0.5+i*1.85;
    s.addShape(pres.shapes.CHEVRON,{x,y:2.0,w:1.8,h:1.2,fill:{color:i%2?P.teal2:P.teal},line:{color:P.white}});
    T(s,String(i+1),{x:x+0.45,y:2.0,w:0.9,h:1.2,fontSize:30,bold:true,color:P.white,align:"center",valign:"middle"});
    T(s,fl[i][0],{x:x,y:3.4,w:1.7,h:0.4,fontSize:18,bold:true,color:P.dark,align:"center"});
    T(s,fl[i][1],{x:x,y:3.8,w:1.7,h:0.4,fontSize:14,color:P.mute,align:"center"}); }
  s.addNotes("Jarayon: foydalanuvchi kiradi, jihoz qo'shiladi va avtomatik raqam oladi, xona va mas'ulga biriktiriladi, holati yangilanadi, oxirida hisobot olinadi. Har bir qadam tarixga yoziladi.");

  // 7 Demo
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Demo: asosiy ekranlar");
  const dm = [["dashboard.png","Dashboard"],["list.png","Jihozlar ro'yxati"],["detail.png","Jihoz kartochkasi"],["form.png","Qo'shish formasi"]];
  dm.forEach((d,i)=>{ const x=0.6+(i%2)*4.5, y=1.25+Math.floor(i/2)*2.1;
    s.addShape(pres.shapes.RECTANGLE,{x:x-0.03,y:y-0.03,w:4.26,h:1.56,fill:{color:"B8CED3"},line:{color:"B8CED3"}});
    s.addImage({path:"screenshots/"+d[0],x,y,w:4.2,h:1.5,sizing:{type:"cover",w:4.2,h:1.5}});
    T(s,d[1],{x,y:y+1.58,w:4.2,h:0.3,fontSize:13,color:P.mute,align:"center"}); });
  s.addNotes("Bu ilovaning haqiqiy skrinshotlari: dashboard, jihozlar ro'yxati, jihoz kartochkasi QR-kod va tarix bilan, hamda qo'shish formasi. Ma'lumotlar sinov uchun.");

  // 8 Tarix
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Jihoz tarixi");
  T(s,"Misol: INV-2026-0007 · Dell OptiPlex",{x:0.6,y:1.2,w:8,h:0.4,fontSize:16,color:P.mute});
  const tl = [["12.01.2026","Jihoz qo'shildi","Yangi · Omborda"],["03.02.2026","Ko'chirildi","Ombor → 204-xona"],["15.05.2026","Mas'ul o'zgardi","A. Karimov → B. Tosheva"],["20.08.2026","Ta'mirga yuborildi","Nosoz · Ta'mirda"],["02.09.2026","Ta'mirdan qaytdi","Yaxshi · Ishlatilmoqda"]];
  s.addShape(pres.shapes.LINE,{x:3.0,y:1.8,w:0,h:3.3,line:{color:P.teal,width:2}});
  tl.forEach((r,i)=>{ const y=1.75+i*0.68;
    T(s,r[0],{x:0.6,y,w:2.1,h:0.4,fontSize:14,color:P.mute,align:"right",valign:"middle"});
    s.addShape(pres.shapes.OVAL,{x:2.9,y:y+0.1,w:0.2,h:0.2,fill:{color:i===3?P.amber:P.teal},line:{color:P.white,width:2}});
    T(s,[{text:r[1]+"  ",options:{bold:true,color:P.dark}},{text:r[2],options:{color:P.mute}}],{x:3.4,y,w:5.8,h:0.4,fontSize:16,valign:"middle"}); });
  s.addNotes("Bu bitta jihozning tarixi: kim, qachon, nima o'zgargani yozilgan. Misol uchun sinov ma'lumotlari ishlatilgan. Tarix yozuvlari o'zgartirilmaydi.");

  // 9 AI

  s = pres.addSlide(); s.background={color:P.dark}; title(s,"AI yordamchi: savol bering, javob oling",true);
  card(s,0.6,1.5,5.0,3.4,"12505F");
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:2.6,y:1.7,w:2.8,h:0.6,rectRadius:0.15,fill:{color:P.teal},line:{color:P.teal}});
  T(s,"Qaysi bo'limda eng ko'p nosoz jihoz bor?",{x:2.7,y:1.7,w:2.6,h:0.6,fontSize:13,color:P.white,valign:"middle"});
  s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.8,y:2.5,w:3.6,h:1.0,rectRadius:0.15,fill:{color:P.white},line:{color:P.white}});
  T(s,"Buxgalteriya bo'limida: 4 ta nosoz jihoz, ulardan 3 tasi printer.",{x:0.95,y:2.5,w:3.3,h:1.0,fontSize:13,color:P.text,valign:"middle"});
  T(s,"Namuna savol-javob",{x:0.8,y:4.35,w:4.6,h:0.4,fontSize:11,color:"9FC9C7",italic:true});
  const aiPts=[[fa.FaComments,"Tabiiy tilda savol"],[fa.FaEye,"Faqat o'qiydi, o'zgartirmaydi"],[fa.FaSync,"Bepul modellar, zaxira zanjiri"]];
  for (let i=0;i<3;i++){ await iconCircle(s,aiPts[i][0],6.0,1.55+i*1.15,0.8,P.amber);
    T(s,aiPts[i][1],{x:7.0,y:1.55+i*1.15,w:2.5,h:0.8,fontSize:16,bold:true,color:P.white,valign:"middle"}); }
  s.addNotes("Tizimga AI yordamchi qo'shiladi: foydalanuvchi oddiy o'zbek tilida savol beradi, masalan qaysi bo'limda nosoz jihoz ko'p. Agent faqat oldindan belgilangan xavfsiz asboblarni chaqiradi, bazani o'zgartira olmaydi va foydalanuvchi roliga ko'ra ma'lumot oladi. Model OpenRouter orqali bepul modellar zanjiri bilan ishlaydi, biri javob bermasa keyingisi ishga tushadi.");

  // 10 Rollar
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Foydalanuvchi rollari");
  const rl = [[fa.FaUserShield,"Administrator","Hamma narsa: jihoz, foydalanuvchi, ma'lumotnoma",P.dark],[fa.FaUserCog,"Mas'ul shaxs","O'z jihozlarini ko'radi, holatini yangilaydi, ta'mir qayd etadi",P.teal],[fa.FaUser,"Xodim","Faqat ko'rish",P.teal2]];
  for (let i=0;i<3;i++){ const x=0.6+i*3.0; card(s,x,1.5,2.8,3.2);
    await iconCircle(s,rl[i][0],x+0.9,1.75,1.0,rl[i][3]);
    T(s,rl[i][1],{x:x+0.15,y:2.95,w:2.5,h:0.5,fontSize:20,bold:true,color:P.dark,align:"center"});
    T(s,rl[i][2],{x:x+0.2,y:3.5,w:2.4,h:1.1,fontSize:14,color:P.mute,align:"center"}); }
  s.addNotes("Uch rol: Administrator hamma narsani boshqaradi, Mas'ul shaxs o'z jihozlarini yangilaydi, Xodim faqat ko'ra oladi. Ruxsatlar serverda tekshiriladi.");

  // 11 Xavfsizlik
  s = pres.addSlide(); s.background={color:P.dark}; title(s,"Kiberxavfsizlik choralari",true);
  const sec = [[fa.FaKey,"Parollar","bcrypt bilan hash, ochiq saqlanmaydi"],[fa.FaIdBadge,"JWT kirish","Qisqa muddatli token"],[fa.FaUserLock,"Rollar nazorati","Ruxsat serverda tekshiriladi (RBAC)"],[fa.FaFilter,"Kirish tekshiruvi","Zod validatsiya, Prisma — SQL-injection yo'q"],[fa.FaShieldAlt,"Himoya sarlavhalari","Helmet, CORS, login urinishlari limiti"],[fa.FaRobot,"AI va audit","AI faqat o'qiydi, so'rovlar yoziladi; kalitlar .env'da"]];
  for (let i=0;i<6;i++){ const x=0.6+(i%3)*3.0, y=1.5+Math.floor(i/3)*1.85; card(s,x,y,2.8,1.65,"12505F");
    await iconCircle(s,sec[i][0],x+0.2,y+0.2,0.6,P.amber);
    T(s,sec[i][1],{x:x+0.95,y:y+0.2,w:1.75,h:0.6,fontSize:15,bold:true,color:P.white,valign:"middle"});
    T(s,sec[i][2],{x:x+0.2,y:y+0.95,w:2.45,h:0.65,fontSize:13,color:"CFE8E6"}); }
  s.addNotes("Xavfsizlik bo'yicha: parollar bcrypt bilan hashlanadi; JWT qisqa muddatli; ruxsatlar frontendda emas, serverda tekshiriladi; barcha kirish ma'lumotlari Zod bilan tekshiriladi, Prisma parametrlangan so'rovlar ishlatadi; Helmet, CORS va login urinishlari cheklanadi; barcha o'zgarishlar tarixga yoziladi; kalitlar kodda emas, .env faylida.");

  // 12 Texnologiyalar
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Texnologiyalar va ma'lumotlar bazasi");
  const tech = [["Frontend","React · TypeScript · Vite · Tailwind"],["Ma'lumot","TanStack Query · Recharts"],["Backend","Node.js · Express · Zod"],["Baza","PostgreSQL · Prisma ORM"],["AI","OpenRouter · bepul modellar"]];
  tech.forEach((t,i)=>{ const y=1.4+i*0.78; card(s,0.6,y,4.0,0.66);
    T(s,t[0],{x:0.8,y,w:1.2,h:0.66,fontSize:15,bold:true,color:P.teal,valign:"middle"});
    T(s,t[1],{x:1.95,y,w:2.6,h:0.66,fontSize:13,color:P.text,valign:"middle"}); });
  const tb = [["users",5.0,1.4],["departments",7.4,1.4],["rooms",7.4,2.5],["equipment",5.0,2.5],["equipment_types",5.0,3.6],["repairs",7.4,3.6],["equipment_history",6.2,4.7]];
  tb.forEach(([n,x,y])=>{ s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y,w:2.2,h:0.7,rectRadius:0.08,fill:{color:n==="equipment"?P.teal:P.dark},line:{color:P.white}});
    T(s,n,{x,y,w:2.2,h:0.7,fontSize:14,bold:true,color:P.white,align:"center",valign:"middle"}); });
  s.addNotes("Frontend React va TypeScript, backend Node.js va Express, ma'lumotlar bazasi PostgreSQL, Prisma ORM orqali. Markazda equipment jadvali, unga turlar, xonalar, ta'mirlar va tarix bog'langan.");

  // 13 Hisobot
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Inventarizatsiya hisoboti");
  const flt = ["Xona","Bo'lim","Tur","Holat"];
  flt.forEach((f,i)=>{ s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:0.6+(i%2)*1.2,y:1.5+Math.floor(i/2)*0.6,w:1.1,h:0.5,rectRadius:0.1,fill:{color:P.light},line:{color:P.teal}});
    T(s,f,{x:0.6+(i%2)*1.2,y:1.5+Math.floor(i/2)*0.6,w:1.1,h:0.5,fontSize:15,bold:true,color:P.teal,align:"center",valign:"middle"}); });
  T(s,"Filtrlang → ko'ring → yuklab oling",{x:0.6,y:2.75,w:4.4,h:0.4,fontSize:16,color:P.dark});
  s.addShape(pres.shapes.RECTANGLE,{x:5.17,y:1.47,w:4.26,h:3.26,fill:{color:"B8CED3"},line:{color:"B8CED3"}});
  s.addImage({path:"screenshots/report.png",x:5.2,y:1.5,w:4.2,h:3.2,sizing:{type:"cover",w:4.2,h:3.2}});
  await iconCircle(s,fa.FaFileExcel,0.6,3.3,0.8,P.green); T(s,"Excel (.xlsx)",{x:1.6,y:3.3,w:2.5,h:0.8,fontSize:16,bold:true,color:P.dark,valign:"middle"});
  await iconCircle(s,fa.FaFilePdf,0.6,4.2,0.8,P.red); T(s,"PDF",{x:1.6,y:4.2,w:2.5,h:0.8,fontSize:16,bold:true,color:P.dark,valign:"middle"});
  await iconCircle(s,fa.FaPrint,3.0,3.75,0.8,P.teal); T(s,"Chop etish",{x:3.9,y:3.75,w:1.2,h:0.8,fontSize:16,bold:true,color:P.dark,valign:"middle"});
  s.addNotes("Hisobotni xona, bo'lim, tur va holat bo'yicha filtrlash mumkin. Natija Excel yoki PDF'ga yuklanadi, chop etishga qulay ko'rinishi ham bor.");

  // 14 Natija
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Natija va kelajak rejalari");
  card(s,0.6,1.5,4.2,3.2); card(s,5.2,1.5,4.2,3.2,"FDF1DC");
  T(s,"Natija",{x:0.9,y:1.7,w:3.6,h:0.5,fontSize:22,bold:true,color:P.teal});
  T(s,[{text:"Yagona elektron hisob",options:{bullet:true,breakLine:true}},{text:"To'liq tarix",options:{bullet:true,breakLine:true}},{text:"Tez hisobot",options:{bullet:true,breakLine:true}},{text:"Xavfsiz kirish",options:{bullet:true,breakLine:true}},{text:"AI yordamchi",options:{bullet:true}}],{x:0.9,y:2.3,w:3.6,h:2.2,fontSize:18,paraSpaceAfter:6});
  T(s,"Kelajak",{x:5.5,y:1.7,w:3.6,h:0.5,fontSize:22,bold:true,color:"B9770E"});
  T(s,[{text:"AI: tahliliy xulosalar",options:{bullet:true,breakLine:true}},{text:"QR / shtrix-kod skaner",options:{bullet:true,breakLine:true}},{text:"Bildirishnomalar",options:{bullet:true,breakLine:true}},{text:"Mobil ilova",options:{bullet:true}}],{x:5.5,y:2.3,w:3.6,h:2.2,fontSize:18,paraSpaceAfter:6});
  s.addNotes("Natijada tashkilot jihozlarining yagona, xavfsiz va yangilanib turadigan hisobi paydo bo'ladi. Kelajakda QR skaner, bildirishnomalar va mobil ilova qo'shishni rejalashtirganmiz.");

  // 15 Jamoa
  s = pres.addSlide(); s.background={color:P.white}; title(s,"Jamoa: 404 Found");
  const tm = [
    ["Boynazarov Nurmuhammad","Project Manager","Reja, vazifalar taqsimoti, muddat va taqdimot",fa.FaTasks],
    ["Dalerbek Artikmuratov","Full-Stack va AI Engineer","Arxitektura, integratsiya, AI yordamchi",fa.FaRobot],
    ["Ro’ziboyev G’olibjon","Backend Developer","API, ma'lumotlar bazasi, xavfsizlik",fa.FaServer],
    ["Yo’ldosheva Sanobar","Frontend Developer","Interfeys, dashboard, responsive dizayn",fa.FaLaptopCode],
    ["Eshnazarova Feruza","Data Analyst","Hisobotlar, ko'rsatkichlar, ma'lumot tahlili",fa.FaChartBar],
    ["Tursunov Atham","QA va hujjatlar","Testlash, foydalanuvchi qo'llanmasi, demo ma'lumotlar",fa.FaClipboardCheck],
  ];
  for (let i=0;i<6;i++){ const x=0.6+(i%3)*3.0, y=1.4+Math.floor(i/3)*1.95; card(s,x,y,2.8,1.75);
    await iconCircle(s,tm[i][3],x+0.2,y+0.2,0.6,i%2?P.teal2:P.teal);
    T(s,tm[i][0],{x:x+0.95,y:y+0.15,w:1.75,h:0.7,fontSize:13,bold:true,color:P.dark,valign:"middle"});
    T(s,tm[i][1],{x:x+0.2,y:y+0.95,w:2.45,h:0.3,fontSize:13,bold:true,color:P.teal});
    T(s,tm[i][2],{x:x+0.2,y:y+1.25,w:2.45,h:0.45,fontSize:11,color:P.mute}); }
  s.addNotes("Jamoamiz 404 Found, olti kishidan iborat. Nurmuhammad loyihani boshqaradi, Dalerbek arxitektura va AI yordamchi ustida ishladi, G'olibjon backend va xavfsizlikni, Sanobar frontendni qurdi, Feruza hisobot va ko'rsatkichlarni tahlil qildi, Atham testlash va hujjatlarni yuritdi. Biz tizimni pilot sifatida bitta bo'limda sinab ko'rishga tayyormiz.");

  // 16 Yakun
  s = pres.addSlide(); s.background={color:P.dark};
  s.addShape(pres.shapes.OVAL,{x:-1.5,y:3.2,w:4.5,h:4.5,fill:{color:P.teal},line:{color:P.teal}});
  T(s,"E'tiboringiz uchun rahmat!",{x:0.8,y:1.6,w:8.4,h:1.0,fontFace:"Cambria",bold:true,fontSize:44,color:P.white,align:"center"});
  T(s,"Savol-javob",{x:0.8,y:2.9,w:8.4,h:0.6,fontSize:24,color:P.amber,align:"center"});
  T(s,"InvenTrack · 404 Found",{x:0.8,y:4.4,w:8.4,h:0.4,fontSize:16,color:"BFE6E4",align:"center"});
  s.addNotes("E'tiboringiz uchun rahmat! Savollaringiz bo'lsa, javob beramiz.");

  await pres.writeFile({ fileName:"S:/InvenTrack/presentation/InvenTrack-Pitch.pptx" });
  await applyTheme("S:/InvenTrack/presentation/InvenTrack-Pitch.pptx", THEME);
  console.log("ok");
})();

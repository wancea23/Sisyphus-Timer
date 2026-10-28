/* Romanian content. Camus quotes: own translation from the French original, Le Mythe de Sisyphe (1942).
   Other quotes: own translation from the editions named in the English version. */

export const Q = {
  first: 'Într-o zi însă se ivește «de ce»-ul și totul începe în această oboseală amestecată cu uimire.',
  ready: 'Îl las pe Sisif la poalele muntelui! Îți regăsești mereu povara.',
  work: [
    'Zeii îl osândiseră pe Sisif să rostogolească fără încetare o stâncă până în vârful unui munte, de unde piatra cădea înapoi sub propria-i greutate.',
    'Disprețul față de zei, ura față de moarte și patima pentru viață i-au adus acest chin de nespus, în care întreaga ființă se trudește ca să nu ducă nimic la capăt.',
    'Nu există destin care să nu poată fi învins prin dispreț.',
    'Omul absurd spune da, iar efortul lui nu va mai înceta.',
  ],
  paused: 'Acest univers, de acum fără stăpân, nu i se pare nici steril, nici zadarnic.',
  rolling: 'Fericirea și absurdul sunt doi fii ai aceluiași pământ. Sunt de nedespărțit.',
  brk: [
    'În timpul acestei întoarceri, al acestui răgaz, mă interesează Sisif.',
    'Ceasul acesta, ca o respirație, care revine la fel de sigur ca nenorocirea lui, este ceasul conștiinței.',
  ],
};

export const PROMPTS = [
  'Privește înapoi spre deal. Ce ai învățat de fapt în urcușul ăsta?',
  'A fost stânca mai grea sau mai ușoară decât te așteptai?',
  'Împingi pentru tine sau pentru cineva care te privește?',
  'Ridică-te și bea puțină apă. Stânca te așteaptă.',
  'Numește un lucru din urcușul ăsta pe care l-ai împinge din nou chiar dacă nu l-ar nota nimeni.',
];

export const GODS = [
  { gr: 'ΕΡΜΗΣ', name: 'Hermes', role: 'mesagerul zeilor', line: 'Trei notificări noi. Una dintre ele ar putea fi importantă.' },
  { gr: 'ΔΙΟΝΥΣΟΣ', name: 'Dionysos', role: 'zeul vinului și al petrecerilor', line: 'Un singur episod. Apoi înveți. Îți dau cuvântul meu.' },
  { gr: 'ΥΠΝΟΣ', name: 'Hypnos', role: 'zeul somnului', line: 'Odihnește-ți ochii un minut. Doar un minut.' },
  { gr: 'ΑΦΡΟΔΙΤΗ', name: 'Afrodita', role: 'zeița iubirii', line: 'Cineva tocmai ți-a văzut story-ul. Nu vrei să știi cine?' },
  { gr: 'ΖΕΥΣ', name: 'Zeus', role: 'regele zeilor', line: 'Grupul are 47 de mesaje necitite. Și dacă sunt despre tine?' },
  { gr: 'ΑΠΑΤΗ', name: 'Apate', role: 'duhul înșelăciunii', line: 'Materia asta o știi deja. Răsfoiește-o și gata.' },
  { gr: 'ΜΩΜΟΣ', name: 'Momos', role: 'zeul batjocurii', line: 'O să conteze examenul ăsta peste zece ani? Atunci de ce împingi?' },
  { gr: 'ΠΛΟΥΤΟΣ', name: 'Plutos', role: 'zeul bogăției', line: 'Cineva de vârsta ta a făcut avere dintr-o singură aplicație. Hai să citești cum.' },
];

export const RESP = {
  escape: { tag: 'Evadare', mood: -8, quote: 'Adevărurile zdrobitoare pier odată ce sunt recunoscute.', note: 'Camus crede că, dacă privești în altă parte, stânca rămâne la fel de grea. Devine mai ușoară abia când o privești în față.' },
  hope: { tag: 'Speranță', mood: 2, quote: 'Eschiva fatală … este speranța.', note: 'Camus numește asta saltul: pui tot sensul într-o viață de mai târziu, nu în cea pe care o trăiești acum.' },
  revolt: { tag: 'Revoltă', mood: 10, quote: 'Lupta însăși spre culmi ajunge ca să umple o inimă de om. Trebuie să ni-l închipuim pe Sisif fericit.', note: 'Acesta e răspunsul lui Camus. Fără garanții, cu ochii deschiși, iar efortul îți aparține.' },
};

export const EXAMPLES = [
  { n: 2, why: 'Ca diploma să devină o slujbă și slujba să devină o viață. Cred.', choice: 'hope', example: true },
  { n: 1, why: 'Eu am ales facultatea asta. Examenul e plictisitor, dar împinsul e al meu.', choice: 'revolt', example: true },
];

export const HEROES = [
  { id: 'sisyphus', name: 'Sisif', label: 'ΣΙΣΥΦΟΣ', chapter: 'Mitul lui Sisif', unlock: 0, gear: 'band',
    line: 'Eroul absurd. Știe că stânca se va rostogoli înapoi și totuși împinge.',
    quote: 'Lupta însăși spre culmi ajunge ca să umple o inimă de om.' },
  { id: 'donjuan', name: 'Don Juan', label: 'DON JUAN', chapter: 'Donjuanismul', unlock: 3, gear: 'hat',
    line: 'Iubește fiecare clipă pe deplin și știe că nimic nu durează. Camus vede în el pe cineva care trăiește cantitatea experienței.',
    quote: 'Dacă ar fi de ajuns să iubești, lucrurile ar fi prea simple.' },
  { id: 'actor', name: 'Actorul', label: 'ΥΠΟΚΡΙΤΗΣ', chapter: 'Comedia', unlock: 6, gear: 'mask',
    line: 'În fiecare seară altă viață, care dispare când cade cortina. Actorul alege trecătorul cu bună știință.',
    quote: 'Împărăția actorului este cea a trecătorului.' },
  { id: 'conqueror', name: 'Cuceritorul', label: 'ΣΤΡΑΤΗΓΟΣ', chapter: 'Cucerirea', unlock: 10, gear: 'helmet',
    line: 'Acționează în istorie știind că nicio victorie nu e definitivă. Contează acțiunea însăși.',
    quote: 'Cuceritorii știu că acțiunea este în sine inutilă.' },
  { id: 'creator', name: 'Creatorul', label: 'ΠΟΙΗΤΗΣ', chapter: 'Creația absurdă', unlock: 15, gear: 'wreath',
    line: 'Artistul face opere care nu explică nimic și nu durează nicăieri, și le face oricum.',
    quote: 'A crea înseamnă a trăi de două ori.' },
];

export const STANCES = {
  revolt: 'Împinge oricum', hope: 'Speranță dincolo', escape: 'Retragere', accept: 'Acceptare', duty: 'Datorie', presence: 'Prezență',
};

export const PANEL = [
  { id: 'camus', short: 'Camus', name: 'Albert Camus', school: 'Absurdism', stance: 'revolt', quote: 'Trebuie să ni-l închipuim pe Sisif fericit.',
    source: 'Mitul lui Sisif, 1942', says: 'Împinge oricum, cu ochii deschiși. Lupta e de ajuns și nu e nevoie de alt motiv.' },
  { id: 'nietzsche', short: 'Nietzsche', name: 'Friedrich Nietzsche', school: 'Amor fati', stance: 'revolt',
    quote: 'Formula mea pentru măreția omului este amor fati: să nu vrei nimic altfel, nici înainte, nici înapoi, în toată veșnicia.',
    source: 'Ecce Homo, 1888', says: 'Ai împinge exact stânca asta din nou, la nesfârșit? Atunci iubește-o, fiecare pas.' },
  { id: 'kierkegaard', short: 'Kierkegaard', name: 'Søren Kierkegaard', school: 'Existențialism creștin', stance: 'hope', quote: 'Fără risc nu există credință.',
    source: 'Post-scriptum final neștiințific, 1846', says: 'Sensul se află dincolo de munte și ajungi la el printr-un salt al credinței. Camus numește asta saltul și îl refuză.' },
  { id: 'marcus', short: 'Marcus', name: 'Marcus Aurelius', school: 'Stoicism', stance: 'accept', quote: 'Piedica din calea acțiunii împinge acțiunea înainte. Ce stă în cale devine calea.',
    source: 'Meditații 5.20', says: 'Stânca nu îți stă în cale. Ea este calea. Fă-ți partea bine și lasă rezultatul în pace.' },
  { id: 'epicurus', short: 'Epicur', name: 'Epicur', school: 'Epicureism', stance: 'escape', quote: 'Trăiește neobservat.',
    source: 'Fragment, transmis de Plutarh', says: 'De ce să urci pentru glorie? Ține-ți nevoile mici, prietenii aproape și evită durerea inutilă.' },
  { id: 'confucius', short: 'Confucius', name: 'Confucius', school: 'Confucianism', stance: 'duty',
    quote: 'Dacă mai lipsește un singur coș de pământ ca să termin lucrarea și mă opresc, oprirea este fapta mea.',
    source: 'Analecte 9.18', says: 'Învățatul e ca ridicarea unei movile, coș cu coș. Fiecare coș contează, iar oprirea e alegerea ta.' },
  { id: 'zen', short: 'Zen', name: 'Budismul zen', school: 'Zen', stance: 'presence', quote: 'Înainte de iluminare: tai lemne, cari apă. După iluminare: tai lemne, cari apă.',
    source: 'Zicală zen tradițională', says: 'Stânca nu se schimbă. Atenția ta, da. Fii pe deplin aici, la pasul ăsta.' },
];

export const TROPHIES = [
  { id: 'first', gl: 'Α', name: 'Primul urcuș', desc: 'Împinge un bolovan până în vârf.' },
  { id: 'ten', gl: 'Β', name: 'Zece culmi', desc: 'Împinge 10 bolovani.' },
  { id: 'fifty', gl: 'Γ', name: 'Mitul cel lung', desc: 'Împinge 50 de bolovani.' },
  { id: 'pantheon', gl: 'Δ', name: 'Disprețuiește panteonul', desc: 'Disprețuiește toți cei 8 zei cel puțin o dată.' },
  { id: 'unmoved', gl: 'Ε', name: 'Neclintit', desc: 'Termină un bolovan fără să cedezi nicio dată.' },
  { id: 'revolt3', gl: 'Ζ', name: 'Revoltă lucidă', desc: 'Alege revolta de 3 ori la rând.' },
  { id: 'descent', gl: 'Η', name: 'Ceasul conștiinței', desc: 'Parcurge o coborâre întreagă fără s-o sari.' },
  { id: 'night', gl: 'Θ', name: 'Muntele plin de noapte', desc: 'Termină un bolovan între 22:00 și 04:00.' },
  { id: 'dawn', gl: 'Ι', name: 'Zorii cu degete trandafirii', desc: 'Începe un bolovan între 04:00 și 07:00.' },
  { id: 'carver', gl: 'Κ', name: 'Cioplitorul în piatră', desc: 'Scrie 5 răspunsuri.' },
  { id: 'happy', gl: 'Λ', name: 'Trebuie să ni-l închipuim', desc: 'Fă-l pe Sisif fericit.' },
  { id: 'deep', gl: 'Μ', name: 'Muncă profundă', desc: 'Termină un bolovan de 50 de minute sau mai mult.' },
  { id: 'chorus', gl: 'Ν', name: 'Corul', desc: 'Găzduiește o clasă sau intră într-una.' },
  { id: 'heroes', gl: 'Ξ', name: 'Toți eroii absurzi', desc: 'Deblochează toți cei cinci eroi.' },
  { id: 'streak', gl: 'Ο', name: 'În fiecare zi, stânca', desc: 'Împinge 3 zile la rând.' },
];

export const CLASS_VERDICT = {
  revolt: 'Clasa împinge oricum. Camus ar fi mândru.',
  hope: 'Clasa mizează pe mai târziu. Camus numește asta saltul.',
  escape: 'Clasa privește în altă parte. Stânca e tot acolo.',
  none: 'Așteptăm primele răspunsuri.',
};

/* Testul viziunilor: șapte situații din viața de student. Fiecare răspuns aparține uneia dintre cele șapte viziuni din PANEL. */
export const QUIZ = [
  { q: 'Ai învățat toată săptămâna și ai luat 5 din 10 la examen. Ce-ți trece prin cap?', a: {
    camus: 'Nota e absurdă. Dau următorul examen oricum, cu ochii deschiși.',
    nietzsche: 'Și nota asta face parte din povestea mea. N-aș șterge-o.',
    kierkegaard: 'Încă nu văd motivul, dar am încredere că există unul.',
    marcus: 'Nota nu depindea de mine. Pregătirea depindea, și o să mă pregătesc mai bine.',
    epicurus: 'Nu merită să-mi pierd somnul. Diseară ies cu prietenii.',
    confucius: 'Le datorez familiei și profesorilor să fac mai bine data viitoare.',
    zen: 'S-a terminat. Acum există doar următoarea pagină de citit.' } },
  { q: 'A treia sesiune. Aceeași bibliotecă, aceeași cafea, aceeași panică. Cum o vezi?', a: {
    camus: 'Nu se termină niciodată, și e în regulă. Împinsul în sine e de ajuns.',
    nietzsche: 'Dacă ar trebui să trăiesc exact sesiunea asta la nesfârșit, aș vrea să spun da.',
    kierkegaard: 'E o încercare. Ceva de dincolo de ea o face să merite.',
    marcus: 'Sesiunile fac parte din drumul pe care l-am ales. Îmi fac partea și mă plâng mai puțin.',
    epicurus: 'Țin totul simplu: trec examenele, dorm bine, sar peste stresul inutil.',
    confucius: 'Fiecare sesiune e încă un coș de pământ pe movilă. Nu mă opresc.',
    zen: 'Aceeași bibliotecă, dar niciodată aceeași clipă. Încerc să fiu cu adevărat acolo.' } },
  { q: 'Un prieten spune: „Nimic din toate astea nu contează. Peste o sută de ani vom fi toți morți.” Tu răspunzi:', a: {
    camus: 'Exact. Nu vine nimeni să-i dea un sens, așa că trăitul depinde de noi.',
    nietzsche: 'Atunci fă din fiecare zi una pe care ai vrea s-o repeți la nesfârșit.',
    kierkegaard: 'Poate nu în lumea asta. Eu cred că contează dincolo de ea.',
    marcus: 'Totul trece. Așa că fă-ți bine treaba de azi și nu te agăța de ea.',
    epicurus: 'Atunci de ce să ne facem griji? Moartea nu e nimic pentru noi. Hai la o cină liniștită.',
    confucius: 'Contează pentru oamenii din jurul nostru acum: părinți, prieteni, cei pe care îi învățăm.',
    zen: 'Peste o sută de ani e doar un gând. Conversația asta e reală.' } },
  { q: 'Proiect de grup. Doi colegi n-au făcut nimic, iar termenul e mâine.', a: {
    camus: 'E nedrept și nimeni n-o să repare asta. Îl termin oricum, în felul meu.',
    nietzsche: 'Fac din el ceva cu care să mă mândresc. Lenea lor nu-mi stabilește standardul.',
    kierkegaard: 'Fac tot ce pot și am încredere că până la urmă se va face dreptate.',
    marcus: 'Alegerile lor nu depind de mine. Partea mea o fac bine și calm.',
    epicurus: 'Fac ce mă ține liniștit. Nu merită o noapte de furie.',
    confucius: 'Un grup merge când fiecare își ține rolul. Vorbesc cu ei, apoi îmi fac partea.',
    zen: 'Nu mai repet cearta în minte și scriu următorul paragraf.' } },
  { q: 'Cineva te întreabă: „De fapt, de ce înveți asta?”', a: {
    camus: 'Nu există un motiv măreț. Am ales asta, și e de ajuns.',
    nietzsche: 'Ca să devin ceea ce sunt.',
    kierkegaard: 'Simt că sunt chemat spre asta, chiar și când nu pot explica de ce.',
    marcus: 'Ca să fiu util. E rolul meu și vreau să-l joc bine.',
    epicurus: 'Pentru o viață liniștită și simplă mai târziu. Nu pentru prestigiu.',
    confucius: 'Ca să-mi onorez familia și să-i servesc pe alții cu ce învăț.',
    zen: 'Sincer? Când sunt prins în ea, nu mă întreb de ce.' } },
  { q: 'Duminică seara. Săptămâna care vine arată exact ca ultima.', a: {
    camus: 'Aceeași stâncă din nou. Faptul că știu asta nu mă oprește. Mă eliberează.',
    nietzsche: 'Să vină. Aș alege din nou săptămâna asta, cu fiecare luni al ei.',
    kierkegaard: 'Sper că duce undeva unde încă nu văd.',
    marcus: 'Planific ce pot controla și accept restul.',
    epicurus: 'Plănuiesc o masă bună, o plimbare lungă și o seară cu prietenii.',
    confucius: 'Îmi fac o rutină mică și o respect. Disciplina e o formă de respect.',
    zen: 'Nu mă uit la toată săptămâna. Luni dimineață e de ajuns.' } },
  { q: 'Ajungi în sfârșit în vârf: diploma luată, slujba visată. Și apoi?', a: {
    camus: 'Sigur încă o stâncă. Urcușul a fost ideea, nu vârful.',
    nietzsche: 'Urc mai sus și mă depășesc din nou.',
    kierkegaard: 'Nici vârful nu mă va umple. Doar ceva dincolo de el.',
    marcus: 'Rămân modest. Vârfurile vin și pleacă, caracterul rămâne.',
    epicurus: 'Cobor de pe munte și mă bucur de o grădină liniștită.',
    confucius: 'Mă întorc și îi ajut pe cei care urcă în urma mea.',
    zen: 'Tai lemne, cari apă.' } },
];

/* Ce spune fiecare rezultat despre tine și care dintre cei șapte te-ar contrazice. */
export const WORLDVIEW = {
  camus: { you: 'Nu ai nevoie ca stânca să însemne ceva. Împingi cu ochii deschiși, iar efortul în sine e de ajuns.',
    rival: 'kierkegaard', why: 'Ar spune că te-ai oprit cu un pas înainte de credință. Camus numește pasul acela saltul și îl refuză.' },
  nietzsche: { you: 'Nu doar accepți stânca, ci o vrei. Să spui da la tot, inclusiv la părțile plictisitoare, e felul tău de a fi puternic.',
    rival: 'marcus', why: 'Te-ar întreba de ce trebuie să iubești soarta. S-o accepți calm îți cere mult mai puțin.' },
  kierkegaard: { you: 'Bănuiești că sensul se află dincolo de munte și ești gata să faci saltul spre el fără dovezi.',
    rival: 'camus', why: 'L-a citit atent pe Kierkegaard și a numit saltul sinucidere filozofică: o fugă de absurd în loc de o viață cu el.' },
  marcus: { you: 'Împarți lumea în ce depinde de tine și ce nu, și îți faci partea bine, fără dramă.',
    rival: 'epicurus', why: 'Te-ar întreba de ce cari atâta datorie. O viață liniștită printre prieteni cere mult mai puțină.' },
  epicurus: { you: 'Îți păstrezi nevoile mici și prietenii aproape. De ce să urci pentru glorie când o grădină liniștită e de ajuns?',
    rival: 'marcus', why: 'Ar spune că îi datorezi lumii munca ta și că o viață bună nu e o retragere din ea.' },
  confucius: { you: 'Împingi pentru oamenii din jurul tău. Învățatul e o datorie și o practică, ridicată coș cu coș.',
    rival: 'epicurus', why: 'Ți-ar spune să trăiești neobservat: datoria și reputația sunt poveri de care nu ai nevoie.' },
  zen: { you: 'Nu întrebi ce înseamnă stânca. Îți dai toată atenția pasului ăstuia, apoi următorului.',
    rival: 'kierkegaard', why: 'Ar spune că această clipă nu e de ajuns și că sinele are nevoie de ceva dincolo de ea.' },
};

/* Language: English pages live at the root, Romanian pages under /ro/. The page's <html lang> decides.
   UI strings built in JavaScript come from here; page text is written directly in each page. */

export const LANG = document.documentElement.lang === 'ro' ? 'ro' : 'en';
export const LOCALE = LANG === 'ro' ? 'ro-RO' : 'en-GB';

/* Send people to their language: a saved choice first, then a browser set to Romanian. Embedded pages never move. */
(function routeLanguage() {
  if (/[?&]embed=/.test(location.search)) return;
  const sw = document.querySelector('a[data-lang-switch]');
  if (!sw) return;
  let pref = null;
  try { pref = JSON.parse(localStorage.getItem('sisyphus.lang')); } catch (e) { pref = null; }
  if (!pref) {
    const first = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    if (/^ro(-|$)/i.test(first)) pref = 'ro';
  }
  if (pref && pref !== LANG) { location.replace(sw.href.split('#')[0].split('?')[0] + location.search + location.hash); return; }
  sw.addEventListener('click', () => {
    try { localStorage.setItem('sisyphus.lang', JSON.stringify(sw.getAttribute('hreflang'))); } catch (e) { /* storage blocked */ }
    sw.href = sw.href.split('?')[0] + location.search + location.hash;
  });
})();

const DICT = {
  en: {
    'q.o': '“', 'q.c': '”',
    'mood.despairing': 'despairing', 'mood.weary': 'weary', 'mood.lucid': 'lucid', 'mood.content': 'content', 'mood.happy': 'happy',
    'chip': 'Sisyphus is <b>{w}</b>',
    'ready.label': 'At the foot of the mountain · Boulder {n}',
    'work.label': 'Pushing · Boulder {n}', 'work.paused': 'Leaning on the rock · Paused',
    'roll.label': 'Boulder {n} rolls back down',
    'break.label': 'The descent · The hour of consciousness', 'break.paused': 'The descent · Paused',
    'btn.push': 'Push the boulder', 'btn.pause': 'Pause', 'btn.resume': 'Resume', 'btn.abandon': 'Abandon',
    'btn.abandonConfirm': 'Click again to abandon', 'btn.skip': 'Skip the descent',
    'voice.from': 'From the panel',
    'title.base': 'The Sisyphus Timer', 'title.pushing': '{t} · Pushing', 'title.descent': '{t} · The descent', 'title.reflect': 'At the bottom again',
    'timer.left': '{t} left',
    'god.announce': '{name} tempts you. {line} Press S to scorn or Y to give in.',
    'god.yield': 'You looked. There was nothing there. The boulder slipped back {t}.', 'god.yield0': 'You looked. There was nothing there.',
    'god.scorn': 'You scorned {name}. The rock keeps moving.', 'god.ignored': 'You ignored {name}. That counts as scorn.',
    'abandoned': 'You walked away. The rock rolled back to the bottom on its own.',
    'hero.new': 'New hero unlocked: {name}. Pick it on the Heroes page.',
    'reflect.no': 'Boulder {n} is back at the bottom', 'reflect.share': 'Also send my answer to class {code} (no name attached)',
    'strict.slip': 'You left the mountain for {a}. The boulder slipped back {b}.',
    'amb.later': 'Ambience starts when the timer runs.',
    'erase': 'Erase the myth', 'erase.confirm': 'Click again to erase', 'erased': 'Erased',
    'notify.workTitle': 'The boulder reached the top', 'notify.workBody': 'Time to answer: why are you pushing it?',
    'notify.breakTitle': 'The descent is over', 'notify.breakBody': 'The rock is waiting at the foot of the mountain.',
    'notify.on': 'You will get a notification when time is up.', 'notify.denied': 'Notifications are blocked for this site. Allow them in the browser settings.',
    'notify.unsupported': 'This browser cannot show notifications.',
    'gaveIn.one': 'Gave in once', 'gaveIn.other': 'Gave in {n} times',
    'insc.one': '1 inscription', 'insc.other': '{n} inscriptions',
    'journal.counts': '{c} · Revolt {r} · Hope {h} · Escape {e}',
    'journal.empty': 'Your answers appear here after your first boulder. The two below are examples.',
    'example': 'Example', 'boulderN': 'Boulder {n}', 'noAnswer': 'No answer carved this time.',
    'exp.title': 'THE SISYPHUS TIMER: INSCRIPTIONS', 'exp.stats': 'Boulders: {b} · On the mountain: {t} · Sisyphus is {w}',
    'exp.counts': 'Revolt {r} · Hope {h} · Escape {e}', 'exp.none': '(no answer carved)', 'exp.file': 'sisyphus-inscriptions-',
    'copied': 'Inscriptions copied. Paste them anywhere.', 'copyFail': 'Copy did not work in this browser. Use Download instead.',
    'hero.from': 'From “{c}”', 'hero.locked': 'Unlocks after {n} boulders', 'hero.on': 'Carrying the rock', 'hero.takes': '{name} takes the rock.',
    'trophy.one': 'Trophy painted: {names}.', 'trophy.many': 'Trophies painted: {names}.', 'trophy.announce': 'New trophy: {names}',
    'trophy.count': '{n} of {m} painted', 'unlocked': 'Unlocked', 'locked': 'Locked',
    'days.one': '1 day', 'days.other': '{n} days', 'boulders.one': '1 boulder', 'boulders.other': '{n} boulders',
    'cal.day': '{date}: {b}', 'cal.note': 'Streak: {s} · {a} on the mountain',
    'panel.to': 'To Sisyphus:', 'allies.with': 'Standing with you:', 'allies.against': 'Arguing back:',
    'breath.0': 'Breathe in', 'breath.1': 'Hold', 'breath.2': 'Breathe out', 'breath.3': 'Hold',
    'pill.pushing': 'Pushing', 'pill.descent': 'The descent', 'pill.paused': 'Paused', 'pill.up': 'Time is up · Back to the rock', 'pill.waiting': 'The rock is waiting for you',
    'cls.badCode': 'Codes are 4 letters, like KTRM.', 'cls.noServer': 'The class server did not answer. Check your connection.',
    'cls.sent': 'Sent to class {code}.', 'cls.info': 'Class {code} · Round {r}', 'cls.ended': 'That class has ended.',
    'cls.newRound': 'New round. You can answer again.', 'cls.joining': 'Joining…', 'cls.joined': 'You joined class {code}.',
    'cls.opening': 'Opening a class…', 'cls.resume': 'Return to class {code}', 'cls.tie': 'The class is split. That is the absurd too.',
    'cls.wallEmpty': 'Written answers will appear here.', 'cls.hide': 'Hide', 'cls.hideAria': 'Hide this answer',
    'cls.expired': 'That class has expired. Start a new one.', 'cls.qrAria': 'QR code to join the class',
    'cls.showAnswers': 'Show answers', 'cls.hideAnswers': 'Hide answers', 'cls.roundStarted': 'New round. Everyone can answer again.',
    'cls.closed': 'Class closed. Its results disappear within 12 hours.', 'cls.sentStatus': 'Sent. You can change your answer until the next round.',
    'cls.left': 'You left the class.', 'cls.noData': 'No results yet. Wait for the first answers.',
    'cls.csvSaved': 'Results saved as {f}.', 'cls.copied': 'Summary copied. Paste it into your report.',
    'cls.sum': 'Class {code}, round {r}: {n} answers, {p} people present.', 'cls.sumLine': '{tag}: {n} ({pct}%)',
    'cls.sumAnswers': 'Written answers:', 'csv.head': 'choice,answer,time',
    'csv.class': 'class', 'csv.round': 'round', 'csv.people': 'people present', 'csv.answers': 'answers',
    'err.not_configured': 'Class mode is not set up on this server.', 'err.bad_code': 'That room code is not valid.',
    'err.not_found': 'No class with that code. Check the code on the projector.', 'err.server': 'The class server had a problem. Try again in a moment.',
    'err.rate': 'Too many requests from this network. Wait a minute and try again.', 'err.devices': 'Too many devices from this network have joined this class.',
    'err.full': 'This round is full.', 'err.host_only': 'Only the host can do that.',
    'quiz.of': 'Situation {i} of {n}', 'quiz.back': 'Back', 'quiz.next': 'Next', 'quiz.finish': 'See my worldview',
    'quiz.who': 'The one who would push your rock', 'quiz.close': 'Close behind:', 'quiz.mixAria': 'Your answers by worldview', 'quiz.again': 'Take it again',
    'quiz.classHint': 'Want the whole room to take it? Start a class on the <a href="class.html">Class</a> page and switch it to the worldview test.',
    'sv.few': 'Push a few boulders on the timer, then come back. The test will compare what you say here with what you do on the mountain.',
    'sv.fact': 'you chose {tag} {n} times out of {total}.',
    'sv.cannot': 'The timer only asks about escape, hope and revolt, so it cannot check {name} directly. On the mountain {fact}',
    'sv.same': 'On the mountain you act the same way: {fact} You live what you answered.',
    'sv.diff': 'But on the mountain {fact} Camus would ask which of the two is really you: the one who answers, or the one who pushes.',
    'cls.infoTest': ' · Worldview test', 'cls.testSent': 'Sent. If you take it again, your new result replaces this one.',
    'cls.testNow': 'The class is taking the worldview test now.', 'cls.testWaiting': 'Waiting for the first results.',
    'cls.testSplit': 'The class is split between {names}. Let them argue it out.', 'cls.testTop': 'The class sounds most like {name}. {foe} would argue back.',
    'cls.and': ' and ', 'cls.titleRock': 'Why are you pushing it?', 'cls.titleTest': 'Who would push your rock?',
    'cls.modeTest': 'Worldview test', 'cls.modeRock': 'Back to the rock', 'cls.votesAnswers': 'answers', 'cls.votesResults': 'results',
    'cls.testStarted': 'Worldview test started. Phones switch within a few seconds.', 'cls.rockAgain': 'Back to the rock. Everyone can answer again.',
    'cls.sumTest': 'Class {code}, round {r} (worldview test): {n} results, {p} people present.',
    'err.wrong_mode': 'This round asks a different question. Reload the class page.',
    'card.brand': 'THE SISYPHUS TIMER', 'card.title': 'My myth so far', 'card.boulder': 'BOULDER', 'card.boulders': 'BOULDERS',
    'card.mountain': 'ON THE MOUNTAIN', 'card.gods': 'GODS SCORNED', 'card.mood': 'Sisyphus is {w}.',
    'card.answer': 'My answer to: why are you pushing it?', 'card.hero': '{name}, in Camus’ “{chapter}”',
    'card.footer': 'Trophies {g} of {m}  ·  Streak {s}  ·  Hero: {h}', 'card.saved': 'Card saved as {f}.',
    'card.fail': 'This browser could not draw the card.', 'card.shareTitle': 'My Sisyphus myth',
  },
  ro: {
    'q.o': '„', 'q.c': '”',
    'mood.despairing': 'disperat', 'mood.weary': 'obosit', 'mood.lucid': 'lucid', 'mood.content': 'mulțumit', 'mood.happy': 'fericit',
    'chip': 'Sisif e <b>{w}</b>',
    'ready.label': 'La poalele muntelui · Bolovanul {n}',
    'work.label': 'Împingi · Bolovanul {n}', 'work.paused': 'Sprijinit de stâncă · Pauză',
    'roll.label': 'Bolovanul {n} se rostogolește înapoi',
    'break.label': 'Coborârea · Ceasul conștiinței', 'break.paused': 'Coborârea · Pauză',
    'btn.push': 'Împinge bolovanul', 'btn.pause': 'Pauză', 'btn.resume': 'Continuă', 'btn.abandon': 'Renunță',
    'btn.abandonConfirm': 'Apasă din nou ca să renunți', 'btn.skip': 'Sari peste coborâre',
    'voice.from': 'Din panel',
    'title.base': 'Cronometrul lui Sisif', 'title.pushing': '{t} · Împingi', 'title.descent': '{t} · Coborârea', 'title.reflect': 'Din nou jos',
    'timer.left': 'mai sunt {t}',
    'god.announce': '{name} te ispitește. {line} Apasă S ca să disprețuiești ispita sau Y ca să cedezi.',
    'god.yield': 'Te-ai uitat. Nu era nimic acolo. Bolovanul a alunecat înapoi {t}.', 'god.yield0': 'Te-ai uitat. Nu era nimic acolo.',
    'god.scorn': 'Dispreț pentru {name}. Stânca merge mai departe.', 'god.ignored': 'Ai lăsat ispita să treacă ({name}). Contează ca dispreț.',
    'abandoned': 'Ai plecat. Stânca s-a rostogolit singură înapoi jos.',
    'hero.new': 'Erou nou deblocat: {name}. Îl alegi pe pagina Eroi.',
    'reflect.no': 'Bolovanul {n} e din nou jos', 'reflect.share': 'Trimite răspunsul și clasei {code} (fără nume)',
    'strict.slip': 'Ai lipsit de pe munte {a}. Bolovanul a alunecat înapoi {b}.',
    'amb.later': 'Ambianța pornește când merge cronometrul.',
    'erase': 'Șterge mitul', 'erase.confirm': 'Apasă din nou ca să ștergi', 'erased': 'Șters',
    'notify.workTitle': 'Bolovanul a ajuns în vârf', 'notify.workBody': 'E timpul să răspunzi: de ce îl împingi?',
    'notify.breakTitle': 'Coborârea s-a terminat', 'notify.breakBody': 'Stânca te așteaptă la poalele muntelui.',
    'notify.on': 'Vei primi o notificare când expiră timpul.', 'notify.denied': 'Notificările sunt blocate pentru acest site. Permite-le din setările browserului.',
    'notify.unsupported': 'Acest browser nu poate afișa notificări.',
    'gaveIn.one': 'Ai cedat o dată', 'gaveIn.other': 'Ai cedat de {n} {de}ori',
    'insc.one': 'o inscripție', 'insc.other': '{n} {de}inscripții',
    'journal.counts': '{c} · Revoltă {r} · Speranță {h} · Evadare {e}',
    'journal.empty': 'Răspunsurile tale apar aici după primul bolovan. Cele două de mai jos sunt exemple.',
    'example': 'Exemplu', 'boulderN': 'Bolovanul {n}', 'noAnswer': 'Niciun răspuns de data asta.',
    'exp.title': 'CRONOMETRUL LUI SISIF: INSCRIPȚII', 'exp.stats': 'Bolovani: {b} · Pe munte: {t} · Sisif e {w}',
    'exp.counts': 'Revoltă {r} · Speranță {h} · Evadare {e}', 'exp.none': '(fără răspuns)', 'exp.file': 'sisif-inscriptii-',
    'copied': 'Inscripții copiate. Le poți lipi oriunde.', 'copyFail': 'Copierea nu a mers în acest browser. Folosește descărcarea.',
    'hero.from': 'Din „{c}”', 'hero.locked': 'Se deblochează după {n} {de}bolovani', 'hero.on': 'Duce stânca', 'hero.takes': '{name} preia stânca.',
    'trophy.one': 'Trofeu pictat: {names}.', 'trophy.many': 'Trofee pictate: {names}.', 'trophy.announce': 'Trofeu nou: {names}',
    'trophy.count': '{n} din {m} pictate', 'unlocked': 'Deblocat', 'locked': 'Blocat',
    'days.one': 'o zi', 'days.other': '{n} {de}zile', 'boulders.one': 'un bolovan', 'boulders.other': '{n} {de}bolovani',
    'cal.day': '{date}: {b}', 'cal.note': 'Serie: {s} · {a} pe munte',
    'panel.to': 'Lui Sisif:', 'allies.with': 'De partea ta:', 'allies.against': 'Te contrazice:',
    'breath.0': 'Inspiră', 'breath.1': 'Ține aerul', 'breath.2': 'Expiră', 'breath.3': 'Ține',
    'pill.pushing': 'Împingi', 'pill.descent': 'Coborârea', 'pill.paused': 'Pauză', 'pill.up': 'Timpul a expirat · Înapoi la stâncă', 'pill.waiting': 'Stânca te așteaptă',
    'cls.badCode': 'Codul are 4 litere, de exemplu KTRM.', 'cls.noServer': 'Serverul clasei nu a răspuns. Verifică conexiunea.',
    'cls.sent': 'Trimis clasei {code}.', 'cls.info': 'Clasa {code} · Runda {r}', 'cls.ended': 'Clasa s-a încheiat.',
    'cls.newRound': 'Rundă nouă. Poți răspunde din nou.', 'cls.joining': 'Intri…', 'cls.joined': 'Ai intrat în clasa {code}.',
    'cls.opening': 'Se deschide clasa…', 'cls.resume': 'Înapoi la clasa {code}', 'cls.tie': 'Clasa e împărțită. Și asta e absurdul.',
    'cls.wallEmpty': 'Răspunsurile scrise vor apărea aici.', 'cls.hide': 'Ascunde', 'cls.hideAria': 'Ascunde acest răspuns',
    'cls.expired': 'Clasa a expirat. Pornește una nouă.', 'cls.qrAria': 'Cod QR pentru a intra în clasă',
    'cls.showAnswers': 'Arată răspunsurile', 'cls.hideAnswers': 'Ascunde răspunsurile', 'cls.roundStarted': 'Rundă nouă. Toată lumea poate răspunde din nou.',
    'cls.closed': 'Clasa s-a închis. Rezultatele dispar în cel mult 12 ore.', 'cls.sentStatus': 'Trimis. Îți poți schimba răspunsul până la runda următoare.',
    'cls.left': 'Ai ieșit din clasă.', 'cls.noData': 'Încă nu sunt rezultate. Așteaptă primele răspunsuri.',
    'cls.csvSaved': 'Rezultatele au fost salvate ca {f}.', 'cls.copied': 'Rezumat copiat. Îl poți lipi în referat.',
    'cls.sum': 'Clasa {code}, runda {r}: {n} răspunsuri, {p} persoane prezente.', 'cls.sumLine': '{tag}: {n} ({pct}%)',
    'cls.sumAnswers': 'Răspunsuri scrise:', 'csv.head': 'alegere,răspuns,ora',
    'csv.class': 'clasa', 'csv.round': 'runda', 'csv.people': 'persoane prezente', 'csv.answers': 'răspunsuri',
    'err.not_configured': 'Modul clasă nu este configurat pe acest server.', 'err.bad_code': 'Codul clasei nu este valid.',
    'err.not_found': 'Nu există o clasă cu acest cod. Verifică codul de pe proiector.', 'err.server': 'Serverul clasei a avut o problemă. Încearcă din nou peste o clipă.',
    'err.rate': 'Prea multe cereri din această rețea. Așteaptă un minut și încearcă din nou.', 'err.devices': 'Prea multe dispozitive din această rețea au intrat în clasă.',
    'err.full': 'Runda aceasta e plină.', 'err.host_only': 'Doar gazda poate face asta.',
    'quiz.of': 'Situația {i} din {n}', 'quiz.back': 'Înapoi', 'quiz.next': 'Mai departe', 'quiz.finish': 'Arată-mi viziunea',
    'quiz.who': 'Cel care ți-ar împinge stânca', 'quiz.close': 'Urmează de aproape:', 'quiz.mixAria': 'Răspunsurile tale pe viziuni', 'quiz.again': 'Dă-l din nou',
    'quiz.classHint': 'Vrei ca toată sala să-l dea? Pornește o clasă pe pagina <a href="class.html">Clasa</a> și trece-o pe testul viziunilor.',
    'sv.few': 'Împinge câțiva bolovani pe cronometru, apoi revino. Testul va compara ce spui aici cu ce faci pe munte.',
    'sv.fact': 'ai ales {tag} în {n} din {total} cazuri.',
    'sv.cannot': 'Cronometrul întreabă doar despre evadare, speranță și revoltă, așa că nu-l poate verifica direct pe {name}. Pe munte {fact}',
    'sv.same': 'Pe munte te porți la fel: {fact} Trăiești ce ai răspuns.',
    'sv.diff': 'Dar pe munte {fact} Camus ar întreba care dintre cei doi ești cu adevărat: cel care răspunde sau cel care împinge.',
    'cls.infoTest': ' · Testul viziunilor', 'cls.testSent': 'Trimis. Dacă îl dai din nou, noul rezultat îl înlocuiește pe acesta.',
    'cls.testNow': 'Clasa dă acum testul viziunilor.', 'cls.testWaiting': 'Așteptăm primele rezultate.',
    'cls.testSplit': 'Clasa e împărțită între {names}. Lăsați-i să dezbată.', 'cls.testTop': 'Clasa seamănă cel mai mult cu {name}. {foe} ar contrazice-o.',
    'cls.and': ' și ', 'cls.titleRock': 'De ce îl împingi?', 'cls.titleTest': 'Cine ți-ar împinge stânca?',
    'cls.modeTest': 'Testul viziunilor', 'cls.modeRock': 'Înapoi la stâncă', 'cls.votesAnswers': 'răspunsuri', 'cls.votesResults': 'rezultate',
    'cls.testStarted': 'Testul viziunilor a pornit. Telefoanele trec pe el în câteva secunde.', 'cls.rockAgain': 'Înapoi la stâncă. Toată lumea poate răspunde din nou.',
    'cls.sumTest': 'Clasa {code}, runda {r} (testul viziunilor): {n} rezultate, {p} persoane prezente.',
    'err.wrong_mode': 'Runda aceasta are altă întrebare. Reîncarcă pagina clasei.',
    'card.brand': 'CRONOMETRUL LUI SISIF', 'card.title': 'Mitul meu de până acum', 'card.boulder': 'BOLOVAN', 'card.boulders': 'BOLOVANI',
    'card.mountain': 'PE MUNTE', 'card.gods': 'ZEI DISPREȚUIȚI', 'card.mood': 'Sisif e {w}.',
    'card.answer': 'Răspunsul meu la: de ce îl împingi?', 'card.hero': '{name}, în „{chapter}” de Camus',
    'card.footer': 'Trofee {g} din {m}  ·  Serie {s}  ·  Erou: {h}', 'card.saved': 'Cardul a fost salvat ca {f}.',
    'card.fail': 'Acest browser nu a putut desena cardul.', 'card.shareTitle': 'Mitul meu Sisif',
  },
};

export function t(key, vars) {
  let s = DICT[LANG][key];
  if (s == null) s = DICT.en[key];
  if (s == null) return key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return s;
}

/* Counted phrases. Romanian puts "de" before numbers from 20 up: "20 de zile", but "101 zile". */
export function cnt(n, base, vars) {
  const de = LANG === 'ro' && n !== 0 && (n % 100 === 0 || n % 100 >= 20) ? 'de ' : '';
  return t(base + (n === 1 ? '.one' : '.other'), Object.assign({ n, de }, vars || {}));
}

export const quoted = (s) => t('q.o') + s + t('q.c');

import * as vscode from 'vscode';
import * as os from 'os';

export interface LocaleStrings {
  brandName: string;
  tabCat: string;
  tabStats: string;
  petHint: string;
  focusTitle: string;
  minutesShort: string;
  secondsShort: string;
  hoursShort: string;
  catHappiness: string;
  onTrack: string;
  postponedTimes: (count: number) => string;
  breakOngoing: string;
  breakSubtitle: string;
  btnTakeBreak: string;
  btnSnooze: string;
  btnReset: string;
  btnFinishBreak: string;
  btnResetStats: string;
  statTodayBreak: string;
  statWorkTime: string;
  statLongestSession: string;
  statLove: string;
  statTotalBreak: string;
  statTotalHours: string;
  statRecordSession: string;
  statPostponeCount: string;
  overallStatsTitle: string;
  historyTableTitle: string;
  noHistoryText: string;
  tableDate: string;
  tableBreak: string;
  tableWork: string;
  tableLongest: string;
  tablePostpone: string;
  soundOn: string;
  soundOff: string;
  sleepToggle: string;
  resumeToggle: string;
  
  // Status bar
  statusPaused: string;
  statusBreak: string;
  statusIdle: string;
  statusBreakTime: string;
  statusApproaching: string;
  statusFocused: string;
  statusHappy: string;
  
  // QuickPick & Notifications
  qpBreak5: string;
  qpBreak10: string;
  qpBreak15: string;
  qpPlaceholder: string;
  btnNotificationBreak: string;
  btnNotificationSnooze: string;
  btnNotificationStats: string;
  msgBreakFinished: string;
  msgSnoozed: (min: number) => string;
  msgReset: string;
  msgPaused: string;
  msgResumed: string;
  msgStatsReset: string;
  
  // Message pools
  messagesHappy: string[];
  messagesSleepy: string[];
  messagesGrumpy: string[];
  messagesBreak: string[];
  messagesLove: string[];
  messagesPaused: string[];
}

const TR: LocaleStrings = {
  brandName: "Kahve Kedisi",
  tabCat: "Kedi",
  tabStats: "Mola Karnesi",
  petHint: "Sev",
  focusTitle: "Kesintisiz Odaklanma",
  minutesShort: "dk",
  secondsShort: "sn",
  hoursShort: "s",
  catHappiness: "Kedi Mutluluğu",
  onTrack: "Hedefe uygun",
  postponedTimes: (n) => `${n} kez ertelendi`,
  breakOngoing: "MOLA DEVAM EDİYOR",
  breakSubtitle: "Derin nefes al, kahveni yudumla ve omuzlarını gevşet.",
  btnTakeBreak: "Şimdi Kahve Molası Ver",
  btnSnooze: "5 Dk Daha (Ertele)",
  btnReset: "Sayacı Sıfırla",
  btnFinishBreak: "Molayı Bitir & Kodlamaya Dön",
  btnResetStats: "İstatistikleri Sıfırla",
  statTodayBreak: "Mola",
  statWorkTime: "Çalışma",
  statLongestSession: "En Uzun",
  statLove: "Sevgi",
  statTotalBreak: "Toplam Mola",
  statTotalHours: "Toplam Saat",
  statRecordSession: "Rekor Seans",
  statPostponeCount: "Erteleme",
  overallStatsTitle: "Genel Başarı Tablosu",
  historyTableTitle: "Son Günlerin Mola Karnesi",
  noHistoryText: "Henüz geçmiş gün kaydı bulunmuyor. Düzenli mola verdikçe burası dolacak.",
  tableDate: "Tarih",
  tableBreak: "Mola",
  tableWork: "Çalışma",
  tableLongest: "En Uzun",
  tablePostpone: "Erteleme",
  soundOn: "Ses Açık",
  soundOff: "Ses Kapalı",
  sleepToggle: "Kediyi Uyut / Duraklat",
  resumeToggle: "Kediyi Uyandır / Devam Et",
  
  statusPaused: "Kedi Dinleniyor (Duraklatıldı)",
  statusBreak: "Mola",
  statusIdle: "Kedi Uyuyor (Boşta)",
  statusBreakTime: "Mola Vakti!",
  statusApproaching: "Kahve Kedisi",
  statusFocused: "Kahve Kedisi",
  statusHappy: "Kahve Kedisi",
  
  qpBreak5: "5 Dakika Kahve Molası",
  qpBreak10: "10 Dakika Dinlenme",
  qpBreak15: "15 Dakika Uzun Mola ve Yürüyüş",
  qpPlaceholder: "Kaç dakika mola vermek istersin?",
  btnNotificationBreak: "5 Dk Mola Ver",
  btnNotificationSnooze: "5 Dk Ertele",
  btnNotificationStats: "Mola Karnesi",
  msgBreakFinished: "Molanız tamamlandı! Harika bir enerjiyle kodlamaya hazır mısınız?",
  msgSnoozed: (min) => `Mola ${min} dakika ertelendi. Kedi seni izlemeye devam ediyor.`,
  msgReset: "Kahve Kedisi: Çalışma sayacı sıfırlandı.",
  msgPaused: "Kahve Kedisi duraklatıldı. Kedi mışıl mışıl dinleniyor.",
  msgResumed: "Kahve Kedisi devam ediyor. Kedi uyandı ve sana odaklandı!",
  msgStatsReset: "Kahve Kedisi: İstatistikler sıfırlandı.",
  
  messagesHappy: [
    "Miyav, harika bir odaklanma seansıydı. Şimdi bir fincan kahveyi hak ettin.",
    "Gözlerini ekrandan 20 saniye uzaklaştırıp uzaklara bakmaya ne dersin? Patilerim sağlığını düşünüyor.",
    "Temiz kod, dinlenmiş bir zihinle yazılır. Ufak bir kahve molası verelim mi?",
    "Miyav! Şöyle bir gerinip omuzlarını rahatlat, kahve kokusu havada dolaşıyor.",
    "Kodların harika akıyor ama bedenin de bir molayı hak ediyor. Hadi biraz su veya kahve al.",
    "Bugün çok verimlisin! Kısa bir mola, zihnini tazeleyip hataları önceden görmeni sağlar."
  ],
  messagesSleepy: [
    "Esneme sesimi duydun mu? Bence ikimizin de göz kapakları ağırlaşmaya başladı.",
    "Miyav... Ekran ışığı gözlerini yormuş olmalı. Klavyeyi 5 dakikalığına bana bırakıp dinlen.",
    "Dikkat süresi tükendi uyarısı! Kodlar birbirine karışmadan önce bir nefes alalım mı?",
    "Göz kırpma sayın azaldı miyav. Sırtını dikleştir, derin bir nefes al ve biraz uzaklaş.",
    "Kahven bittiyse yenileme vakti, enerjin bittiyse dinlenme vakti."
  ],
  messagesGrumpy: [
    "Yine mi 'şu fonksiyonu bitireyim kalkıyorum' dedin? Klavyenin üstüne oturmam an meselesi.",
    "Bak bu ertelediğin kaçıncı mola oldu. Hatalar yorgun geliştiricileri çok sever, benden söylemesi.",
    "Kuyruğumu sinirle sallıyorum şu an. O sandalyeden kalkmazsan 'git push --force' yaparım! (Şaka şaka... belki)",
    "Miyav dedim, kahve dedim, dinlen dedim... Hâlâ kod yazıyorsun! Beni dinlemezsen farenin kablosunu ısırırım.",
    "Söz vermiştin 5 dakika önce kalkacaktın. Sağlığın koddan daha önemli geliştirici insan."
  ],
  messagesBreak: [
    "İşte bu! Şimdi arkana yaslan, kahveni yudumla ve dinlenmenin tadını çıkar.",
    "Mırrr... Dinlenen zihin, en karmaşık algoritmaları bile tereyağından kıl çeker gibi çözer.",
    "Pencereni açıp temiz havayı içine çek. Gözlerin ve boynun sana teşekkür edecek.",
    "Patiler havaya! Gerinme ve esneme hareketi yapıyoruz: 1, 2, 3... Mırrr."
  ],
  messagesLove: [
    "Mırrrrrr... (Kedi mutluluktan mırlıyor ve kafasını eline sürtüyor)",
    "Patilerimle dizine masaj yapıyorum. En sevdiğim geliştirici sensin.",
    "Miyav! Sevgi seviyesi %100 doldu, enerji tazelendi.",
    "Karnımı sevmek tehlikelidir ama sana özel izin veriyorum miyav.",
    "Mırrr... Bu ilgi kod yazma kalitesini artırır (Kedi Enstitüsü onaylı)."
  ],
  messagesPaused: [
    "Zzz... Kedi şekerleme yapıyor. İstediğin zaman 'Devam Et' diyerek sayacı başlatabilirsin.",
    "Mırrr... Dinlenme modundayım. Kodlamaya hazır olduğunda beni uyandırabilirsin."
  ]
};

const EN: LocaleStrings = {
  brandName: "Coffee Cat",
  tabCat: "Cat",
  tabStats: "Break Report",
  petHint: "Pet",
  focusTitle: "Continuous Focus",
  minutesShort: "m",
  secondsShort: "s",
  hoursShort: "h",
  catHappiness: "Cat Happiness",
  onTrack: "On track",
  postponedTimes: (n) => `Snoozed ${n} time(s)`,
  breakOngoing: "BREAK IN PROGRESS",
  breakSubtitle: "Take a deep breath, sip your coffee and relax your shoulders.",
  btnTakeBreak: "Take a Coffee Break Now",
  btnSnooze: "5 More Mins (Snooze)",
  btnReset: "Reset Timer",
  btnFinishBreak: "Finish Break & Return to Code",
  btnResetStats: "Reset Statistics",
  statTodayBreak: "Breaks",
  statWorkTime: "Focus Time",
  statLongestSession: "Longest",
  statLove: "Love",
  statTotalBreak: "Total Breaks",
  statTotalHours: "Total Hours",
  statRecordSession: "Record Session",
  statPostponeCount: "Snoozes",
  overallStatsTitle: "Lifetime Achievements",
  historyTableTitle: "Recent Days Break History",
  noHistoryText: "No past records yet. Keep coding and taking regular breaks!",
  tableDate: "Date",
  tableBreak: "Breaks",
  tableWork: "Focus",
  tableLongest: "Longest",
  tablePostpone: "Snoozes",
  soundOn: "Sound On",
  soundOff: "Sound Off",
  sleepToggle: "Sleep / Pause Cat",
  resumeToggle: "Wake Up / Resume Cat",
  
  statusPaused: "Cat is Resting (Paused)",
  statusBreak: "Break",
  statusIdle: "Cat Sleeping (Idle)",
  statusBreakTime: "Break Time!",
  statusApproaching: "Coffee Cat",
  statusFocused: "Coffee Cat",
  statusHappy: "Coffee Cat",
  
  qpBreak5: "5 Minutes Coffee Break",
  qpBreak10: "10 Minutes Rest",
  qpBreak15: "15 Minutes Long Walk & Stretch",
  qpPlaceholder: "How many minutes would you like to rest?",
  btnNotificationBreak: "Take 5 Min Break",
  btnNotificationSnooze: "Snooze 5 Min",
  btnNotificationStats: "Break Report",
  msgBreakFinished: "Break finished! Ready to code with fresh energy?",
  msgSnoozed: (min) => `Break postponed by ${min} minutes. The cat is watching you closely.`,
  msgReset: "Coffee Cat: Work timer has been reset.",
  msgPaused: "Coffee Cat is paused and resting peacefully.",
  msgResumed: "Coffee Cat resumed. The cat is awake and watching your code!",
  msgStatsReset: "Coffee Cat: Statistics have been reset.",
  
  messagesHappy: [
    "Meow! That was a great focus session. You earned a nice cup of coffee.",
    "How about looking away from the screen for 20 seconds? My paws care about your eyes.",
    "Clean code comes from a well-rested mind. Shall we take a quick coffee break?",
    "Meow! Stretch your back, take a breath, the aroma of coffee is in the air.",
    "Your code is flowing smoothly, but your body needs a break too. Grab some water or coffee.",
    "Super productive session! A short pause keeps bugs away and keeps you sharp."
  ],
  messagesSleepy: [
    "Did you hear me yawn? I think both of our eyelids are getting heavy.",
    "Meow... The screen glare must be tiring. Leave the keyboard to me for 5 minutes and rest.",
    "Attention span alert! Let us take a breather before code gets tangled.",
    "You are blinking less often, meow. Sit straight, take a deep breath and step away.",
    "If your coffee is empty, time for a refill; if your energy is empty, time for a rest."
  ],
  messagesGrumpy: [
    "Did you say 'just one more function' again? Sitting on your keyboard in 3, 2, 1...",
    "Look at how many times you postponed this break. Bugs love tired developers, just saying!",
    "My tail is twitching aggressively right now. Take a break or I might run 'git push --force'!",
    "I said meow, I said coffee, I said rest... and you are still typing! Do not make me bite the mouse wire.",
    "You promised you would get up 5 minutes ago. Your health matters more than code, human developer."
  ],
  messagesBreak: [
    "That is the spirit! Lean back, sip your beverage and enjoy the restful moments.",
    "Purrr... A refreshed mind solves the trickiest algorithms effortlessly.",
    "Open the window and breathe in the fresh air. Your neck and eyes will thank you.",
    "Paws up! Stretching time: 1, 2, 3... Purrr!"
  ],
  messagesLove: [
    "Purrrrrr... (The cat purrs joyfully and rubs its head against your hand)",
    "I am kneading your lap with my paws. You are my favorite developer!",
    "Meow! Love meter is at 100%, energy restored!",
    "Belly rubs are usually dangerous, but I grant you special permission today.",
    "Purrr... This affection increases typing speed and focus by 20% (Certified Cat Institute)."
  ],
  messagesPaused: [
    "Zzz... Cat is taking a peaceful nap. Click 'Resume' whenever you are ready.",
    "Purrr... I am resting. Wake me up when you want to start tracking work again."
  ]
};

const ES: LocaleStrings = {
  ...EN,
  brandName: "Gato del Café",
  tabCat: "Gato",
  tabStats: "Informe",
  petHint: "Acariciar",
  focusTitle: "Enfoque Continuo",
  minutesShort: "min",
  secondsShort: "s",
  hoursShort: "h",
  catHappiness: "Felicidad del Gato",
  onTrack: "En camino",
  postponedTimes: (n) => `Pospuesto ${n} vez/veces`,
  breakOngoing: "PAUSA EN CURSO",
  breakSubtitle: "Respira hondo, toma tu café y relaja los hombros.",
  btnTakeBreak: "Tomar Pausa para Café Ahora",
  btnSnooze: "5 Min Más (Posponer)",
  btnReset: "Reiniciar Temporizador",
  btnFinishBreak: "Terminar Pausa y Volver al Código",
  btnResetStats: "Reiniciar Estadísticas",
  statTodayBreak: "Pausas",
  statWorkTime: "Trabajo",
  statLongestSession: "Más Larga",
  statLove: "Amor",
  statTotalBreak: "Pausas Totales",
  statTotalHours: "Horas Totales",
  statRecordSession: "Sesión Récord",
  statPostponeCount: "Pospuestas",
  overallStatsTitle: "Logros Históricos",
  historyTableTitle: "Historial de Pausas Recientes",
  tableDate: "Fecha",
  tableBreak: "Pausas",
  tableWork: "Trabajo",
  tableLongest: "Más Larga",
  tablePostpone: "Pospuestas",
  soundOn: "Sonido Activado",
  soundOff: "Sonido Silenciado",
  sleepToggle: "Dormir / Pausar Gato",
  resumeToggle: "Despertar / Reanudar Gato",
  statusPaused: "Gato Descansando (Pausado)",
  statusBreak: "Pausa",
  statusIdle: "Gato Durmiendo (Inactivo)",
  statusBreakTime: "¡Hora de la Pausa!",
  statusApproaching: "Gato del Café",
  statusFocused: "Gato del Café",
  statusHappy: "Gato del Café",
  qpBreak5: "5 Minutos de Pausa para Café",
  qpBreak10: "10 Minutos de Descanso",
  qpBreak15: "15 Minutos de Paseo y Estiramiento",
  qpPlaceholder: "¿Cuántos minutos te gustaría descansar?",
  btnNotificationBreak: "Tomar 5 Min",
  btnNotificationSnooze: "Posponer 5 Min",
  btnNotificationStats: "Informe",
  msgBreakFinished: "¡Pausa terminada! ¿Listo para programar con energía renovada?",
  msgSnoozed: (min) => `Pausa pospuesta ${min} minutos. El gato te está observando.`,
  msgReset: "Gato del Café: Temporizador reiniciado.",
  msgPaused: "Gato del Café pausado. El gato está descansando.",
  msgResumed: "Gato del Café reanudado. ¡El gato está despierto!",
  msgStatsReset: "Gato del Café: Estadísticas reiniciadas.",
  messagesHappy: [
    "¡Miau! Gran sesión de enfoque. Te has ganado un buen café.",
    "¿Qué tal mirar lejos de la pantalla 20 segundos? Mis patitas cuidan tu salud.",
    "El código limpio viene de una mente descansada. ¿Hacemos una pausa para el café?",
    "¡Miau! Estira la espalda y respira, huele a café recién hecho."
  ],
  messagesSleepy: [
    "¿Escuchaste mi bostezo? Creo que a los dos nos pesan los párpados.",
    "Miau... La pantalla cansa los ojos. Déjame el teclado 5 minutos y descansa."
  ],
  messagesGrumpy: [
    "¿Dijiste 'solo una función más'? Me sentaré en tu teclado ahora mismo.",
    "Mira cuántas veces pospusiste la pausa. ¡A los bugs les encantan los programadores cansados!"
  ],
  messagesBreak: [
    "¡Así se hace! Recuéstate, bebe tu café y disfruta del descanso.",
    "Purrr... Una mente descansada resuelve cualquier algoritmo fácilmente."
  ],
  messagesLove: [
    "Purrrrrr... (El gato ronronea felizmente)",
    "Te estoy amasando con mis patitas. ¡Eres mi programador favorito!"
  ],
  messagesPaused: [
    "Zzz... El gato está durmiendo la siesta. Haz clic en 'Reanudar' cuando estés listo.",
    "Purrr... Modo de descanso activado."
  ]
};

const DE: LocaleStrings = {
  ...EN,
  brandName: "Kaffee-Katze",
  tabCat: "Katze",
  tabStats: "Pausenbericht",
  petHint: "Streicheln",
  focusTitle: "Fokuszeit",
  minutesShort: "Min",
  secondsShort: "s",
  hoursShort: "Std",
  catHappiness: "Katzen-Zufriedenheit",
  onTrack: "Im Plan",
  postponedTimes: (n) => `${n} Mal verschoben`,
  breakOngoing: "PAUSE LÄUFT",
  breakSubtitle: "Atme tief durch, nimm einen Schluck Kaffee und entspanne dich.",
  btnTakeBreak: "Jetzt Kaffeepause machen",
  btnSnooze: "5 Min Aufschieben",
  btnReset: "Timer zurücksetzen",
  btnFinishBreak: "Pause beenden & weiterprogrammieren",
  btnResetStats: "Statistiken zurücksetzen",
  statTodayBreak: "Pausen",
  statWorkTime: "Arbeitszeit",
  statLongestSession: "Längste",
  statLove: "Liebe",
  statTotalBreak: "Gesamtpausen",
  statTotalHours: "Gesamtstunden",
  statRecordSession: "Rekord-Fokus",
  statPostponeCount: "Verschoben",
  overallStatsTitle: "Gesamterfolge",
  historyTableTitle: "Pausenverlauf",
  tableDate: "Datum",
  tableBreak: "Pausen",
  tableWork: "Arbeit",
  tableLongest: "Längste",
  tablePostpone: "Verschoben",
  soundOn: "Ton An",
  soundOff: "Ton Aus",
  sleepToggle: "Katze schlafen legen / Pausieren",
  resumeToggle: "Katze aufwecken / Fortsetzen",
  statusPaused: "Katze ruht sich aus (Pausiert)",
  statusBreak: "Pause",
  statusIdle: "Katze schläft (Untätig)",
  statusBreakTime: "Pausenzeit!",
  statusApproaching: "Kaffee-Katze",
  statusFocused: "Kaffee-Katze",
  statusHappy: "Kaffee-Katze",
  qpBreak5: "5 Minuten Kaffeepause",
  qpBreak10: "10 Minuten Erholung",
  qpBreak15: "15 Minuten Spaziergang & Dehnen",
  qpPlaceholder: "Wie viele Minuten möchtest du Pause machen?",
  btnNotificationBreak: "5 Min Pause",
  btnNotificationSnooze: "5 Min Später",
  btnNotificationStats: "Pausenbericht",
  msgBreakFinished: "Pause beendet! Bereit mit frischer Energie zu coden?",
  msgSnoozed: (min) => `Pause um ${min} Minuten verschoben. Die Katze behält dich im Auge.`,
  msgReset: "Kaffee-Katze: Timer zurückgesetzt.",
  msgPaused: "Kaffee-Katze pausiert. Die Katze ruht sich aus.",
  msgResumed: "Kaffee-Katze fortgesetzt. Die Katze ist wach!",
  msgStatsReset: "Kaffee-Katze: Statistiken zurückgesetzt.",
  messagesPaused: [
    "Zzz... Die Katze macht ein Nickerchen. Klicke auf 'Fortsetzen', wenn du bereit bist.",
    "Purrr... Ruhemodus aktiv."
  ]
};

const JA: LocaleStrings = {
  ...EN,
  brandName: "コーヒー猫",
  tabCat: "猫ちゃん",
  tabStats: "休憩レポート",
  petHint: "なでる",
  focusTitle: "集中時間",
  minutesShort: "分",
  secondsShort: "秒",
  hoursShort: "時間",
  catHappiness: "猫の幸福度",
  onTrack: "順調です",
  postponedTimes: (n) => `${n}回延期`,
  breakOngoing: "休憩中",
  breakSubtitle: "深呼吸して、コーヒーを飲んでリラックスしましょう。",
  btnTakeBreak: "今すぐコーヒー休憩",
  btnSnooze: "あと5分（スヌーズ）",
  btnReset: "タイマーリセット",
  btnFinishBreak: "休憩終了・コードに戻る",
  btnResetStats: "統計をリセット",
  statTodayBreak: "本日の休憩",
  statWorkTime: "作業時間",
  statLongestSession: "最長集中",
  statLove: "愛情度",
  statTotalBreak: "累計休憩",
  statTotalHours: "累計時間",
  statRecordSession: "最長記録",
  statPostponeCount: "延期回数",
  overallStatsTitle: "全体の実績",
  historyTableTitle: "最近の休憩履歴",
  tableDate: "日付",
  tableBreak: "休憩",
  tableWork: "作業",
  tableLongest: "最長",
  tablePostpone: "延期",
  soundOn: "音声オン",
  soundOff: "音声オフ",
  sleepToggle: "猫をお休みさせる / 一時停止",
  resumeToggle: "猫を起こす / 再開する",
  statusPaused: "猫はお休み中（一時停止）",
  statusBreak: "休憩中",
  statusIdle: "猫は居眠り中（アイドル）",
  statusBreakTime: "休憩の時間です！",
  statusApproaching: "コーヒー猫",
  statusFocused: "コーヒー猫",
  statusHappy: "コーヒー猫",
  qpBreak5: "5分間のコーヒー休憩",
  qpBreak10: "10分間のリフレッシュ",
  qpBreak15: "15分間のストレッチ＆散歩",
  qpPlaceholder: "何分休憩しますか？",
  btnNotificationBreak: "5分休憩",
  btnNotificationSnooze: "5分延期",
  btnNotificationStats: "レポート",
  msgBreakFinished: "休憩時間終了です！集中してコードを書きましょう。",
  msgSnoozed: (min) => `休憩を${min}分延期しました。猫が見守っています。`,
  msgReset: "コーヒー猫：タイマーをリセットしました。",
  msgPaused: "コーヒー猫を一時停止しました。猫は休憩中です。",
  msgResumed: "コーヒー猫を再開しました。猫が起きました！",
  msgStatsReset: "コーヒー猫：統計をリセットしました。",
  messagesPaused: [
    "Zzz... 猫はお昼寝中です。準備ができたら「再開する」をクリックしてください。",
    "Purrr... 休憩モード中です。"
  ]
};

export class I18nManager {
  private static caches: { [key: string]: LocaleStrings } = {
    tr: TR,
    en: EN,
    es: ES,
    de: DE,
    ja: JA
  };

  public static getLanguage(): string {
    const config = vscode.workspace.getConfiguration('kahveKedisi');
    const ayarDil = config.get<string>('dil', 'otomatik');

    if (ayarDil && ayarDil !== 'otomatik') {
      return ayarDil.toLowerCase();
    }

    const vscodeLang = (vscode.env.language || 'en').toLowerCase();
    if (vscodeLang.startsWith('tr')) return 'tr';
    if (vscodeLang.startsWith('es')) return 'es';
    if (vscodeLang.startsWith('de')) return 'de';
    if (vscodeLang.startsWith('ja')) return 'ja';
    return 'en';
  }

  public static getStrings(): LocaleStrings {
    const lang = this.getLanguage();
    return this.caches[lang] || EN;
  }

  public static getDeveloperName(): string {
    const config = vscode.workspace.getConfiguration('kahveKedisi');
    const configName = config.get<string>('kisiselIsim', '');

    if (configName && configName.trim() !== '' && configName.trim() !== 'Geliştirici' && configName.trim() !== 'Developer') {
      return configName.trim();
    }

    try {
      const osUser = os.userInfo().username;
      if (osUser && osUser.trim() !== '') {
        return osUser.charAt(0).toUpperCase() + osUser.slice(1);
      }
    } catch {
      // fallback
    }

    const envUser = process.env.USERNAME || process.env.USER;
    if (envUser && envUser.trim() !== '') {
      return envUser.charAt(0).toUpperCase() + envUser.slice(1);
    }

    const lang = this.getLanguage();
    return lang === 'tr' ? 'Geliştirici' : 'Developer';
  }
}

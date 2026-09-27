export type KediModu = 'mutlu' | 'uykulu' | 'huysuz' | 'mola';

export interface KediMesaji {
  metin: string;
  mod: KediModu;
}

export const MOLA_MESAJLARI_MUTLU: string[] = [
  "Miyav! Harika bir odaklanma seansıydı. Şimdi bir fincan sıcak kahveyi hak ettin! ☕",
  "Gözlerini ekrandan 20 saniye uzaklaştırıp uzaklara bakmaya ne dersin? Patilerim sağlığını düşünüyor. 🐾",
  "Temiz kod, dinlenmiş bir zihinle yazılır! Ufak bir kahve molası verelim mi? ✨",
  "Miyav! Şöyle bir gerinip omuzlarını rahatlat, kahve kokusu havada dolaşıyor. 🐈",
  "Kodların harika akıyor ama bedenin de bir molayı hak ediyor. Hadi kalkıp biraz su veya kahve al! 💧☕",
  "Bugün çok verimlisin! Kısa bir mola, zihnini tazeleyip hataları önceden görmeni sağlar. 🧠✨"
];

export const MOLA_MESAJLARI_UYKULU: string[] = [
  "Esneme sesimi duydun mu? Zzz... Bence ikimizin de göz kapakları ağırlaşmaya başladı. 🥱",
  "Miyav... Ekran ışığı gözlerini yormuş olmalı. Klavyeyi 5 dakikalığına bana bırakıp dinlen. 😴",
  "Dikkat süresi tükendi uyarısı! Kodlar birbirine karışmadan önce bir nefes alalım mı? 🌙",
  "Göz kırpma sayın azaldı miyav! Sırtını dikleştir, derin bir nefes al ve biraz uzaklaş. 🐾",
  "Zzz... Kahven bittiyse yenileme vakti, enerjin bittiyse dinlenme vakti! ☕💤"
];

export const MOLA_MESAJLARI_HUYSUZ: string[] = [
  "Yine mi 'şu fonksiyonu bitireyim kalkıyorum' dedin? Klavyenin üstüne oturmam an meselesi! 😾",
  "Bak bu ertelediğin kaçıncı mola oldu! Bug'lar yorgun geliştiricileri çok sever, benden söylemesi! 🐾💢",
  "Kuyruğumu sinirle sallıyorum şu an! O sandalyeden kalkmazsan 'git push --force' yaparım! (Şaka şaka... belki) 😼",
  "Miyav dedim, kahve dedim, dinlen dedim... Hâlâ kod yazıyorsun! Beni dinlemezsen farenin kablosunu ısırırım! 😼⚡",
  "Söz vermiştin 5 dakika önce kalkacaktın! Sağlığın koddan daha önemli geliştirici insan! 😾☕"
];

export const MOLA_MESAJLARI_MOLA_KEYFI: string[] = [
  "İşte bu! Şimdi arkana yaslan, kahveni yudumla ve dinlenmenin tadını çıkar. ☕🎶",
  "Mırrr... Dinlenen zihin, en karmaşık algoritmaları bile tereyağından kıl çeker gibi çözer! 🐈💖",
  "Pencereni açıp temiz havayı içine çek. Gözlerin ve boynun sana teşekkür edecek! 🌿",
  "Patiler havaya! Gerinme ve esneme hareketi yapıyoruz: 1, 2, 3... Mırrr! 🐾✨"
];

export const KEDI_SEVILME_TEPKILERI: string[] = [
  "Mırrrrrr... Mırrrrrr... (Kedi mutluluktan mırlıyor ve kafasını eline sürtüyor) 😻",
  "Patilerimle dizine masaj yapıyorum! En sevdiğim geliştirici sensin. 🐾💖",
  "Miyav! Sevgi barı %100 doldu! Enerji patlaması! ⚡🐈",
  "Karnımı sevmek tehlikelidir ama sana özel izin veriyorum miyav! 😸",
  "Mırrr... Bu ilgi kod yazma hızını %20 artırır (Kedi Enstitüsü onaylı). 📈🐾"
];

export class MesajYoneticisi {
  private static sonMesajlar: Set<string> = new Set();

  public static rastgeleMesajGetir(mod: KediModu, ertelemeSayisi: number = 0, isim: string = "Geliştirici"): string {
    let havuz: string[];

    if (mod === 'mola') {
      havuz = MOLA_MESAJLARI_MOLA_KEYFI;
    } else if (ertelemeSayisi >= 2 || mod === 'huysuz') {
      havuz = MOLA_MESAJLARI_HUYSUZ;
    } else if (mod === 'uykulu') {
      havuz = MOLA_MESAJLARI_UYKULU;
    } else {
      havuz = MOLA_MESAJLARI_MUTLU;
    }

    const secenekler = havuz.filter(m => !this.sonMesajlar.has(m));
    const secilen = secenekler.length > 0
      ? secenekler[Math.floor(Math.random() * secenekler.length)]
      : havuz[Math.floor(Math.random() * havuz.length)];

    this.sonMesajlar.add(secilen);
    if (this.sonMesajlar.size > 8) {
      const ilkEleman = this.sonMesajlar.values().next().value;
      if (ilkEleman) {
        this.sonMesajlar.delete(ilkEleman);
      }
    }

    return secilen.replace(/geliştirici/gi, isim);
  }

  public static rastgeleSevgiTepkisi(): string {
    return KEDI_SEVILME_TEPKILERI[Math.floor(Math.random() * KEDI_SEVILME_TEPKILERI.length)];
  }
}

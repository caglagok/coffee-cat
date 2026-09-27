import { I18nManager } from './i18n';

export type KediModu = 'mutlu' | 'uykulu' | 'huysuz' | 'mola';

export class MesajYoneticisi {
  private static sonMesajlar: Set<string> = new Set();

  public static rastgeleMesajGetir(mod: KediModu, ertelemeSayisi: number = 0, isim?: string): string {
    const i18n = I18nManager.getStrings();
    const developerName = isim || I18nManager.getDeveloperName();

    let havuz: string[];
    if (mod === 'mola') {
      havuz = i18n.messagesBreak;
    } else if (ertelemeSayisi >= 2 || mod === 'huysuz') {
      havuz = i18n.messagesGrumpy;
    } else if (mod === 'uykulu') {
      havuz = i18n.messagesSleepy;
    } else {
      havuz = i18n.messagesHappy;
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

    return secilen.replace(/geliştirici|developer|programador|entwickler/gi, developerName);
  }

  public static rastgeleSevgiTepkisi(isim?: string): string {
    const i18n = I18nManager.getStrings();
    const developerName = isim || I18nManager.getDeveloperName();
    const secilen = i18n.messagesLove[Math.floor(Math.random() * i18n.messagesLove.length)];
    return secilen.replace(/geliştirici|developer|programador|entwickler/gi, developerName);
  }
}

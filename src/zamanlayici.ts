import * as vscode from 'vscode';
import { DurumCubuguYoneticisi } from './durumCubugu';
import { IstatistikYoneticisi } from './istatistik';
import { KediModu, MesajYoneticisi } from './mesajlar';
import { PanelYoneticisi } from './panel';

export class ZamanlayiciYoneticisi implements vscode.Disposable {
  private timer: NodeJS.Timeout | null = null;
  private calismaSaniyesi: number = 0;
  private kesintisizSaniye: number = 0;
  private molaKalanSaniye: number = 0;
  private ertelemeSayisi: number = 0;
  private sonAktiviteZamani: number = Date.now();
  private isIdle: boolean = false;
  private isPaused: boolean = false;
  private isBreakActive: boolean = false;

  private molaSuresiDakika: number = 45;
  private idleTespitiAktif: boolean = true;
  private idleSuresiDakika: number = 5;
  private bildirimTuru: 'webview' | 'bilgiMesaji' | 'herIkisi' = 'webview';

  private durumCubugu: DurumCubuguYoneticisi;
  private istatistik: IstatistikYoneticisi;
  private extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  constructor(
    durumCubugu: DurumCubuguYoneticisi,
    istatistik: IstatistikYoneticisi,
    extensionUri: vscode.Uri
  ) {
    this.durumCubugu = durumCubugu;
    this.istatistik = istatistik;
    this.extensionUri = extensionUri;

    this.ayarlariYukle();
    this.olayDinleyicileriKur();
    this.baslat();
  }

  public ayarlariYukle(): void {
    const config = vscode.workspace.getConfiguration('kahveKedisi');
    this.molaSuresiDakika = config.get<number>('molaSuresiDakika', 45);
    this.idleTespitiAktif = config.get<boolean>('idleTespitiAktif', true);
    this.idleSuresiDakika = config.get<number>('idleSuresiDakika', 5);
    this.bildirimTuru = config.get<'webview' | 'bilgiMesaji' | 'herIkisi'>('bildirimTuru', 'webview');
  }

  private olayDinleyicileriKur(): void {
    const aktiviteGuncelle = () => {
      this.sonAktiviteZamani = Date.now();
      if (this.isIdle) {
        this.isIdle = false;
        this.durumGuncelle();
      }
    };

    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(aktiviteGuncelle),
      vscode.window.onDidChangeActiveTextEditor(aktiviteGuncelle),
      vscode.window.onDidChangeTextEditorSelection(aktiviteGuncelle)
    );
  }

  private baslat(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      this.saniyeTik();
    }, 1000);
  }

  private saniyeTik(): void {
    if (this.isPaused) {
      this.durumCubugu.guncelle(
        this.calismaSaniyesi,
        this.molaSuresiDakika,
        this.guncelMod(),
        false,
        true
      );
      return;
    }

    if (this.isBreakActive) {
      if (this.molaKalanSaniye > 0) {
        this.molaKalanSaniye--;
        this.durumCubugu.guncelle(
          this.calismaSaniyesi,
          this.molaSuresiDakika,
          'mola',
          false,
          false,
          this.molaKalanSaniye
        );
        if (PanelYoneticisi.guncelPanel) {
          PanelYoneticisi.guncelPanel.molaSayaciniGuncelle(this.molaKalanSaniye);
        }
      } else {
        this.isBreakActive = false;
        this.calismaSaniyesi = 0;
        this.kesintisizSaniye = 0;
        this.ertelemeSayisi = 0;
        vscode.window.showInformationMessage('☕ Molanız tamamlandı! Harika bir enerjiyle kodlamaya hazır mısınız? 🐾');
        this.durumGuncelle();
        if (PanelYoneticisi.guncelPanel) {
          this.paneliGoster('mutlu');
        }
      }
      return;
    }

    const simdi = Date.now();
    const idleGecenDakika = (simdi - this.sonAktiviteZamani) / (1000 * 60);

    if (this.idleTespitiAktif && idleGecenDakika >= this.idleSuresiDakika) {
      this.isIdle = true;
      this.durumCubugu.guncelle(
        this.calismaSaniyesi,
        this.molaSuresiDakika,
        this.guncelMod(),
        true,
        false
      );
      return;
    }

    this.isIdle = false;
    this.calismaSaniyesi++;
    this.kesintisizSaniye++;

    if (this.calismaSaniyesi % 60 === 0) {
      const kesintisizDakika = Math.floor(this.kesintisizSaniye / 60);
      this.istatistik.calismaSuresiEkleDakika(1, kesintisizDakika);
    }

    this.durumGuncelle();

    const hedefSaniye = this.molaSuresiDakika * 60;
    if (this.calismaSaniyesi === hedefSaniye || (this.calismaSaniyesi > hedefSaniye && this.calismaSaniyesi % (10 * 60) === 0)) {
      this.molaTetikle();
    }
  }

  public guncelMod(): KediModu {
    if (this.isBreakActive) return 'mola';
    if (this.ertelemeSayisi >= 2) return 'huysuz';
    const oran = this.calismaSaniyesi / (this.molaSuresiDakika * 60);
    if (oran >= 1.0) return 'huysuz';
    if (oran >= 0.7) return 'uykulu';
    return 'mutlu';
  }

  private durumGuncelle(): void {
    this.durumCubugu.guncelle(
      this.calismaSaniyesi,
      this.molaSuresiDakika,
      this.guncelMod(),
      this.isIdle,
      this.isPaused,
      this.molaKalanSaniye
    );
  }

  public async molaTetikle(): Promise<void> {
    const mod = this.guncelMod();
    const config = vscode.workspace.getConfiguration('kahveKedisi');
    const isim = config.get<string>('kisiselIsim', 'Geliştirici');

    if (this.bildirimTuru === 'webview' || this.bildirimTuru === 'herIkisi') {
      this.paneliGoster(mod);
    }

    if (this.bildirimTuru === 'bilgiMesaji' || this.bildirimTuru === 'herIkisi') {
      const mesaj = MesajYoneticisi.rastgeleMesajGetir(mod, this.ertelemeSayisi, isim);
      const secim = await vscode.window.showInformationMessage(
        mesaj,
        '☕ 5 Dk Mola Ver',
        '⏳ 5 Dk Ertele',
        '📊 Mola Karnesi'
      );

      if (secim === '☕ 5 Dk Mola Ver') {
        this.molaBaslat(5);
      } else if (secim === '⏳ 5 Dk Ertele') {
        this.ertele(5);
      } else if (secim === '📊 Mola Karnesi') {
        this.paneliGoster(mod);
      }
    }
  }

  public molaBaslat(sureDakika: number = 5): void {
    this.isBreakActive = true;
    this.molaKalanSaniye = sureDakika * 60;
    this.istatistik.molaAlindi();
    this.paneliGoster('mola');
    this.durumGuncelle();
  }

  public ertele(ekDakika: number = 5): void {
    this.ertelemeSayisi++;
    this.istatistik.molaErtelendi();
    this.calismaSaniyesi = Math.max(0, (this.molaSuresiDakika - ekDakika) * 60);
    vscode.window.showInformationMessage(`⏳ Mola ${ekDakika} dakika ertelendi. Kedi gözlerini üstünden ayırmıyor! 👀🐾`);
    this.durumGuncelle();
    if (PanelYoneticisi.guncelPanel) {
      this.paneliGoster(this.guncelMod());
    }
  }

  public sayaciSifirla(): void {
    this.calismaSaniyesi = 0;
    this.kesintisizSaniye = 0;
    this.ertelemeSayisi = 0;
    this.isBreakActive = false;
    this.molaKalanSaniye = 0;
    vscode.window.showInformationMessage('🔄 Kahve Kedisi: Çalışma sayacı sıfırlandı!');
    this.durumGuncelle();
    if (PanelYoneticisi.guncelPanel) {
      this.paneliGoster('mutlu');
    }
  }

  public duraklatVeyaDevamEt(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      vscode.window.showInformationMessage('💤 Kahve Kedisi duraklatıldı. Kedi mışıl mışıl uyuyor...');
    } else {
      vscode.window.showInformationMessage('🐾 Kahve Kedisi uyandı ve seni takip ediyor!');
    }
    this.durumGuncelle();
    if (PanelYoneticisi.guncelPanel) {
      this.paneliGoster(this.guncelMod());
    }
  }

  public paneliGoster(mod?: KediModu): void {
    const kediModu = mod || this.guncelMod();
    PanelYoneticisi.olusturVeyaGoster(
      this.extensionUri,
      this.istatistik,
      (komut: string, veri?: any) => this.panelKomutuYakala(komut, veri),
      kediModu,
      this.calismaSaniyesi,
      this.molaSuresiDakika,
      this.ertelemeSayisi,
      this.molaKalanSaniye
    );
  }

  private panelKomutuYakala(komut: string, veri?: any): void {
    switch (komut) {
      case 'molaBaslat':
        const sure = veri?.sureDakika || 5;
        this.molaBaslat(sure);
        break;
      case 'ertele':
        this.ertele(5);
        break;
      case 'calismayaDon':
        this.isBreakActive = false;
        this.molaKalanSaniye = 0;
        this.calismaSaniyesi = 0;
        this.kesintisizSaniye = 0;
        this.ertelemeSayisi = 0;
        this.durumGuncelle();
        this.paneliGoster('mutlu');
        break;
      case 'sayaciSifirla':
        this.sayaciSifirla();
        break;
      case 'simdilikKapat':
        this.duraklatVeyaDevamEt();
        break;
    }
  }

  public dispose(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

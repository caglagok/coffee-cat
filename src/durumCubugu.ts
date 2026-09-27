import * as vscode from 'vscode';
import { KediModu } from './mesajlar';

export class DurumCubuguYoneticisi implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      'kahveKedisi.durum',
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.name = 'Kahve Kedisi Durum';
    this.statusBarItem.command = 'kahveKedisi.molaGoster';
    this.guncelle(0, 45, 'mutlu', false, false, 0);
    this.statusBarItem.show();
  }

  public guncelle(
    gecenSaniye: number,
    hedefDakika: number,
    mod: KediModu,
    isIdle: boolean,
    isPaused: boolean,
    molaKalanSaniye: number = 0
  ): void {
    const gecenDakika = Math.floor(gecenSaniye / 60);

    if (isPaused) {
      this.statusBarItem.text = '$(debug-pause) ⏸️ Kedi Uyuyor';
      this.statusBarItem.tooltip = new vscode.MarkdownString('**Kahve Kedisi Duraklatıldı**\n\nSayaç şu an duraklatılmış vaziyette. Tıklayarak paneli açabilir veya sayacı yeniden başlatabilirsin.');
      this.statusBarItem.backgroundColor = undefined;
      return;
    }

    if (mod === 'mola' && molaKalanSaniye > 0) {
      const dakika = Math.floor(molaKalanSaniye / 60);
      const saniye = molaKalanSaniye % 60;
      const zamanStr = `${dakika}:${saniye < 10 ? '0' : ''}${saniye}`;
      this.statusBarItem.text = `$(coffee) ☕ Mola: ${zamanStr}`;
      this.statusBarItem.tooltip = new vscode.MarkdownString('**Mola Keyfi Devam Ediyor! ☕**\n\nArkanıza yaslanın ve gözlerinizi dinlendirin. Tıklayarak paneli görüntüleyebilirsiniz.');
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
      return;
    }

    if (isIdle) {
      this.statusBarItem.text = '$(moon) 💤 Kedi Uyuyor (Boşta)';
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**Kedi Şekerleme Yapıyor**\n\nKlavyeden uzaktasın, bu yüzden çalışma sayacı durduruldu (${gecenDakika}/${hedefDakika} dk).`);
      this.statusBarItem.backgroundColor = undefined;
      return;
    }

    const yuzde = Math.min(100, Math.round((gecenDakika / hedefDakika) * 100));

    if (gecenDakika >= hedefDakika) {
      this.statusBarItem.text = `$(flame) 😾 MOLA VAKTİ! (${gecenDakika} dk)`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**🚨 Mola Zamanı Geldi! (${gecenDakika} dk kesintisiz)**\n\nKedi patisini klavyene vuruyor! Hemen tıklayıp kahveni al.`);
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else if (yuzde >= 75) {
      this.statusBarItem.text = `$(watch) 😾 Kahve Kedisi (${gecenDakika}/${hedefDakika} dk)`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**Mola Vakti Yaklaşıyor**\n\n${gecenDakika} dakikadır çalışıyorsun. Kedi esnemeye ve sana bakmaya başladı.`);
      this.statusBarItem.backgroundColor = undefined;
    } else if (yuzde >= 45) {
      this.statusBarItem.text = `$(coffee) 🐱 Kahve Kedisi (${gecenDakika}/${hedefDakika} dk)`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**Verimli Çalışma Seansı**\n\n${gecenDakika} dakikadır odaktasın. Kedi yanında huzurla oturuyor.`);
      this.statusBarItem.backgroundColor = undefined;
    } else {
      this.statusBarItem.text = `$(heart) 🐈 Kahve Kedisi (${gecenDakika}/${hedefDakika} dk)`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**Kedi Çok Mutlu! 🐾**\n\nEnerjin yüksek, seans yeni başladı (${gecenDakika} dk). Tıklayarak kediyi sevebilirsin!`);
      this.statusBarItem.backgroundColor = undefined;
    }
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}

import * as vscode from 'vscode';
import { KediModu } from './mesajlar';
import { I18nManager } from './i18n';

export class DurumCubuguYoneticisi implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
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
    const i18n = I18nManager.getStrings();
    const gecenDakika = Math.floor(gecenSaniye / 60);

    if (isPaused) {
      this.statusBarItem.text = `$(debug-pause) ${i18n.statusPaused}`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**${i18n.brandName}**\n\n${i18n.statusPaused}`);
      this.statusBarItem.backgroundColor = undefined;
      return;
    }

    if (mod === 'mola' && molaKalanSaniye > 0) {
      const dakika = Math.floor(molaKalanSaniye / 60);
      const saniye = molaKalanSaniye % 60;
      const zamanStr = `${dakika}:${saniye < 10 ? '0' : ''}${saniye}`;
      this.statusBarItem.text = `$(coffee) ${i18n.statusBreak}: ${zamanStr}`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**${i18n.breakOngoing}**\n\n${i18n.breakSubtitle}`);
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
      return;
    }

    if (isIdle) {
      this.statusBarItem.text = `$(moon) ${i18n.statusIdle}`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**${i18n.statusIdle}**\n\n(${gecenDakika}/${hedefDakika} ${i18n.minutesShort})`);
      this.statusBarItem.backgroundColor = undefined;
      return;
    }

    const yuzde = Math.min(100, Math.round((gecenDakika / Math.max(1, hedefDakika)) * 100));

    if (gecenDakika >= hedefDakika) {
      this.statusBarItem.text = `$(flame) ${i18n.statusBreakTime} (${gecenDakika} ${i18n.minutesShort})`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**${i18n.statusBreakTime}** (${gecenDakika} ${i18n.minutesShort})`);
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else if (yuzde >= 75) {
      this.statusBarItem.text = `$(clock) ${i18n.brandName} (${gecenDakika}/${hedefDakika} ${i18n.minutesShort})`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**${i18n.focusTitle}**\n\n${gecenDakika}/${hedefDakika} ${i18n.minutesShort}`);
      this.statusBarItem.backgroundColor = undefined;
    } else if (yuzde >= 45) {
      this.statusBarItem.text = `$(coffee) ${i18n.brandName} (${gecenDakika}/${hedefDakika} ${i18n.minutesShort})`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**${i18n.focusTitle}**\n\n${gecenDakika}/${hedefDakika} ${i18n.minutesShort}`);
      this.statusBarItem.backgroundColor = undefined;
    } else {
      this.statusBarItem.text = `$(heart) ${i18n.brandName} (${gecenDakika}/${hedefDakika} ${i18n.minutesShort})`;
      this.statusBarItem.tooltip = new vscode.MarkdownString(`**${i18n.brandName}**\n\n${gecenDakika}/${hedefDakika} ${i18n.minutesShort}`);
      this.statusBarItem.backgroundColor = undefined;
    }
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}

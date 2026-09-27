import * as vscode from 'vscode';
import { DurumCubuguYoneticisi } from './durumCubugu';
import { IstatistikYoneticisi } from './istatistik';
import { MesajYoneticisi } from './mesajlar';
import { ZamanlayiciYoneticisi } from './zamanlayici';
import { I18nManager } from './i18n';

let zamanlayici: ZamanlayiciYoneticisi | undefined;

export function activate(context: vscode.ExtensionContext) {
  const istatistik = new IstatistikYoneticisi(context);
  const durumCubugu = new DurumCubuguYoneticisi();
  zamanlayici = new ZamanlayiciYoneticisi(durumCubugu, istatistik, context.extensionUri);

  const cmdMolaGoster = vscode.commands.registerCommand('kahveKedisi.molaGoster', () => {
    zamanlayici?.paneliGoster();
  });

  const cmdIstatistikGoster = vscode.commands.registerCommand('kahveKedisi.istatistikGoster', () => {
    zamanlayici?.paneliGoster();
  });

  const cmdMolaBaslat = vscode.commands.registerCommand('kahveKedisi.molaBaslat', async () => {
    const i18n = I18nManager.getStrings();
    const secim = await vscode.window.showQuickPick(
      [
        { label: `$(coffee) ${i18n.qpBreak5}`, sure: 5 },
        { label: `$(clock) ${i18n.qpBreak10}`, sure: 10 },
        { label: `$(sparkle) ${i18n.qpBreak15}`, sure: 15 }
      ],
      { placeHolder: i18n.qpPlaceholder }
    );

    if (secim) {
      zamanlayici?.molaBaslat(secim.sure);
    }
  });

  const cmdSayaciSifirla = vscode.commands.registerCommand('kahveKedisi.sayaciSifirla', () => {
    zamanlayici?.sayaciSifirla();
  });

  const cmdSimdilikKapat = vscode.commands.registerCommand('kahveKedisi.simdilikKapat', () => {
    zamanlayici?.duraklatVeyaDevamEt();
  });

  const cmdKediyiSev = vscode.commands.registerCommand('kahveKedisi.kediyiSev', async () => {
    const toplamSevgi = await istatistik.kediSevildi();
    const developerName = I18nManager.getDeveloperName();
    const tepki = MesajYoneticisi.rastgeleSevgiTepkisi(developerName);
    vscode.window.showInformationMessage(`${tepki} (${I18nManager.getStrings().statLove}: ${toplamSevgi})`);
  });

  const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('kahveKedisi')) {
      zamanlayici?.ayarlariYukle();
    }
  });

  context.subscriptions.push(
    durumCubugu,
    zamanlayici,
    cmdMolaGoster,
    cmdIstatistikGoster,
    cmdMolaBaslat,
    cmdSayaciSifirla,
    cmdSimdilikKapat,
    cmdKediyiSev,
    configWatcher
  );
}

export function deactivate() {
  if (zamanlayici) {
    zamanlayici.dispose();
  }
}

import * as vscode from 'vscode';
import { DurumCubuguYoneticisi } from './durumCubugu';
import { IstatistikYoneticisi } from './istatistik';
import { MesajYoneticisi } from './mesajlar';
import { ZamanlayiciYoneticisi } from './zamanlayici';

let zamanlayici: ZamanlayiciYoneticisi | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('🐈 Kahve Kedisi eklentisi aktif edildi!');

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
    const secim = await vscode.window.showQuickPick(
      [
        { label: '$(coffee) 5 Dakika Kahve Molası', sure: 5 },
        { label: '$(clock) 10 Dakika Dinlenme', sure: 10 },
        { label: '$(sparkle) 15 Dakika Uzun Mola & Yürüyüş', sure: 15 }
      ],
      { placeHolder: 'Kaç dakika mola vermek istersin?' }
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
    const tepki = MesajYoneticisi.rastgeleSevgiTepkisi();
    vscode.window.showInformationMessage(`🐾 ${tepki} (Toplam sevgi: ${toplamSevgi})`);
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

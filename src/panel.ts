import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { KediModu, MesajYoneticisi } from './mesajlar';
import { IstatistikYoneticisi } from './istatistik';

export class PanelYoneticisi {
  public static guncelPanel: PanelYoneticisi | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];
  private istatistik: IstatistikYoneticisi;
  private onKomutCallback: (komut: string, veri?: any) => void;

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    istatistik: IstatistikYoneticisi,
    onKomutCallback: (komut: string, veri?: any) => void
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.istatistik = istatistik;
    this.onKomutCallback = onKomutCallback;

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      async (mesaj) => {
        if (mesaj.komut === 'kediSevildi') {
          const yeniSayi = await this.istatistik.kediSevildi();
          const sevgiMesaji = MesajYoneticisi.rastgeleSevgiTepkisi();
          this.panel.webview.postMessage({
            tip: 'sevgiGuncelle',
            sayi: yeniSayi,
            mesaj: sevgiMesaji
          });
          return;
        }

        if (mesaj.komut === 'istatistikSifirla') {
          await this.istatistik.istatistikleriSifirla();
          this.durumGuncelle('mutlu', 0, 45, 0, 0);
          vscode.window.showInformationMessage('Kahve Kedisi: İstatistikler sıfırlandı.');
          return;
        }

        this.onKomutCallback(mesaj.komut, mesaj.veri);
      },
      null,
      this.disposables
    );
  }

  public static olusturVeyaGoster(
    extensionUri: vscode.Uri,
    istatistik: IstatistikYoneticisi,
    onKomutCallback: (komut: string, veri?: any) => void,
    mod: KediModu = 'mutlu',
    calismaSaniye: number = 0,
    hedefDakika: number = 45,
    ertelemeSayisi: number = 0,
    molaKalanSaniye: number = 0
  ): PanelYoneticisi {
    const sutun = vscode.ViewColumn.Beside;

    if (PanelYoneticisi.guncelPanel) {
      PanelYoneticisi.guncelPanel.panel.reveal(sutun);
      PanelYoneticisi.guncelPanel.durumGuncelle(
        mod,
        calismaSaniye,
        hedefDakika,
        ertelemeSayisi,
        molaKalanSaniye
      );
      return PanelYoneticisi.guncelPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      'kahveKedisiPanel',
      'Kahve Kedisi',
      sutun,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
    );

    PanelYoneticisi.guncelPanel = new PanelYoneticisi(
      panel,
      extensionUri,
      istatistik,
      onKomutCallback
    );
    PanelYoneticisi.guncelPanel.durumGuncelle(
      mod,
      calismaSaniye,
      hedefDakika,
      ertelemeSayisi,
      molaKalanSaniye
    );
    return PanelYoneticisi.guncelPanel;
  }

  public durumGuncelle(
    mod: KediModu,
    calismaSaniye: number,
    hedefDakika: number,
    ertelemeSayisi: number,
    molaKalanSaniye: number = 0
  ): void {
    const config = vscode.workspace.getConfiguration('kahveKedisi');
    const isim = config.get<string>('kisiselIsim', 'Geliştirici');
    const sesAktif = config.get<boolean>('sesEfektiAktif', true);

    const mesaj = MesajYoneticisi.rastgeleMesajGetir(mod, ertelemeSayisi, isim);
    const svgContent = this.svgGetir(mod);
    const istatistikVeri = this.istatistik.getVeri();

    this.panel.webview.html = this.htmlOlustur(
      mod,
      mesaj,
      svgContent,
      calismaSaniye,
      hedefDakika,
      ertelemeSayisi,
      molaKalanSaniye,
      istatistikVeri,
      sesAktif
    );
  }

  public molaSayaciniGuncelle(molaKalanSaniye: number): void {
    this.panel.webview.postMessage({
      tip: 'molaSayaciGuncelle',
      kalanSaniye: molaKalanSaniye
    });
  }

  private svgGetir(mod: KediModu): string {
    const dosyaAdi =
      mod === 'mola'
        ? 'kedi-mola.svg'
        : mod === 'huysuz'
        ? 'kedi-huysuz.svg'
        : mod === 'uykulu'
        ? 'kedi-uykulu.svg'
        : 'kedi-mutlu.svg';

    const dosyaYolu = path.join(this.extensionUri.fsPath, 'media', dosyaAdi);
    try {
      if (fs.existsSync(dosyaYolu)) {
        return fs.readFileSync(dosyaYolu, 'utf-8');
      }
    } catch (e) {
      console.error('SVG dosyası okunamadı:', e);
    }
    return `<div style="text-align: center; padding: 20px;"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path></svg></div>`;
  }

  private htmlOlustur(
    mod: KediModu,
    mesaj: string,
    svgContent: string,
    calismaSaniye: number,
    hedefDakika: number,
    ertelemeSayisi: number,
    molaKalanSaniye: number,
    istatistik: ReturnType<IstatistikYoneticisi['getVeri']>,
    sesAktif: boolean
  ): string {
    const calismaDakika = Math.floor(calismaSaniye / 60);
    const yuzde = Math.min(100, Math.round((calismaDakika / Math.max(1, hedefDakika)) * 100));

    const molaDakika = Math.floor(molaKalanSaniye / 60);
    const molaSaniye = molaKalanSaniye % 60;
    const molaZamaniStr = `${molaDakika}:${molaSaniye < 10 ? '0' : ''}${molaSaniye}`;

    let mutlulukPuani = 100 - (ertelemeSayisi * 25);
    if (calismaDakika > hedefDakika) {
      mutlulukPuani -= Math.min(40, (calismaDakika - hedefDakika) * 2);
    }
    mutlulukPuani = Math.max(10, Math.min(100, mutlulukPuani));

    // Lucide / Heroicon Modern Outline SVG İkon Seti (İçi Boş / Stroke Tabanlı)
    const iconCoffee = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>`;
    const iconClock = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    const iconHeart = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>`;
    const iconFlame = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`;
    const iconChart = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>`;
    const iconRotate = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>`;
    const iconCheck = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const iconMoon = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;
    const iconSparkles = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`;
    const iconVolume2 = `<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
    const iconVolumeX = `<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="22" y1="9" x2="16" y2="15"></line><line x1="16" y1="9" x2="22" y2="15"></line></svg>`;
    const iconTrophy = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>`;
    const iconCalendar = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
    const iconTrash = `<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`;
    const iconCat = `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c-4 0-7.5 2-7.5 5 0 2 1.5 3.5 3.5 4.5-.5 1.5-.5 3 0 4.5 2 1.5 5 1.5 8 0 .5-1.5.5-3 0-4.5 2-1 3.5-2.5 3.5-4.5 0-3-3.5-5-7.5-5Z"></path><path d="M4.5 10 3 4l6 2"></path><path d="M19.5 10 21 4l-6 2"></path></svg>`;

    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kahve Kedisi</title>
  <style>
    :root {
      --bg-primary: var(--vscode-editor-background, #1e1e2e);
      --card-bg: var(--vscode-sideBar-background, #252538);
      --card-border: var(--vscode-widget-border, rgba(255, 255, 255, 0.1));
      --text-main: var(--vscode-editor-foreground, #cdd6f4);
      --text-muted: var(--vscode-descriptionForeground, #a6adc8);
      --accent-orange: #ff9f43;
      --accent-green: #2ecc71;
      --accent-purple: #9b59b6;
      --accent-red: #ee5253;
      --btn-primary-bg: #ff9f43;
      --btn-primary-text: #1e1e2e;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }

    body {
      background-color: var(--bg-primary);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .container {
      max-width: 580px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .ui-icon {
      display: inline-block;
      vertical-align: middle;
      stroke-width: 2;
      flex-shrink: 0;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--card-border);
    }

    .brand-title {
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--accent-orange);
    }

    .tab-buttons {
      display: flex;
      gap: 8px;
    }

    .tab-btn {
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .tab-btn.active, .tab-btn:hover {
      background: var(--card-bg);
      color: var(--text-main);
      border-color: var(--accent-orange);
    }

    .cat-stage {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .cat-avatar-container {
      width: 200px;
      height: 200px;
      cursor: pointer;
      position: relative;
      transition: transform 0.15s ease-out;
    }

    .cat-avatar-container:hover {
      transform: scale(1.04);
    }

    .cat-avatar-container:active {
      transform: scale(0.96);
    }

    .pet-hint {
      position: absolute;
      bottom: -6px;
      right: 10px;
      background: rgba(0, 0, 0, 0.65);
      color: #fff;
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      backdrop-filter: blur(4px);
      pointer-events: none;
    }

    .floating-heart {
      position: absolute;
      color: #ff758c;
      pointer-events: none;
      animation: floatUp 1s ease-out forwards;
    }

    @keyframes floatUp {
      0% { opacity: 1; transform: translate(0, 0) scale(1); }
      100% { opacity: 0; transform: translate(var(--tx), -60px) scale(1.5); }
    }

    .speech-bubble {
      background: var(--bg-primary);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 14px 18px;
      margin-top: 14px;
      position: relative;
      text-align: center;
      font-size: 0.95rem;
      line-height: 1.45;
      color: var(--text-main);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      width: 92%;
    }

    .speech-bubble::before {
      content: '';
      position: absolute;
      top: -9px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 9px solid transparent;
      border-right: 9px solid transparent;
      border-bottom: 9px solid var(--bg-primary);
    }

    .status-meter-box {
      width: 100%;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .meter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .progress-bar-bg {
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }

    .progress-bar-fill {
      height: 100%;
      width: ${yuzde}%;
      background: linear-gradient(90deg, #ff9f43, ${yuzde > 80 ? '#ee5253' : '#ffbe76'});
      border-radius: 6px;
      transition: width 0.5s ease;
    }

    .break-timer-card {
      display: ${mod === 'mola' ? 'flex' : 'none'};
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(39, 174, 96, 0.05));
      border: 1.5px solid var(--accent-green);
      border-radius: 16px;
      padding: 20px;
      gap: 8px;
    }

    .break-countdown {
      font-size: 2.8rem;
      font-weight: 800;
      color: var(--accent-green);
      letter-spacing: 2px;
      font-variant-numeric: tabular-nums;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      width: 100%;
    }

    .btn {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-break-primary {
      background: linear-gradient(135deg, #ff9f43, #f0932b);
      color: #1e1e2e;
      grid-column: span 2;
      font-size: 1rem;
      padding: 14px;
      box-shadow: 0 4px 14px rgba(255, 159, 67, 0.3);
    }

    .btn-break-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(255, 159, 67, 0.45);
    }

    .btn-snooze {
      background: rgba(255, 255, 255, 0.07);
      color: var(--text-main);
      border: 1px solid var(--card-border);
    }

    .btn-snooze:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: var(--accent-orange);
    }

    .btn-finish-break {
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      color: #fff;
      grid-column: span 2;
      font-size: 1rem;
      padding: 14px;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      width: 100%;
    }

    .stat-badge {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 4px;
    }

    .stat-badge .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent-orange);
    }

    .stat-badge .stat-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .stats-tab-content {
      display: none;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .stats-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .stats-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }

    .stats-table th, .stats-table td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid var(--card-border);
    }

    .stats-table th {
      color: var(--text-muted);
      font-weight: 600;
    }

    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-top: 10px;
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .sound-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <div class="brand-title">
        ${iconCoffee}
        <span>Kahve Kedisi</span>
      </div>
      <div class="tab-buttons">
        <button class="tab-btn active" id="tabMainBtn" onclick="tabDegistir('ana')">
          ${iconCat}
          <span>Kedi</span>
        </button>
        <button class="tab-btn" id="tabStatsBtn" onclick="tabDegistir('istatistik')">
          ${iconChart}
          <span>Mola Karnesi</span>
        </button>
      </div>
    </div>

    <!-- ANA GÖRÜNÜM -->
    <div id="anaGorunum" style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
      <div class="cat-stage">
        <div class="cat-avatar-container" id="catAvatar" onclick="kediyiSev(event)">
          ${svgContent}
          <div class="pet-hint">${iconSparkles} <span>Sev</span></div>
        </div>
        <div class="speech-bubble" id="speechBubble">
          ${mesaj}
        </div>
      </div>

      <div class="break-timer-card" id="breakTimerCard">
        <div style="font-size: 0.9rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
          ${iconCoffee}
          <span>MOLA DEVAM EDİYOR</span>
        </div>
        <div class="break-countdown" id="breakTimerDisplay">${molaZamaniStr}</div>
        <div style="font-size: 0.82rem; color: var(--text-muted);">Derin nefes al, kahveni yudumla ve omuzlarını gevşet.</div>
      </div>

      <div class="status-meter-box" id="workMeterBox" style="display: ${mod === 'mola' ? 'none' : 'flex'};">
        <div class="meter-header">
          <span style="display: flex; align-items: center; gap: 6px;">
            ${iconClock}
            <span>Kesintisiz Odaklanma</span>
          </span>
          <span><strong>${calismaDakika} dk</strong> / ${hedefDakika} dk</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progressBarFill"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
          <span>Kedi Mutluluğu: %<span id="catHappiness">${mutlulukPuani}</span></span>
          <span>${ertelemeSayisi > 0 ? `${ertelemeSayisi} kez ertelendi` : 'Hedefe uygun'}</span>
        </div>
      </div>

      <div class="actions-grid">
        ${
          mod === 'mola'
            ? `<button class="btn btn-finish-break" onclick="komutGonder('calismayaDon')">
                 ${iconCheck}
                 <span>Molayı Bitir & Kodlamaya Dön</span>
               </button>`
            : `<button class="btn btn-break-primary" onclick="molaSecimiGoster()">
                 ${iconCoffee}
                 <span>Şimdi Kahve Molası Ver</span>
               </button>
               <button class="btn btn-snooze" onclick="komutGonder('ertele')">
                 ${iconClock}
                 <span>5 Dk Daha (Ertele)</span>
               </button>
               <button class="btn btn-snooze" onclick="komutGonder('sayaciSifirla')">
                 ${iconRotate}
                 <span>Sayacı Sıfırla</span>
               </button>`
        }
      </div>

      <div class="stats-row">
        <div class="stat-badge">
          <span class="stat-value" id="badgeBreaks">${istatistik.bugun.alinanMolaSayisi}</span>
          <span class="stat-label">${iconCoffee} Mola</span>
        </div>
        <div class="stat-badge">
          <span class="stat-value" id="badgeWorkMin">${istatistik.bugun.toplamCalismaDakika}m</span>
          <span class="stat-label">${iconClock} Çalışma</span>
        </div>
        <div class="stat-badge">
          <span class="stat-value" id="badgeMaxSession">${istatistik.bugun.enUzunKesintisizDakika}m</span>
          <span class="stat-label">${iconFlame} En Uzun</span>
        </div>
        <div class="stat-badge">
          <span class="stat-value" id="badgePets">${istatistik.bugun.sevilmeSayisi}</span>
          <span class="stat-label">${iconHeart} Sevgi</span>
        </div>
      </div>
    </div>

    <!-- İSTATİSTİK / MOLA KARNESİ GÖRÜNÜMÜ -->
    <div id="istatistikGorunum" class="stats-tab-content">
      <div class="stats-card">
        <h3 style="color: var(--accent-orange); font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
          ${iconTrophy}
          <span>Genel Başarı Tablosu</span>
        </h3>
        <div class="stats-row">
          <div class="stat-badge">
            <span class="stat-value">${istatistik.toplamOmurBoyuMola}</span>
            <span class="stat-label">${iconCoffee} Toplam Mola</span>
          </div>
          <div class="stat-badge">
            <span class="stat-value">${Math.round(istatistik.toplamOmurBoyuCalismaDakika / 60)}s</span>
            <span class="stat-label">${iconClock} Toplam Saat</span>
          </div>
          <div class="stat-badge">
            <span class="stat-value">${istatistik.rekorKesintisizDakika}m</span>
            <span class="stat-label">${iconFlame} Rekor Seans</span>
          </div>
          <div class="stat-badge">
            <span class="stat-value">${istatistik.bugun.ertelenenMolaSayisi}</span>
            <span class="stat-label">${iconRotate} Erteleme</span>
          </div>
        </div>
      </div>

      <div class="stats-card">
        <h3 style="font-size: 0.95rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
          ${iconCalendar}
          <span>Son Günlerin Mola Karnesi</span>
        </h3>
        ${
          istatistik.gecmis.length === 0
            ? `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 14px;">
                 Henüz geçmiş gün kaydı bulunmuyor. Düzenli mola verdikçe burası dolacak.
               </div>`
            : `<table class="stats-table">
                 <thead>
                   <tr>
                     <th>Tarih</th>
                     <th>Mola</th>
                     <th>Çalışma</th>
                     <th>En Uzun</th>
                     <th>Erteleme</th>
                   </tr>
                 </thead>
                 <tbody>
                   ${istatistik.gecmis
                     .map(
                       (g) => `
                     <tr>
                       <td><strong>${g.tarih}</strong></td>
                       <td>${g.alinanMolaSayisi}</td>
                       <td>${g.toplamCalismaDakika} dk</td>
                       <td>${g.enUzunKesintisizDakika} dk</td>
                       <td>${g.ertelenenMolaSayisi}</td>
                     </tr>
                   `
                     )
                     .join('')}
                 </tbody>
               </table>`
        }
      </div>

      <div style="display: flex; gap: 10px; width: 100%;">
        <button class="btn btn-snooze" style="flex: 1;" onclick="komutGonder('istatistikSifirla')">
          ${iconTrash}
          <span>İstatistikleri Sıfırla</span>
        </button>
      </div>
    </div>

    <!-- Alt Çubuk -->
    <div class="footer-bar">
      <div class="sound-toggle" onclick="sesAcKapa()">
        <span id="soundIcon" style="display: flex; align-items: center; gap: 6px;">
          ${sesAktif ? iconVolume2 + '<span>Ses Açık</span>' : iconVolumeX + '<span>Ses Kapalı</span>'}
        </span>
      </div>
      <div style="cursor: pointer; display: flex; align-items: center; gap: 6px;" onclick="komutGonder('simdilikKapat')">
        ${iconMoon}
        <span>Kediyi Uyut / Duraklat</span>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    let sesDurumu = ${sesAktif};

    const iconVolOn = \`${iconVolume2}<span>Ses Açık</span>\`;
    const iconVolOff = \`${iconVolumeX}<span>Ses Kapalı</span>\`;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function sesCal(tur) {
      if (!sesDurumu) return;
      try {
        if (!audioCtx) {
          audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (tur === 'purr') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);
          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.36);
        } else if (tur === 'chime') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.1);
          osc.frequency.setValueAtTime(783.99, now + 0.2);
          osc.frequency.setValueAtTime(1046.50, now + 0.3);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.85);
        }
      } catch (e) {
        console.warn('Ses çalınamadı:', e);
      }
    }

    function kediyiSev(event) {
      sesCal('purr');
      kalpPatlat(event);
      vscode.postMessage({ komut: 'kediSevildi' });
    }

    function kalpPatlat(event) {
      const container = document.getElementById('catAvatar');
      const rect = container.getBoundingClientRect();
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.innerHTML = \`<svg width="22" height="22" viewBox="0 0 24 24" fill="#FF758C" stroke="#FF758C" stroke-width="1.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>\`;

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      heart.style.left = x + 'px';
      heart.style.top = y + 'px';
      heart.style.setProperty('--tx', (Math.random() * 40 - 20) + 'px');

      container.appendChild(heart);
      setTimeout(() => heart.remove(), 1000);
    }

    function molaSecimiGoster() {
      sesCal('chime');
      vscode.postMessage({ komut: 'molaBaslat', veri: { sureDakika: 5 } });
    }

    function komutGonder(komut, veri = null) {
      vscode.postMessage({ komut, veri });
    }

    function tabDegistir(tab) {
      const mainView = document.getElementById('anaGorunum');
      const statsView = document.getElementById('istatistikGorunum');
      const tabMainBtn = document.getElementById('tabMainBtn');
      const tabStatsBtn = document.getElementById('tabStatsBtn');

      if (tab === 'istatistik') {
        mainView.style.display = 'none';
        statsView.style.display = 'flex';
        tabMainBtn.classList.remove('active');
        tabStatsBtn.classList.add('active');
      } else {
        mainView.style.display = 'flex';
        statsView.style.display = 'none';
        tabStatsBtn.classList.remove('active');
        tabMainBtn.classList.add('active');
      }
    }

    function sesAcKapa() {
      sesDurumu = !sesDurumu;
      document.getElementById('soundIcon').innerHTML = sesDurumu ? iconVolOn : iconVolOff;
      if (sesDurumu) sesCal('purr');
    }

    window.addEventListener('message', event => {
      const msg = event.data;
      if (msg.tip === 'sevgiGuncelle') {
        document.getElementById('badgePets').innerText = msg.sayi;
        document.getElementById('speechBubble').innerText = msg.mesaj;
      } else if (msg.tip === 'molaSayaciGuncelle') {
        const dk = Math.floor(msg.kalanSaniye / 60);
        const sn = msg.kalanSaniye % 60;
        document.getElementById('breakTimerDisplay').innerText = dk + ':' + (sn < 10 ? '0' : '') + sn;
      }
    });
  </script>
</body>
</html>`;
  }

  public dispose(): void {
    PanelYoneticisi.guncelPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

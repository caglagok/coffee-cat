import * as vscode from 'vscode';

export interface GunlukIstatistik {
  tarih: string; // YYYY-MM-DD
  alinanMolaSayisi: number;
  ertelenenMolaSayisi: number;
  toplamCalismaDakika: number;
  enUzunKesintisizDakika: number;
  sevilmeSayisi: number;
}

export interface IstatistikVerisi {
  bugun: GunlukIstatistik;
  gecmis: GunlukIstatistik[];
  toplamOmurBoyuMola: number;
  toplamOmurBoyuCalismaDakika: number;
  rekorKesintisizDakika: number;
}

export class IstatistikYoneticisi {
  private static readonly STORAGE_KEY = 'kahveKedisi_istatistik_v1';
  private context: vscode.ExtensionContext;
  private veri: IstatistikVerisi;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.veri = this.yukle();
    this.gunKontrolu();
  }

  private bugunTarihFormat(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private bosGunOlustur(tarih: string): GunlukIstatistik {
    return {
      tarih,
      alinanMolaSayisi: 0,
      ertelenenMolaSayisi: 0,
      toplamCalismaDakika: 0,
      enUzunKesintisizDakika: 0,
      sevilmeSayisi: 0
    };
  }

  private yukle(): IstatistikVerisi {
    const bugunTarih = this.bugunTarihFormat();
    const kayitli = this.context.globalState.get<IstatistikVerisi>(IstatistikYoneticisi.STORAGE_KEY);

    if (!kayitli) {
      return {
        bugun: this.bosGunOlustur(bugunTarih),
        gecmis: [],
        toplamOmurBoyuMola: 0,
        toplamOmurBoyuCalismaDakika: 0,
        rekorKesintisizDakika: 0
      };
    }

    return kayitli;
  }

  private async kaydet(): Promise<void> {
    await this.context.globalState.update(IstatistikYoneticisi.STORAGE_KEY, this.veri);
  }

  private gunKontrolu(): void {
    const bugunTarih = this.bugunTarihFormat();
    if (this.veri.bugun.tarih !== bugunTarih) {
      if (this.veri.bugun.toplamCalismaDakika > 0 || this.veri.bugun.alinanMolaSayisi > 0) {
        this.veri.gecmis.unshift({ ...this.veri.bugun });
        if (this.veri.gecmis.length > 30) {
          this.veri.gecmis = this.veri.gecmis.slice(0, 30);
        }
      }
      this.veri.bugun = this.bosGunOlustur(bugunTarih);
      this.kaydet();
    }
  }

  public async calismaSuresiEkleDakika(dakika: number, kesintisizDakika: number): Promise<void> {
    this.gunKontrolu();
    this.veri.bugun.toplamCalismaDakika += dakika;
    this.veri.toplamOmurBoyuCalismaDakika += dakika;

    if (kesintisizDakika > this.veri.bugun.enUzunKesintisizDakika) {
      this.veri.bugun.enUzunKesintisizDakika = kesintisizDakika;
    }
    if (kesintisizDakika > this.veri.rekorKesintisizDakika) {
      this.veri.rekorKesintisizDakika = kesintisizDakika;
    }

    await this.kaydet();
  }

  public async molaAlindi(): Promise<void> {
    this.gunKontrolu();
    this.veri.bugun.alinanMolaSayisi += 1;
    this.veri.toplamOmurBoyuMola += 1;
    await this.kaydet();
  }

  public async molaErtelendi(): Promise<void> {
    this.gunKontrolu();
    this.veri.bugun.ertelenenMolaSayisi += 1;
    await this.kaydet();
  }

  public async kediSevildi(): Promise<number> {
    this.gunKontrolu();
    this.veri.bugun.sevilmeSayisi += 1;
    await this.kaydet();
    return this.veri.bugun.sevilmeSayisi;
  }

  public getVeri(): IstatistikVerisi {
    this.gunKontrolu();
    return this.veri;
  }

  public getBugun(): GunlukIstatistik {
    this.gunKontrolu();
    return this.veri.bugun;
  }

  public async istatistikleriSifirla(): Promise<void> {
    const bugunTarih = this.bugunTarihFormat();
    this.veri = {
      bugun: this.bosGunOlustur(bugunTarih),
      gecmis: [],
      toplamOmurBoyuMola: 0,
      toplamOmurBoyuCalismaDakika: 0,
      rekorKesintisizDakika: 0
    };
    await this.kaydet();
  }
}

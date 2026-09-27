# Kahve Kedisi (Coffee Cat)

**Kahve Kedisi**, VS Code içinde yaşayan, çalışma sürenizi takip eden, gözlerinizi ve bedeninizi dinlendirmeniz için hatırlatmalar yapan modern ve animasyonlu bir mola / üretkenlik eklentisidir.

---

## Özellikler

- **Animasyonlu Webview Kedi:** Durumunuza göre ruh hali değişen modern vektörel çizim kedi (Mutlu, Uykulu, Huysuz, Mola Modu).
- **İnteraktif Patileme ve Ses:** Kediye tıklayarak sevebilir, mırıldama tonlarını dinleyebilir ve günlük sevgi sayacını takip edebilirsiniz.
- **Akıllı Idle (Boşta Kalma) Tespiti:** Klavyeden uzaktayken veya toplantıdayken çalışma sayacı duraklar, haksız yere mola uyarısı vermez.
- **Mola Karnesi ve İstatistikler:**
  - Bugün kaç mola aldınız?
  - Kaç kez ertelediniz?
  - En uzun kesintisiz odaklanma süreniz ne kadar?
  - Geçmiş günlerin detaylı mola arşivi.
- **Kişilik ve Erteleme Hafızası:** Molayı 2'den fazla ertelerseniz kedi huysuzlaşır, kulaklarını yatırır ve tatlı-sert tepkiler verir.
- **Dahili Web Audio Ses Efektleri:** Dış bağımlılık olmadan bildirim zilleri ve mırıldama tonları.
- **Dinamik Status Bar Entegrasyonu:** Sağ altta çalışma sürenizi ve kedinin durumunu anlık takip edin.

---

## Kullanım ve Komutlar

`Ctrl+Shift+P` (macOS: `Cmd+Shift+P`) ile Komut Paletini açın:

| Komut | Açıklama |
|---|---|
| `Kahve Kedisi: Mola Zamanı Panelini Aç` | Animasyonlu kedi panelini ve kontrolleri açar. |
| `Kahve Kedisi: Mola Karnesi ve İstatistikler` | Mola geçmişinizi ve başarı tablonuzu görüntüler. |
| `Kahve Kedisi: Şimdi Mola Ver` | 5, 10 veya 15 dakikalık mola başlatır. |
| `Kahve Kedisi: Çalışma Sayacını Sıfırla` | Kesintisiz odaklanma sayacını sıfırlar. |
| `Kahve Kedisi: Kediyi Uyut / Duraklat` | Sayacı duraklatır veya tekrar başlatır. |
| `Kahve Kedisi: Kediyi Sev` | Kediyle hızlı etkileşime geçer. |

---

## Ayarlar (Settings)

`settings.json` veya VS Code Ayarlar menüsünden özelleştirebilirsiniz:

```json
{
  "kahveKedisi.molaSuresiDakika": 45,
  "kahveKedisi.idleTespitiAktif": true,
  "kahveKedisi.idleSuresiDakika": 5,
  "kahveKedisi.bildirimTuru": "webview",
  "kahveKedisi.sesEfektiAktif": true,
  "kahveKedisi.kisiselIsim": "Geliştirici"
}
```

---

## Geliştirme ve Test

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
2. Projeyi derleyin:
   ```bash
   npm run compile
   ```
3. Test etmek için **F5** tuşuna basarak yeni bir *Extension Development Host* penceresi açın.
4. Paketlemek için:
   ```bash
   npx @vscode/vsce package
   ```

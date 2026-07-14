# ArchWeb OS'i Windows (.exe) Uygulamasına Dönüştürme Rehberi

Bu projeyi bilgisayarınızda bağımsız bir Windows masaüstü uygulaması (`.exe`) olarak çalıştırmak ve paketlemek için gereken tüm altyapı (Electron ve Electron Builder) hazırlanmıştır. 

Aşağıdaki adımları sırasıyla uygulayarak kendi `.exe` dosyanızı oluşturabilirsiniz:

---

## 1. Projeyi Bilgisayarınıza İndirin
1. AI Studio arayüzünün sağ üst köşesindeki **Settings (Ayarlar)** menüsünü açın.
2. **Export (Dışa Aktar)** seçeneğine tıklayın ve projeyi **ZIP** olarak bilgisayarınıza indirin.
3. İndirdiğiniz `.zip` arşivini bir klasöre çıkartın.

---

## 2. Gerekli Ortamı Hazırlayın
Bilgisayarınızda **Node.js** yüklü olmalıdır. Eğer yüklü değilse:
1. [nodejs.org](https://nodejs.org/) adresinden önerilen (LTS) sürümü indirin ve kurun.
2. Klasörün içinde bir terminal (Komut İstemi veya PowerShell) açın.

---

## 3. Kurulum ve Derleme (Tek Komutla .exe Yapma)
Terminalde sırasıyla şu iki basit komutu çalıştırın:

### Adım A: Bağımlılıkları Yükleyin
```bash
npm install
```
*Bu komut, masaüstü uygulaması yapmak için gereken paketleri bilgisayarınıza kuracaktır.*

### Adım B: Masaüstü Uygulamasını (.exe) Oluşturun
```bash
npm run build:exe
```
*Bu komut, önce web uygulamanızı derler ve ardından saniyeler içinde size iki adet Windows uygulaması hazırlar.*

---

## 4. Uygulamanız Nerede?
İşlem tamamlandığında projenizin ana dizininde **`dist-electron`** adında yeni bir klasör oluşacaktır. Bu klasörün içinde:

1. **`ArchWeb OS for Kids Portable.exe`**: Kurulum gerektirmeyen, doğrudan çift tıklayıp çalıştırabileceğiniz taşınabilir (portable) uygulamadır. USB belleğinize atıp her yerde çalıştırabilirsiniz!
2. **`ArchWeb OS for Kids Setup.exe`**: Bilgisayarınıza masaüstü kısayolu ekleyen standart kurulum dosyasıdır.

---

## Yerel Geliştirme (Masaüstü Modunda Test Etme)
Eğer uygulamayı paketlemeden önce masaüstü penceresinde test etmek isterseniz terminalde şu komutu çalıştırabilirsiniz:
```bash
npm run electron:dev
```

# ArchWeb OS - C# Launcher

Bu dizinde yer alan `Launcher.cs` ve `Launcher.csproj` dosyaları, ArchWeb OS'u Windows üzerinde bir masaüstü uygulaması gibi başlatmak için kullanılan C# kaynak kodlarını içerir.

## Nasıl Derlenir?

1. **Visual Studio ile:**
   - `Launcher.csproj` dosyasını Visual Studio ile açın.
   - `Build` > `Build Solution` yolunu izleyin.
   - `bin/Debug/net6.0/ArchWebLauncher.exe` dosyası oluşacaktır.

2. **.NET CLI ile:**
   ```bash
   dotnet build -c Release
   ```
   Bu komut `bin/Release/net6.0/ArchWebLauncher.exe` dosyasını oluşturur.

## Özellikler
- **Node.js Kontrolü:** Sistemde Node.js yüklü olup olmadığını denetler.
- **Otomatik Kurulum:** `node_modules` eksikse `npm install` çalıştırır.
- **Güncelleme Seçeneği:** Kullanıcıya sistemi güncelleme şansı sunar.
- **Akıllı Başlatma:** Eğer projede Electron yüklüyse masaüstü modunda, değilse tarayıcı modunda başlatır.

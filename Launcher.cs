using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;

namespace ArchWebLauncher
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Title = "ArchWeb OS - Ultimate C# Launcher & Updater";
            Console.WindowWidth = 100;
            Console.WindowHeight = 30;
            Console.ForegroundColor = ConsoleColor.Cyan;

            PrintHeader();

            // 1. Environment Validation
            Console.WriteLine("[1/4] Sistem gereksinimleri kontrol ediliyor...");
            if (!CheckCommandExists("node"))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("[HATA] Node.js bulunamadı!");
                Console.WriteLine("Lütfen https://nodejs.org/ adresinden LTS sürümünü yükleyin.");
                Console.ReadLine();
                return;
            }

            if (!File.Exists("package.json"))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("[HATA] package.json bulunamadı!");
                Console.WriteLine("Lütfen bu dosyayı projenin ana dizininde (root) çalıştırın.");
                Console.ReadLine();
                return;
            }
            Console.WriteLine("[TAMAM] Çalışma ortamı doğrulandı.\n");

            // 2. Update / Install Check
            if (!Directory.Exists("node_modules"))
            {
                Console.ForegroundColor = ConsoleColor.Yellow;
                Console.WriteLine("[BİLGİ] node_modules klasörü bulunamadı. İlk kurulum yapılıyor...");
                RunCommand("npm", "install");
            }

            Console.WriteLine("[2/4] Güncelleme Kontrolü");
            Console.WriteLine("--------------------------------------------------");
            Console.WriteLine("[1] Sistemi Güncelle (npm install)");
            Console.WriteLine("[2] Güncellemeden Devam Et");
            Console.WriteLine("--------------------------------------------------");
            Console.Write("Seçiminizi yapın (Varsayılan 2): ");
            string choice = Console.ReadLine();

            if (choice == "1")
            {
                Console.WriteLine("\n[GÜNCELLEME] Paketler güncelleniyor, lütfen bekleyin...");
                if (RunCommand("npm", "install") == 0)
                {
                    Console.WriteLine("[TAMAM] Güncelleme başarılı.\n");
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("[UYARI] Güncelleme sırasında bazı hatalar oluştu.\n");
                }
            }

            // 3. Execution Mode
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("[3/4] Sistem Modu Seçiliyor...");
            
            bool hasElectron = Directory.Exists(Path.Combine("node_modules", "electron"));
            string script = hasElectron ? "run electron" : "run dev";
            
            if (hasElectron)
                Console.WriteLine("[MOD] Electron (Masaüstü Uygulaması) başlatılıyor...");
            else
                Console.WriteLine("[MOD] Web (Geliştirici) modu başlatılıyor...");

            Console.WriteLine("[NOT] Bu pencereyi kapatmayın, sistem arka planda çalışıyor.\n");

            int exitCode = RunCommand("npm", script);

            // 4. Error Handling
            if (exitCode != 0)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("\n======================================================================");
                Console.WriteLine("[KRİTİK HATA] Sistem beklenmedik bir şekilde durdu.");
                Console.WriteLine("Olası nedenler:");
                Console.WriteLine("1. Port 3000 başka bir uygulama tarafından kullanılıyor.");
                Console.WriteLine("2. Eksik veya hatalı paketler mevcut (npm install deneyin).");
                Console.WriteLine("3. İnternet bağlantısı gerektiren bileşenler yüklenemedi.");
                Console.WriteLine("======================================================================");
            }
            else
            {
                Console.WriteLine("\n[BİLGİ] Oturum güvenli bir şekilde sonlandırıldı.");
            }

            Console.WriteLine("Kapatmak için bir tuşa basın.");
            Console.ReadKey();
        }

        static void PrintHeader()
        {
            Console.WriteLine("======================================================================");
            Console.WriteLine("   ___                _ __      __     _      ____   _____ ");
            Console.WriteLine("  / _ \\              | |\\ \\    / /    | |    / __ \\ / ____|");
            Console.WriteLine(" | |_| | _ __  ___  | | \\ \\  / /  ___ | |__ | |  | | (___  ");
            Console.WriteLine(" |  _  || '__|/ __| | |  \\ \\/ /  / _ \\| '_ \\| |  | |\\___ \\ ");
            Console.WriteLine(" | | | || |  | (__  | |   \\  /  |  __/| |_) | |__| |____) |");
            Console.WriteLine(" \\_| |_/|_|   \\___| |_|    \\/    \\___||_.__/ \\____/|_____/ ");
            Console.WriteLine("======================================================================");
            Console.WriteLine("           GELİŞTİRİLMİŞ C# BAŞLATICI v20.1.2");
            Console.WriteLine("======================================================================");
            Console.WriteLine();
            Console.WriteLine("[SUNUCU ADRESLERİ]");
            Console.WriteLine(" - Genel Canlı Ön İzleme: https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app");
            Console.WriteLine(" - Yerel Bilgisayar:      http://localhost:3000");
            Console.WriteLine("======================================================================\n");
        }

        static bool CheckCommandExists(string cmd)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "where" : "which",
                    Arguments = cmd,
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                using (Process p = Process.Start(psi))
                {
                    p.WaitForExit();
                    return p.ExitCode == 0;
                }
            }
            catch { return false; }
        }

        static int RunCommand(string cmd, string args)
        {
            try
            {
                // Windows'ta npm bir .cmd dosyasıdır
                string shellCmd = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "cmd.exe" : "/bin/bash";
                string shellArgs = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? $"/c {cmd} {args}" : $"-c \"{cmd} {args}\"";

                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = shellCmd,
                    Arguments = shellArgs,
                    UseShellExecute = false,
                    CreateNoWindow = false
                };

                using (Process p = Process.Start(psi))
                {
                    p.WaitForExit();
                    return p.ExitCode;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Hata: {ex.Message}");
                return -1;
            }
        }
    }
}

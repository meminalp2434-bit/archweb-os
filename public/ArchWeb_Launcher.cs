using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;

namespace ArchWebLauncher
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Title = "ArchWeb OS - Desktop C# Launcher";
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("========================================");
            Console.WriteLine("       ARCHWEB OS - DESKTOP C# CORE      ");
            Console.WriteLine("========================================");
            Console.WriteLine("[BILGI] Bu bir C# baslatici scriptidir.");
            Console.WriteLine();
            
            if (!File.Exists("package.json"))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("[HATA] package.json bulunamadi!");
                Console.WriteLine("Lutfen bu dosyayi projenin ana dizinine koyun.");
                Console.ReadLine();
                return;
            }

            Console.WriteLine("[1/2] Bagimliliklar kontrol ediliyor...");
            if (!Directory.Exists("node_modules"))
            {
                Console.WriteLine("npm install calistiriliyor...");
                RunCommand("npm", "install");
            }

            Console.WriteLine("[2/2] Sistem baslatiliyor...");
            RunCommand("npm", "run dev");
        }

        static void RunCommand(string cmd, string args)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c " + cmd + " " + args,
                    UseShellExecute = false
                };
                Process.Start(psi)?.WaitForExit();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Hata olustu: " + ex.Message);
            }
        }
    }
}

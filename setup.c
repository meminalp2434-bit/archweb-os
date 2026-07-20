#include <stdio.h>
#include <stdlib.h>

int main() {
    system("title ArchWeb OS Baslatici");
    printf("====================================================\n");
    printf("ArchWeb OS Baslatiliyor...\n");
    printf("====================================================\n");
    printf("Guncellemeler kontrol ediliyor...\n");
    system("git pull");
    system("npm install");
    printf("====================================================\n");
    printf("Lutfen acilis modunu secin:\n");
    printf("[1] Online Web Surumu (Node.js gerektirmez)\n");
    printf("[2] Yerel Sunucu Modu - http://localhost:3000/ (Node.js gerektirir)\n");
    printf("[3] Electron Masaustu (.exe) Modu (Node.js gerektirir)\n");
    printf("====================================================\n");

    char secim[10];
    printf("Seciminiz (1, 2 veya 3): ");
    if (fgets(secim, sizeof(secim), stdin) != NULL) {
        if (secim[0] == '1') {
            printf("Tarayici aciliyor...\n");
            system("start https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app");
        } else if (secim[0] == '2') {
            printf("Yerel sunucu baslatiliyor...\n");
            system("start http://localhost:3000/");
            system("npm run dev");
        } else if (secim[0] == '3') {
            printf("Electron masaustu uygulamasi baslatiliyor...\n");
            system("npm run electron:start");
        } else {
            printf("Gecersiz secim.\n");
        }
    }
    system("pause");
    return 0;
}

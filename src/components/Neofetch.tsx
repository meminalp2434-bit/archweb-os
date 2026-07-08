import React from 'react';

export const Neofetch: React.FC = () => {
  const archLogo = [
    "                   -`                    ",
    "                  .o+`                   ",
    "                 `ooo/                   ",
    "                `+oooo:                  ",
    "               `+oooooo:                 ",
    "               -+oooooo+:                ",
    "             `/:-:++oooo+:               ",
    "            `/++++/+++++++:              ",
    "           `/++++++++++++++:             ",
    "          `/+++ooooooooooooo/`           ",
    "         ./ooossssqqssosssssso`          ",
    "        .ooosssshhhssshssossssss`        ",
    "       .osssssshhhssshhhssosssssso       ",
    "      /osssssshhhssshhhssshssossssss     ",
    "     /osssssshhhssshhhssshhhssossssss    ",
    "    /osssssshhhssshhhssshhhssshssosss    ",
    "   .osssssshhhssshhhssshhhssshhhssosss   ",
    "  .osssssshhhssshhhssshhhssshhhssshssos  ",
    " .osssssshhhssshhhssshhhssshhhssshhhssos ",
    "/osssssshhhssshhhssshhhssshhhssshhhssshs",
  ];

  const info = [
    { label: "Sistem", value: "ArchWeb OS v2.0 (Arch Linux)" },
    { label: "Makine", value: "Web-Container v1.0" },
    { label: "Çekirdek", value: "6.12.0-arch1-1" },
    { label: "Çalışma Süresi", value: "2 gün, 4 saat, 20 dak" },
    { label: "Paketler", value: "1337 (pacman)" },
    { label: "Kabuk", value: "zsh 5.9" },
    { label: "Çözünürlük", value: `${window.innerWidth}x${window.innerHeight}` },
    { label: "Masaüstü", value: "Hyprland" },
    { label: "Pencere Yöneticisi", value: "Hyprland" },
    { label: "Tema", value: "Adwaita-dark [GTK2/3]" },
    { label: "Simgeler", value: "Adwaita [GTK2/3]" },
    { label: "Uçbirim", value: "ArchWeb-Term" },
    { label: "İşlemci", value: "AMD Ryzen 9 5950X (32) @ 3.400GHz" },
    { label: "Ekran Kartı", value: "NVIDIA GeForce RTX 3090" },
    { label: "Bellek", value: "16GB / 32GB" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 py-4 font-mono text-sm">
      <div className="text-[var(--accent)] leading-none whitespace-pre">
        {archLogo.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-[var(--accent)] font-bold">user@archlinux</div>
        <div className="text-white">--------------</div>
        {info.map((item, i) => (
          <div key={i}>
            <span className="text-[var(--accent)] font-bold">{item.label}:</span>{" "}
            <span className="text-white">{item.value}</span>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <div className="w-4 h-4 bg-black" />
          <div className="w-4 h-4 bg-red-500" />
          <div className="w-4 h-4 bg-green-500" />
          <div className="w-4 h-4 bg-yellow-500" />
          <div className="w-4 h-4 bg-blue-500" />
          <div className="w-4 h-4 bg-magenta-500" />
          <div className="w-4 h-4 bg-cyan-500" />
          <div className="w-4 h-4 bg-white" />
        </div>
      </div>
    </div>
  );
};

#!/bin/bash
awk '
/Dosyayı Yükle \(Cihaza\)/ {
  print $0
  print "          </button>"
  print ""
  print "          {/* Google Drive Sync Button */}"
  print "          <button"
  print "            onClick={async () => {"
  print "              if (!driveToken) {"
  print "                try {"
  print "                  await googleSignIn();"
  print "                } catch (e) {"
  print "                  console.error(e);"
  print "                }"
  print "                return;"
  print "              }"
  print "              setIsSyncingDrive(true);"
  print "              try {"
  print "                await syncToDrive();"
  print "                setDriveSyncSuccess(true);"
  print "                setTimeout(() => setDriveSyncSuccess(false), 3000);"
  print "              } catch(e) {"
  print "                console.error(e);"
  print "              } finally {"
  print "                setIsSyncingDrive(false);"
  print "              }"
  print "            }}"
  print "            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold transition-all shadow-[0_0_10px_rgba(255,255,255,0.15)] ${"
  print "              !driveToken ? \"bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border-gray-500/30\" :"
  print "              driveSyncSuccess ? \"bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30\" :"
  print "              \"bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30\""
  print "            }`}"
  print "            title=\"Google Drive ile Eşitle (archweb operating system)\""
  print "          >"
  print "            {isSyncingDrive ? <RefreshCw size={13} className=\"animate-spin\" /> : <HardDrive size={13} />}"
  print "            <span className=\"hidden sm:inline\">{driveSyncSuccess ? \"Eşitlendi!\" : !driveToken ? \"Drive Bağlan\" : \"Drive Eşitle\"}</span>"
  print "          </button>"
  next
}
/<\/button>/ {
  if (skip_next_button) {
    skip_next_button = 0
    next
  }
}
{
  if ($0 ~ /Dosyayı Yükle \(Cihaza\)/) {
    skip_next_button = 1
  }
  print $0
}
' src/components/FileManager.tsx > src/components/FileManager.tsx.new
mv src/components/FileManager.tsx.new src/components/FileManager.tsx

#!/bin/bash
awk '
/terserOptions:/ {
  skip_terser = 1
  braces = 0
}
{
  if (skip_terser) {
    if (/{/) {
      braces += gsub(/{/, "{")
    }
    if (/}/) {
      braces -= gsub(/}/, "}")
    }
    if (braces <= 0 && /}/) {
      skip_terser = 0
    }
    next
  }
  print $0
}
' vite.config.ts > vite.config.ts.new
mv vite.config.ts.new vite.config.ts

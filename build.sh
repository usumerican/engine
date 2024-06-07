#!/bin/sh

npm run zig:test
npm run zig:wasm
npm run build
npm run lib

zig build -Dtarget=x86_64-windows -Dcpu=x86_64 -Dstrip=true -Dname=engine-windows-x86_64 --prefix dist --verbose --summary all --release=fast
zig build -Dtarget=x86_64-windows -Dcpu=x86_64_v2 -Dstrip=true -Dname=engine-windows-x86_64_v2 --prefix dist --verbose --summary all --release=fast
zig build -Dtarget=x86_64-windows -Dcpu=x86_64_v3 -Dstrip=true -Dname=engine-windows-x86_64_v3 --prefix dist --verbose --summary all --release=fast
zig build -Dtarget=x86_64-windows -Dcpu=x86_64_v4 -Dstrip=true -Dname=engine-windows-x86_64_v4 --prefix dist --verbose --summary all --release=fast

# Z Shogi

Z Shogi は、[Zig](https://ziglang.org/) で実装されたシンプルな将棋エンジンです。

USI 対応の将棋 GUI ソフトで利用できる実行可能ファイルと、WebAssembly 版ライブラリを使った Web アプリを提供しています。

将棋プログラミングについては、[やねうら王](https://github.com/yaneurao/YaneuraOu)を参考にしました。

## 開発

実行可能ファイルのビルドには、Zig が必要です。

```
zig build --release=fast
./zig-out/bin/zshogi
```

WebAssembly 版ライブラリと Web アプリのビルドには、Node.js も必要です。

```
npm run zig:test
npm run zig:wasm
npm run lib
npm run test
npm run build
npm run preview
```

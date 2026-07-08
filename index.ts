// 1. まず確実に環境変数をローカル環境やプロセスにロードします
import dotenv from "dotenv";
dotenv.config();

// 2. 環境変数のロードが完全に終わった「後」に、アプリ本体を動的に読み込んで起動します
import("./src/app");

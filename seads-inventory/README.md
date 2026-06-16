# SEAds 在庫管理システム

学生団体 SEAds のワークショップ用在庫管理システムです。  
Firebase Realtime Database を使ったリアルタイム同期に対応しています。

---

## ファイル構成

```
seads-inventory/
├── index.html          # メインアプリ（全機能）
├── firebase-config.js  # Firebase設定（要書き換え）
├── README.md           # このファイル
└── assets/             # ロゴ・アイコン画像を置くフォルダ
    ├── logo.png        # SEAdsロゴ（32×32px 推奨）
    └── favicon.ico     # ファビコン（任意）
```

> **assets フォルダについて**  
> `assets/logo.png` を配置すると、ヘッダーにSEAdsのロゴが表示されます。  
> 画像が見つからない場合はアイコンフォントで代替表示されます。

---

## セットアップ手順

### ステップ 1: Firebase プロジェクトを作成する

1. [Firebase コンソール](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `seads-inventory`）してプロジェクトを作成

### ステップ 2: Realtime Database を有効化する

1. Firebase コンソール左メニュー「構築」→「Realtime Database」
2. 「データベースを作成」をクリック
3. ロケーション: **asia-southeast1**（シンガポール、日本から近い）を選択
4. セキュリティルール: 開発中は「テストモード」で開始

### ステップ 3: Firebase 設定値を取得する

1. Firebase コンソール 左上の歯車アイコン →「プロジェクトの設定」
2. 「全般」タブ → 下にスクロールして「マイアプリ」セクション
3. アプリがなければ「ウェブ」（`</>`）アイコンでアプリを登録
4. 表示される `firebaseConfig` オブジェクトの値をコピー

### ステップ 4: firebase-config.js を書き換える

`firebase-config.js` を開き、`YOUR_***` の部分をコピーした値で置き換える:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← あなたの値
  authDomain: "seads-xxx.firebaseapp.com",
  databaseURL: "https://seads-xxx-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "seads-xxx",
  storageBucket: "seads-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

> **注意**: `databaseURL` はアジアリージョンの場合 `asia-southeast1` が含まれます。  
> Firebase コンソールの Realtime Database 画面に表示されるURLを使ってください。

### ステップ 5: GitHub リポジトリを作成して Pages を有効化する

```bash
# リポジトリを初期化
git init
git add .
git commit -m "初回コミット: SEAds在庫管理システム"

# GitHubにプッシュ（GitHubでリポジトリを先に作成しておく）
git remote add origin https://github.com/あなたのユーザー名/seads-inventory.git
git push -u origin main
```

GitHubリポジトリの設定:
1. リポジトリの「Settings」→「Pages」
2. Source: **Deploy from a branch** → Branch: `main` / `/ (root)`
3. 「Save」→ 数分後に `https://あなたのユーザー名.github.io/seads-inventory/` で公開

---

## Firebase セキュリティルール

### 開発中（全員が読み書き可能）

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 本番運用（認証ユーザーのみ）

Firebase Authentication を導入後、以下のルールを推奨:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

ルールの変更方法: Firebase コンソール → Realtime Database →「ルール」タブ

---

## データ構造

```json
{
  "workshops": {
    "ワークショップID": {
      "name": "ワークショップ名",
      "description": "説明文",
      "date": "2026-06-01",
      "location": "開催地名",
      "createdAt": 1234567890,
      "parts": {
        "部品ID": {
          "name": "部品名",
          "unit": "個",
          "stock": 10,
          "minStock": 5,
          "updatedAt": 1234567890
        }
      }
    }
  }
}
```

---

## 主な機能

| 機能 | 説明 |
|------|------|
| ワークショップ管理 | 作成・削除・複製 |
| 複製機能 | 部品リストを引き継いで別会場用に複製（在庫数はリセット） |
| 在庫クイック入力 | ±1ボタン・直接入力・補充/使用 |
| 在庫アラート | 最低在庫数を下回ると警告表示 |
| リアルタイム同期 | 複数メンバーが同時操作してもリアルタイム反映 |
| オフライン対応 | 操作を保留し、オンライン復帰時に自動同期 |

---

## ローカルでの動作確認

ブラウザで直接 `index.html` を開くと ES Module の制約でエラーになる場合があります。  
ローカルサーバーを使ってください:

```bash
# Python が使える場合
python -m http.server 8080

# Node.js が使える場合
npx serve .
```

ブラウザで `http://localhost:8080/` を開く。

---

## トラブルシューティング

**「firebase-config.js が見つかりません」と表示される**  
→ `firebase-config.js` が `index.html` と同じフォルダにあるか確認してください。

**「デモモード（Firebase未接続）」と表示される**  
→ `firebase-config.js` の `apiKey` が `YOUR_API_KEY` のままです。ステップ4を実施してください。

**リアルタイム同期されない**  
→ Firebase コンソールの Realtime Database でルールが `".read": true, ".write": true` になっているか確認してください。

**GitHub Pages で動かない**  
→ `databaseURL` が正しいか確認してください（`asia-southeast1` など地域名が含まれます）。

---

## 開発者向け

このアプリはビルドツール不要の純粋なHTML/CSS/JSです。  
Firebase SDK v10 と Font Awesome 6 は CDN から読み込んでいます。

追加のカスタマイズは `index.html` 内の CSS Variables（`:root` セクション）から行えます:

```css
:root {
  --primary: #0058A9;   /* メインカラー */
  --accent: #FF6B35;    /* 警告カラー */
}
```

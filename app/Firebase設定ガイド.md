# Firebase設定ガイド — メンター機能のための完全手順

> この手順に沿って進めれば、Firebase（Googleのクラウドサービス）を設定できます。
> 所要時間：約20〜30分
> 費用：無料（Sparkプラン）

---

## 全体像

```
Firebase で何をするか：

1. Google認証 → 学習者・メンターがGoogleアカウントでログイン
2. Firestore   → 学習データをクラウドに保存（デバイス間同期）
3. メンター連携 → 施設コードで学習者とメンターを紐付け
```

---

## Step 1: Firebase プロジェクトを作成

### 1-1. Firebase コンソールにアクセス

1. https://console.firebase.google.com/ にアクセス
2. Googleアカウントでログイン（持っていなければ作成）
3. **「プロジェクトを追加」** をクリック

### 1-2. プロジェクト設定

1. プロジェクト名: `restrun-study` （何でもOK）
2. 「続行」をクリック
3. **Googleアナリティクス**: 「このプロジェクトでGoogleアナリティクスを有効にする」→ **オフにしてOK**（不要）
4. 「プロジェクトを作成」をクリック
5. 30秒ほど待つと「新しいプロジェクトの準備ができました」と表示される
6. 「続行」をクリック

---

## Step 2: ウェブアプリを追加

1. プロジェクトのダッシュボード画面で、**「</>」（ウェブ）アイコン** をクリック
   - 画面上部に iOS / Android / Web のアイコンが並んでいます。「</>」がWebです

2. アプリのニックネーム: `restrun-study-web` （何でもOK）
3. 「Firebase Hosting も設定する」→ **チェック不要**
4. 「アプリを登録」をクリック

5. **重要：表示される設定情報をコピー！**

以下のような情報が表示されます：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "restrun-study-xxxxx.firebaseapp.com",
  projectId: "restrun-study-xxxxx",
  storageBucket: "restrun-study-xxxxx.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

→ **この情報をメモ帳などにコピーしておいてください！** 後で使います。

6. 「コンソールに進む」をクリック

---

## Step 3: Google認証を有効にする

1. 左メニューの **「構築」→「Authentication」** をクリック
2. 「始める」をクリック
3. 「ログイン方法」タブで **「Google」** をクリック
4. **「有効にする」のトグルをオン** にする
5. **プロジェクトのサポートメール**: 自分のメールアドレスを選択
6. 「保存」をクリック

→ 「Google」の「ステータス」が「有効」になっていればOK

---

## Step 4: Firestore（データベース）を有効にする

1. 左メニューの **「構築」→「Firestore Database」** をクリック
2. 「データベースを作成」をクリック
3. **ロケーション**: `asia-northeast1（東京）` を選択（日本で使うなら東京が最適）
4. セキュリティルール: **「テストモードで開始」** を選択
   - ⚠️ 後で適切なルールに変更しますが、最初はテストモードでOK
5. 「作成」をクリック

→ 30秒ほどでデータベースが作成されます

### 4-1. セキュリティルールを設定

テストモードのままだと30日後に期限切れになるので、適切なルールに変更します。

1. Firestore画面の **「ルール」タブ** をクリック
2. 以下のルールに書き換えてください：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザープロフィール：本人のみ読み書き可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // 施設データ：ログインユーザーは読み取り可、作成は誰でも可
    match /facilities/{code} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    // 学習者データ：同じ施設コードのメンターが読める
    match /learnerStats/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    // メッセージ：受信者のみ読み取り可、メンターが送信可
    match /messages/{msgId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

3. 「公開」をクリック

---

## Step 5: プロジェクトにFirebaseをインストール

ターミナルで以下を実行：

```bash
cd ~/Desktop/app4-restaurant-study
npm install firebase
```

---

## Step 6: 環境変数ファイル（.env.local）を作成

プロジェクトフォルダの直下（app/ と同じ階層）に `.env.local` というファイルを作成します。

```bash
# ファイルの場所: app4-restaurant-study/.env.local
```

中身は、Step 2でコピーした設定情報を使って以下の形式で記入：

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...（あなたのapiKey）
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=restrun-study-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=restrun-study-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=restrun-study-xxxxx.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

⚠️ **値はすべてStep 2でコピーした自分のプロジェクトの情報に差し替えてください！**

---

## Step 7: Vercelに環境変数を設定

.env.local はローカル用です。Vercel（本番環境）にも同じ変数を設定する必要があります。

1. https://vercel.com/ にログイン
2. プロジェクト（restrun-study）を開く
3. **「Settings」タブ** → **「Environment Variables」** をクリック
4. 以下の6つを1つずつ追加（Key と Value をセットで入力）：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | AIzaSy... |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | restrun-study-xxxxx.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | restrun-study-xxxxx |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | restrun-study-xxxxx.firebasestorage.app |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 1234567890 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 1:1234567890:web:abcdef123456 |

各項目で：
- Key欄に変数名を入力
- Value欄に自分の値を入力
- 「Add」をクリック

---

## Step 8: Firebase認証にドメインを追加

Googleログインを Vercel のURLでも使えるようにします。

1. Firebase コンソール → Authentication → 「設定」タブ
2. **「承認済みドメイン」** セクション
3. 「ドメインを追加」をクリック
4. Vercelの本番URL（例: `restrun-study.vercel.app`）を追加
5. 「追加」をクリック

`localhost` はデフォルトで追加されているので、ローカル開発はそのままOKです。

---

## 確認方法

すべて設定できたら、以下の状態になっているはずです：

✅ Firebase コンソールでプロジェクトが作成されている
✅ Authentication で Google ログインが「有効」になっている
✅ Firestore Database が作成され、ルールが設定されている
✅ `npm install firebase` が完了している
✅ `.env.local` にFirebaseの設定値が入っている
✅ Vercel の Environment Variables に6つの値が登録されている
✅ Firebase の承認済みドメインに Vercel の URL が追加されている

→ ここまで完了したら、次のステップ（Google認証のコード実装）に進めます。

---

## トラブルシューティング

### 「Firebase App named '[DEFAULT]' already exists」エラー
→ firebase.js でアプリが二重初期化されています。getApps() を使ったチェックで解決（コードに含まれています）

### Google ログインのポップアップが出ない
→ ブラウザのポップアップブロッカーを無効にしてください

### 「auth/unauthorized-domain」エラー
→ Step 8 の承認済みドメインに Vercel の URL を追加してください

### Firestore の権限エラー
→ Step 4-1 のセキュリティルールを正しく設定してください

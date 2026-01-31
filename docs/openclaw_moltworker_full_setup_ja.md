# OpenClaw × Moltworker（Cloudflare Workers）× Cloudflare Tunnel × Discord  
## “クラウド常駐 + ローカル委任” 2体構成：完全手順書（macOS / Apple Silicon）

> 対象：**自分専用（個人用途）**  
> ゴール：  
> - **クラウド側（Moltworker + OpenClaw in Sandbox）**は PC が OFF でも動く（Google操作などクラウド完結タスク）  
> - **ローカル側（OpenClaw on Mac）**は PC が ON の間だけ動く（ローカルファイル/ローカル実行/ローカルブラウザ等）  
> - 両者を **Cloudflare Tunnel** で安全に中継し、**Discord** から使える  
> - **Secrets（Discord / Z.ai(GLM-4.7) / gogcli）**は漏れにくい形で運用する

---

## 0. 重要な前提（最初に読む）

### 0.1 この構成で「できること / できないこと」
**できる（PC OFFでも）**
- Discord → **クラウド側 OpenClaw** に依頼 →  
  - Gmail/Drive/Calendar など **gogcli を使った Google 操作（クラウド内で完結）**
  - R2 にデータを置く／読む
  - Cloudflare の Sandbox / Browser Rendering 等を使う「クラウド内のブラウザ操作（※Moltworkerが対応している範囲）」

**できない（PC OFFだと無理）**
- **ローカルPCのファイル操作 / ローカルアプリ操作 / ローカルブラウザ操作**  
  → これは「ローカル委任」なので **PCがONのときだけ**実行可能

---

## 1. 全体アーキテクチャ（2体 + 中継）

### 1.1 コンポーネント
- **A) クラウド（Cloudflare Workers）**
  - Moltworker（Worker：ルーティング/認証/実行制御）
  - OpenClaw（Cloudflare Sandbox コンテナ内）
  - R2（永続化ストレージ：任意だが推奨）
- **B) ローカル（あなたのMac）**
  - OpenClaw（Docker）
  - cloudflared（Cloudflare Tunnel：外部公開をせず、Cloudflare へ outbound-only で接続）

### 1.2 通信の流れ（重要）
1) Discord → **クラウドOpenClaw**（常時稼働）  
2) タスクが **「クラウドで完結」**なら、そのままクラウドで実行  
3) タスクが **「ローカルが必要」**なら、クラウドOpenClawが  
   Cloudflare Tunnel 経由で **ローカルOpenClawの“委任受付エンドポイント”**へ転送  
4) ローカルOpenClawが実行して結果をクラウドへ返す → Discordへ返信

---

## 2. 料金の目安（Cloudflare / R2 / Tunnel）

> 正確な料金は、Cloudflare / Z.ai / OpenRouter など利用先の最新ページを必ず確認してください。

### 2.1 Cloudflare Tunnel
- Tunnel 自体は **Cloudflare Zero Trust の機能として利用**します。  
- 一般に「Tunnels」は無料枠で使えるケースが多いですが、**Access（認証）やログ等の機能**でプラン差が出ます。  
- この手順書では **“Cloudflare Access で保護する”**ため、Cloudflare One 側の設定を使います。

> 注意：Cloudflare のプラン体系は変更が起きやすいので、必ず公式の最新プランを確認してください。

### 2.2 R2（推奨）
R2 は「無料枠」が明確です（Standard Storage の Free Tier）。  
- 10 GB-month / 月  
- Class A 100万 req / 月  
- Class B 1000万 req / 月  
- Egress（インターネットへの転送）無料（条件は公式参照）

---

## 3. 必要なもの（チェックリスト）

### 3.1 アカウント
- Cloudflare アカウント（Workers を使う）
- Discord Developer Portal（Bot 作成）
- Z.ai（GLM-4.7 用：OpenAI互換エンドポイントで使う想定）
- Google（個人Gmail。将来 Workspace も増える前提）

### 3.2 ローカル環境（macOS / Apple Silicon）
- Docker Desktop
- Git
- cloudflared（Cloudflare Tunnel クライアント）
- Homebrew（あると便利）

---

## 4. “Secrets運用”の原則（この手順書のポリシー）

### 4.1 Secrets を「置いてよい場所 / ダメな場所」
**ダメ（絶対やらない）**
- GitHub にコミット
- README や設定ファイルをそのまま公開
- Discord に貼る（ログに残る）

**OK（推奨）**
- ローカル：`.env`（Git管理対象外） + OS のキーチェーン（gogcli）
- Cloudflare：Workers の **Secrets（暗号化された環境変数）**
- Cloudflare Access：Service Token（ヘッダで認証）

### 4.2 “最小権限”の具体例
- Discord：自分のサーバー（or DM）だけ許可
- OpenClaw：allowlist（DM/ギルド/ユーザーID）を強制
- Google：gogcli の OAuth スコープは必要最小限、別アカウント運用も検討

---

# PART A：クラウド（Moltworker + OpenClaw in Sandbox）

## A-1. Moltworker を公式推奨でデプロイ

> Moltworker は Cloudflare Workers / Sandbox SDK を使う前提。  
> Sandbox SDK は Workers の有料プランが必要になる場合があります（公式参照）。

### A-1-1. リポジトリ取得
（例：GitHub から clone）

```bash
git clone https://github.com/cloudflare/moltworker.git
cd moltworker
```

### A-1-2. Wrangler セットアップ
```bash
npm install -g wrangler
wrangler login
```

### A-1-3. R2 バケット作成（推奨）
```bash
wrangler r2 bucket create openclaw-state
```

> R2 料金・無料枠は公式を参照（Free tier あり）。

### A-1-4. Workers Secrets を登録（重要）
Cloudflare は **Secrets** として保存すると、ダッシュボードにも平文で出ません。

例：
```bash
wrangler secret put DISCORD_BOT_TOKEN
wrangler secret put ZAI_API_KEY
wrangler secret put ZAI_BASE_URL
wrangler secret put OPENCLAW_MODEL
wrangler secret put LOCAL_DELEGATE_URL
wrangler secret put CF_ACCESS_CLIENT_ID
wrangler secret put CF_ACCESS_CLIENT_SECRET
```

推奨値の例：
- `ZAI_BASE_URL`：Z.ai の OpenAI互換 Base URL（Z.ai公式に従う）
- `OPENCLAW_MODEL`：`GLM-4.7`（OpenAI互換で指定）
- `LOCAL_DELEGATE_URL`：後で作る `https://local-openclaw.yourdomain.com/...`
- `CF_ACCESS_*`：Cloudflare Access の Service Token

### A-1-5. Moltworker をデプロイ
```bash
wrangler deploy
```

---

## A-2. クラウド側 OpenClaw の“Google操作”を gogcli で実現する方針

### 方針
- **クラウド側 OpenClaw** は “Google操作” を **gogcli** で行う  
- gogcli は OAuth トークンを **OS Keychain**（macOS/Windows/Linux それぞれ）に保存するが、  
  **Sandbox/コンテナ環境では Keychain が使えない**ことがある  
  → その場合は **gogcli の headless / file keyring モード**を使う（暗号化 + パスワード）

> 重要：gogcli は “OAuth クライアント秘密鍵(JSON)” を絶対に公開しないこと。  
> （gogcli のドキュメントでも「コミットしない」旨が明確）

### A-2-1. Google OAuth クライアントを作る
1. Google Cloud Console → 新規プロジェクト（例：OpenClawAgent）  
2. OAuth 同意画面 → 外部 → テストユーザーに自分の Gmail を追加  
3. 認証情報 → OAuth クライアントID作成（デスクトップアプリ推奨）  
4. `client_secret_*.json` をダウンロード

### A-2-2. クラウド実行に向けた「トークンの保管」
- **推奨：R2に暗号化した認証情報を置く**（Moltworker の想定にも合う）
- 代替：Cloudflare KV/D1 など（ただし秘密情報は注意）

（実装レベルは Moltworker の提供スクリプト/設定に従ってください）

---

# PART B：ローカル（Dockerで OpenClaw + cloudflared）

## B-1. ローカルOpenClaw：Dockerで最小権限運用

### B-1-0. まず結論（あなたの要件に最適）
- OpenClaw の公式は **Docker Quick start** を提供しており、`./docker-setup.sh` が推奨される  
- ただし “最小権限 + 作業フォルダ限定 + ログ永続化” を強めるために、公式composeをベースに **ハードニング**します

### B-1-1. 作業ディレクトリを作る
```bash
mkdir -p ~/openclaw-local/{data,workspace,logs}
cd ~/openclaw-local
```

- `data/`：OpenClawの状態（認証プロファイルなど）
- `workspace/`：あなたが許可する作業フォルダ（ここだけ触れる）
- `logs/`：ログ永続化（監査に使う）

### B-1-2. OpenClaw を取得（公式推奨：repo + docker-setup.sh）
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
```

公式の Quick start（推奨）：
```bash
./docker-setup.sh
```

> ここで生成される `.env` や compose を、次のハードニング版に置き換えます。

---

## B-2. “ハードニング済み docker-compose.yml” を配置

### 重要ポイント（最小権限）
- `read_only: true`（ルートFSを書き込み不可）
- `tmpfs`（一時書き込みはメモリへ）
- `cap_drop: [ALL]`
- `security_opt: [no-new-privileges:true]`
- `user: "node"`（rootで動かさない）
- `volumes` を **必要最小限**にする（作業フォルダ限定）

---

### ✅ docker-compose.yml（ローカル用：推奨）
> 以下を `~/openclaw-local/docker-compose.yml` に保存

```yaml
services:
  openclaw:
    # 公式は docker-setup.sh で build を推奨（repo rootで build される）
    # ここでは「ビルド済みイメージ」を使う想定にして、運用を安定させます。
    # もし build が必要なら `build: ../openclaw` のように調整してください。
    image: openclaw:local
    container_name: openclaw-local
    restart: unless-stopped

    # 最小権限
    user: "node"
    read_only: true
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL

    # 環境変数（Secretsは .env に置き、Git管理しない）
    env_file:
      - .env

    environment:
      # OpenClawはHOME配下に設定を保存する設計
      HOME: /home/node

      # OpenClawの設定で env var substitution ${VAR} が使える（公式）
      # 例：gateway.auth.token を ${OPENCLAW_GATEWAY_TOKEN} にする

    # 必要な永続化だけ許可
    volumes:
      # OpenClaw 状態（認証、セッションなど）
      - ./data:/home/node/.openclaw:rw
      # 触ってよい作業フォルダ（これ以外は触れない）
      - ./workspace:/home/node/workspace:rw
      # ログ永続化
      - ./logs:/home/node/logs:rw

    # tmpfs（read_onlyでも一時書き込みできる）
    tmpfs:
      - /tmp
      - /home/node/.cache

    # ポートは原則「外部公開しない」
    # ローカル確認用に localhost バインドのみ（必要なら）
    ports:
      - "127.0.0.1:18789:18789"

    # ヘルスチェック（任意）
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 30s
      timeout: 5s
      retries: 3
```

---

### ✅ .env（ローカル用：絶対にコミットしない）
> `~/openclaw-local/.env` に保存（`chmod 600 .env` 推奨）

```dotenv
# --- Discord（ローカルは使わないなら空でもOK） ---
DISCORD_BOT_TOKEN=

# --- OpenClaw Gateway Token（ローカルUI/APIの保護用） ---
OPENCLAW_GATEWAY_TOKEN=__CHANGE_ME__

# --- ローカルで使うモデル（必要なら） ---
# 例：Z.ai を OpenAI互換で使うなら base_url + api key を入れる
ZAI_API_KEY=__CHANGE_ME__
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
OPENCLAW_MODEL=GLM-4.7

# --- “委任受付”の保護（Cloudflare Access Service Tokenで守る） ---
CF_ACCESS_CLIENT_ID=__CHANGE_ME__
CF_ACCESS_CLIENT_SECRET=__CHANGE_ME__
```

---

## B-3. ローカルOpenClawを起動
```bash
cd ~/openclaw-local
docker compose up -d
docker compose logs -f
```

### 動作確認（ローカルのみ）
```bash
curl -I http://127.0.0.1:18789
```

---

# PART C：Cloudflare Tunnel（Moltworker → local の中継）

## C-1. Tunnel の基本（重要）
- Tunnel は **outbound-only**：ローカルPCが Cloudflare に接続し、外からのアクセスは Cloudflare 経由で到達する
- ローカルOpenClawは **外に直接公開しない**
- 入口は Cloudflare 側（Accessで認証）にする

---

## C-2. cloudflared をインストール（macOS）
```bash
brew install cloudflared
```

---

## C-3. Tunnel 作成（推奨：remotely-managed）
公式は remotely-managed を推奨しています。  
（ダッシュボード管理で運用が楽）

1) 認証
```bash
cloudflared tunnel login
```

2) Tunnel 作成
```bash
cloudflared tunnel create openclaw-local
```

3) DNS ルート（例：local-openclaw.example.com）
```bash
cloudflared tunnel route dns openclaw-local local-openclaw.example.com
```

---

## C-4. Tunnel 設定ファイル（cloudflared）
`~/.cloudflared/config.yml` を作成：

```yaml
tunnel: openclaw-local
credentials-file: /Users/<you>/.cloudflared/<TUNNEL_ID>.json

ingress:
  # ローカルOpenClaw Gateway（localhost へ）
  - hostname: local-openclaw.example.com
    service: http://127.0.0.1:18789
  - service: http_status:404
```

起動：
```bash
cloudflared tunnel run openclaw-local
```

---

## C-5. Cloudflare Access で “入口” を保護（超重要）
### 目的
Moltworker 以外（＝インターネット上の第三者）が、あなたのローカルOpenClawに到達できないようにする。

### 手順（概要）
1) Cloudflare Zero Trust → Access → Applications → Add an application  
2) “Self-hosted” を選択  
3) 対象ホスト：`local-openclaw.example.com`  
4) Policy：  
   - **Service Token**（Moltworkerが使う）を許可  
   - それ以外は拒否（必要なら自分のメールログインも追加）

### Service Token を作る
Access → Service Auth → Create Service Token  
- Client ID / Client Secret を取得  
- これを Moltworker の Secrets（`CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET`）へ登録

---

# PART D：Discord（Bot トークンで接続）

## D-1. Discord Bot 作成（Botトークン方式）
1) Discord Developer Portal → New Application  
2) Bot → Add Bot  
3) Token を発行（コピー）
4) Privileged Gateway Intents：必要に応じて ON  
5) OAuth2 → URL Generator：bot + (必要なら) applications.commands  
6) 自分のDiscordサーバーへ招待

---

## D-2. “クラウド側 OpenClaw” を Discord に接続
- `DISCORD_BOT_TOKEN` を Cloudflare Workers Secret に登録済みであること
- OpenClaw のチャンネル設定で Discord を enable  
  - allowlist（自分だけ）を必ず設定

---

# PART E：Z.ai（GLM-4.7）を OpenAI互換で使う

## E-1. 重要ポイント
Z.ai は「OpenAI Protocol」で使える形をドキュメントに明記しています：
- OpenAI Protocol を選ぶ
- API Key を設定
- Base URL を `https://api.z.ai/api/coding/paas/v4` にする
- model を `GLM-4.7` などで指定

OpenClaw 側は **env var substitution**（`${VAR}`）が使えるため、  
キーやURLは Secrets/環境変数に置き、設定ファイルはプレースホルダで運用できます。

---

# PART F：gogcli（Google操作）

## F-1. ローカル（macOS）での gogcli（開発・検証）
### インストール
```bash
brew install steipete/tap/gogcli
```

### OAuth 認証
```bash
gog auth credentials ~/Downloads/client_secret.json
gog auth add you@gmail.com
export GOG_ACCOUNT=you@gmail.com
gog gmail labels list
```

gogcli は OAuth トークンを OS Keychain に保存する（macOSは Keychain）ため、  
ローカルでは運用がかなり安全です。

---

## F-2. クラウドでの gogcli（PC OFFでも動かす）
- Sandbox/コンテナでは OS Keychain が無い場合がある  
- gogcli は keyring の fallback（暗号化 + パスワード）をサポートする  
- **GOG_KEYRING_PASSWORD を Workers Secrets 等で渡す**設計をとり、  
  認証情報を R2 に置く・復元する流れに合わせる

> ここは Moltworker の“公式の実装/推奨手順”に合わせてください（最も安全）。

---

# PART G：ローカル委任（クラウド → ローカル）を OpenClaw の “skills” で運用する

## G-1. “skills分離”の設計（推奨）
### 目的
- クラウド側：Google操作（gogcli）中心。ローカルアクセス禁止
- ローカル側：ファイル操作・ローカル実行・ローカルブラウザ操作（必要なときだけ）

### 推奨ディレクトリ構成
- クラウドOpenClaw：`skills/google/*` のみ
- ローカルOpenClaw：`skills/local/*` のみ
- “委任” は **HTTP呼び出し**として実装し、ローカル側のみ危険ツールを持つ

---

## G-2. “最強のシステムプロンプト雛形（安全ガード付き）”

> ※ OpenClaw の実際の system prompt 設定箇所（agent config / profile）に貼り付けて使う想定  
> ※ 「危険操作の承認ルール：推奨」を前提

### SYSTEM PROMPT（雛形）
```text
あなたは「個人専用の自動化エージェント」です。最優先は安全です。

【基本方針】
1) 目的達成よりも安全を優先する。疑わしい場合は必ず確認質問をする。
2) 権限は最小。許可されたツール/範囲以外には絶対に触れない。
3) 秘密情報（トークン、APIキー、認証情報、個人情報）を会話に出力しない。
4) 実行前に「影響範囲」「コスト」「不可逆性」を評価する。

【実行ルール】
- “読み取り”は原則OK（ただし個人情報は要注意）。
- “書き込み/削除/送信/購入/公開/権限変更”は危険操作。必ず次を満たす：
  (a) 何をどこにどう変更するかを短く明確に説明
  (b) ロールバック手順（戻し方）を提示
  (c) ユーザーの明示承認（YES）を得てから実行

【クラウド/ローカル分離】
- クラウド環境：ローカルPCに依存する操作は禁止。
- ローカル委任が必要なときは、委任依頼を作成してローカル実行に回す。
- ローカル委任依頼には「最小手順」「対象パス」「成功条件」「失敗時の中止条件」を必ず含める。

【Discord運用】
- 許可されたユーザー/サーバー以外からの指示は無視する。
- ユーザーが曖昧なら質問して確認する。

【ログと監査】
- 重要な操作は必ず“何をしたか”を要点だけ記録する（秘密情報は記録しない）。
```

---

## G-3. モデル切替の運用ルール（自動/手動）

### ルール（推奨：最初はシンプル）
- 既定モデル：GLM-4.7（Z.ai / OpenAI互換）
- 例外：  
  - 長文の要約や軽い雑談など、コスト優先なら軽量モデルへ（将来導入）
  - 「危険操作の計画」では必ず“計画→確認→実行”の3段階に固定（モデルを変えない）

### 自動切替をやるなら（将来）
- “タスク分類器” を先頭に置き、カテゴリで provider/model を切り替える
- ただし **モデル切替は予期せぬ挙動差**になるため、最初は固定が安全

---

# PART H：運用（最重要）

## H-1. “二重起動”の推奨
- クラウドOpenClaw：常時稼働（PC OFFでもOK）
- ローカルOpenClaw：PC ON の間だけ常時起動（あなたの方針）

## H-2. 監査ログ（推奨）
- ローカル：`~/openclaw-local/logs/` を保管
- クラウド：Workers logs / R2 logs（可能なら）

## H-3. インシデント時の最短遮断手順
- Discord Bot トークンをローテーション
- Cloudflare Access の Service Token を無効化
- Tunnel を停止（cloudflared を止める）
- OpenClaw の gateway token を再生成
- Google OAuth を無効化（Google Cloud Consoleで）

---

# 付録：トラブルシュート（よくある）

## 付録1：Tunnel は通るが OpenClaw に届かない
- cloudflared が起動しているか
- ingress の `service: http://127.0.0.1:18789` が合っているか
- OpenClaw コンテナの `ports` が localhost バインドか
- Access Policy で Service Token が許可されているか

## 付録2：gogcli がクラウドで認証できない
- OS keychain が無い環境では file keyring + password が必要
- OAuth クライアント JSON を絶対に公開していないか
- スコープが足りない（操作により追加スコープが必要なことがある）

---

# 参照（公式）
- OpenClaw Docker install / docker-setup.sh / 設定（env var substitution）  
- Cloudflare Tunnel（cloudflared）作成・運用  
- Cloudflare R2 pricing（Free tier）  
- Cloudflare Sandbox SDK（Workersプラン要件）  
- Z.ai docs（OpenAI Protocol / Base URL / model 名）  
- gogcli docs（Keychain/Keyring、auth コマンド、安全注意）

---

## 最後に（次にやること）
この手順書は “骨格” と “安全な運用の型” を完成させています。  
次のステップは **Moltworker が提供する実装（OpenClaw Sandbox / R2 / gogcli の連携方法）に合わせて**、

- `wrangler.toml`（R2 binding / Secrets）
- OpenClaw のチャンネル設定（Discord allowlist）
- ローカル委任エンドポイントのパス（OpenClawのどのURLを叩くか）

をあなたの実環境に合わせて埋めるだけです。


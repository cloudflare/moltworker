# OpenClaw × Moltworker 次のステップ完全手順書（実動レベル仕上げ）
## 2体構成（クラウド常駐 + ローカル委任）を「本当に動く状態」にする

> 対象：前回の手順書 `openclaw_moltworker_full_setup_ja.md` を完了した人  
> 目的：  
> 1) **クラウド（Moltworker）を実動レベルに仕上げる**  
> 2) **Cloudflare Tunnel + Access で安全に中継する**  
> 3) **クラウド側に gogcli を載せて Google操作を PC OFF でも実行**  
> 4) **Discord運用（コマンド体系＋承認ゲート）を完成**  
> 5) **ローカルOpenClawを常駐（launchd）＋最小権限で安定稼働**

---

# 0. この手順書の前提

## 0.1 完了していること（チェック）
- Cloudflareアカウントがある
- Moltworker repo を取得している
- Workersへデプロイできる状態（wrangler login 済み）
- R2 bucket を作っている（または作る）
- Discord Bot token を取得済み
- ローカル側：Docker Desktop 導入済み
- ローカル側：cloudflared 導入済み

---

# 1) クラウド側（Moltworker）を実動レベルに仕上げる

> ここでは「誰が読んでも迷わない」ように、構成の“型”を固定します。

## 1.1 重要な設計方針（固定）
- Moltworker は **Discordの入口**
- クラウドOpenClawは **Google操作（gogcli）担当**
- ローカルOpenClawは **PC操作担当**
- ローカル委任は **Tunnel + Access で保護されたURL**だけに飛ばす

---

## 1.2 Moltworker の設定を整理する（Secrets一覧）
Cloudflare Workers の Secrets として登録します（平文で repo に置かない）。

### 必須 Secrets（最小）
- `DISCORD_BOT_TOKEN`：Discord Bot Token（クラウド用）
- `ZAI_API_KEY`：GLM-4.7用APIキー
- `ZAI_BASE_URL`：Z.ai OpenAI互換 Base URL
- `OPENCLAW_MODEL`：例 `GLM-4.7`
- `LOCAL_DELEGATE_URL`：ローカル委任URL（Accessで保護されたURL）
- `CF_ACCESS_CLIENT_ID`：Cloudflare Access Service Token Client ID
- `CF_ACCESS_CLIENT_SECRET`：Cloudflare Access Service Token Client Secret

### 推奨 Secrets（運用品質向上）
- `ALLOW_DISCORD_GUILD_ID`：許可サーバーID（自分用）
- `ALLOW_DISCORD_CHANNEL_ID`：許可チャンネルID
- `ALLOW_DISCORD_USER_ID`：許可ユーザーID（あなた）

> allowlist を env で持たせておくと、Discordで誤爆しません。

---

## 1.3 Wrangler で Secrets を登録（コピペ）
```bash
cd moltworker
wrangler login

wrangler secret put DISCORD_BOT_TOKEN
wrangler secret put ZAI_API_KEY
wrangler secret put ZAI_BASE_URL
wrangler secret put OPENCLAW_MODEL
wrangler secret put LOCAL_DELEGATE_URL
wrangler secret put CF_ACCESS_CLIENT_ID
wrangler secret put CF_ACCESS_CLIENT_SECRET

wrangler secret put ALLOW_DISCORD_GUILD_ID
wrangler secret put ALLOW_DISCORD_CHANNEL_ID
wrangler secret put ALLOW_DISCORD_USER_ID
```

---

## 1.4 `wrangler.toml` のテンプレ（R2 bind あり）
> Moltworker repo の構成に合わせて置き場所は調整してください。  
> まずはプロジェクトルート `moltworker/wrangler.toml` に作る想定。

```toml
name = "moltworker-openclaw"
main = "src/index.ts"
compatibility_date = "2026-01-31"

# === R2（永続化）===
[[r2_buckets]]
binding = "R2_STATE"
bucket_name = "openclaw-state"

# === ログやデバッグ ===
[vars]
ENVIRONMENT = "prod"
```

> 注意：moltworker の実際の entrypoint は repo により違う可能性があります。  
> `main` は必ず repo の README / package.json / src 構成に従ってください。

---

## 1.5 デプロイ
```bash
wrangler deploy
```

---

## 1.6 初回の動作確認（Discord）
Discordで、Botがいるチャンネルに以下を送る：

- `!cloud ping`
- `!cloud 今日の予定を箇条書きにして`
- `!cloud Gmailで “請求書” のメールを探して要約して（※後でgogcliが必要）`

---

# 2) Cloudflare Tunnel + Access の中継構成（Moltworker → local）

## 2.1 目的
- ローカルOpenClawを **インターネットに公開しない**
- Moltworker からだけアクセス可能にする（AccessのService Token）

---

## 2.2 ローカル側：Tunnel の作成（macOS）
```bash
brew install cloudflared
cloudflared tunnel login
cloudflared tunnel create openclaw-local
```

---

## 2.3 ローカル側：DNS ルート
```bash
cloudflared tunnel route dns openclaw-local local-openclaw.example.com
```

---

## 2.4 ローカル側：Ingress 設定（config.yml）
`~/.cloudflared/config.yml`

```yaml
tunnel: openclaw-local
credentials-file: /Users/<you>/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: local-openclaw.example.com
    service: http://127.0.0.1:18789
  - service: http_status:404
```

起動：
```bash
cloudflared tunnel run openclaw-local
```

---

## 2.5 Cloudflare Access：Self-hosted App 作成
Zero Trust → Access → Applications → Add an application → **Self-hosted**

- Application domain：`local-openclaw.example.com`
- Policy：**Service Token** を許可
- それ以外：拒否（deny）

---

## 2.6 Service Token を発行して Secrets に入れる
Access → Service Auth → Create Service Token  
- Client ID / Client Secret を控える
- Moltworker の Secrets に入れる

---

## 2.7 Moltworker → ローカル疎通テスト
### 2.7.1 ローカル側の確認
```bash
curl -I http://127.0.0.1:18789
```

### 2.7.2 Access経由の確認（ヘッダ付き）
```bash
curl -I "https://local-openclaw.example.com" \
  -H "CF-Access-Client-Id: <CLIENT_ID>" \
  -H "CF-Access-Client-Secret: <CLIENT_SECRET>"
```

HTTP 200系が返ればOK。

---

# 3) gogcli をクラウドに載せて「Google操作をPC OFFでも実行」

## 3.1 結論：クラウド側は「Keychainが無い」前提で設計する
macOSではKeychainで安全ですが、Workers/Sandboxでは使えないことが多いです。

よって：
- **認証情報は暗号化して保管**
- **復元して利用**
- **破棄**

というフローにします。

---

# 4) Discord運用（コマンド体系 + 承認ゲート）

## 4.1 推奨コマンド（固定）
- `!cloud <指示>` → クラウド（Moltworker）
- `!local <指示>` → ローカル（委任が必要なときだけ）
- `!approve` → 承認
- `!cancel` → キャンセル

---

# 5) ローカルOpenClaw（Docker）を常駐化（Mac launchd）

## 5.1 launchd で cloudflared を常駐化
`~/Library/LaunchAgents/com.ryo.cloudflared.openclaw.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
 "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.ryo.cloudflared.openclaw</string>

    <key>ProgramArguments</key>
    <array>
      <string>/opt/homebrew/bin/cloudflared</string>
      <string>tunnel</string>
      <string>run</string>
      <string>openclaw-local</string>
    </array>

    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>

    <key>StandardOutPath</key>
    <string>/Users/ryo/openclaw-local/logs/cloudflared.out.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/ryo/openclaw-local/logs/cloudflared.err.log</string>
  </dict>
</plist>
```

有効化：
```bash
launchctl load ~/Library/LaunchAgents/com.ryo.cloudflared.openclaw.plist
launchctl start com.ryo.cloudflared.openclaw
```

---

# 6) 完成チェック
- [ ] PC OFFでも `!cloud` が動く
- [ ] PC ONで `!local` が動く
- [ ] 送信系は `!approve` が必要

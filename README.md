# D99 - Advanced Discord Bot

<p align="center">
  <img src="https://img.shields.io/badge/Discord.js-14.25.1-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord.js">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License">
</p>

---

## Daftar Isi

- [Tentang Bot](#tentang-bot)
- [Fitur Utama](#fitur-utama)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Struktur Folder](#struktur-folder)
- [Daftar Command](#daftar-command)
  - [Moderation](#moderation)
  - [Auto Moderation](#auto-moderation)
  - [Logging](#logging)
  - [Welcome & Farewell](#welcome--farewell)
  - [Ticket System](#ticket-system)
  - [Leveling XP](#leveling-xp)
  - [Economy](#economy)
  - [Games](#games)
  - [Fun & Entertainment](#fun--entertainment)
- [Event Handlers](#event-handlers)
- [Sistem Global](#sistem-global)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Tentang Bot

**D99** adalah Discord Bot serbaguna yang dirancang untuk mengelola server Discord dengan fitur lengkap. Bot ini dibangun menggunakan **Discord.js v14** dengan arsitektur command handler modular yang memudahkan pengembangan dan maintenance.

### Keunggulan:
- Modular Command System
- Event-driven Architecture
- In-memory Data Storage (Map-based)
- Slash Commands & Prefix Commands Support
- Interactive Components (Buttons, Select Menus)
- Multi-language Support (Indonesian)

---

## Fitur Utama

| Kategori | Jumlah Command | Deskripsi |
|----------|----------------|-----------|
| Moderation | 35 | Perintah moderasi lengkap |
| Auto Moderation | 25 | Proteksi otomatis server |
| Logging | 30 | Audit log semua aktivitas |
| Welcome & Farewell | 18 | Sambutan & perpisahan member |
| Ticket System | 21 | Sistem tiket support |
| Leveling XP | 31 | Sistem leveling & XP |
| Economy | 42 | Sistem ekonomi virtual |
| Games | 35 | Berbagai game interaktif |
| Fun & Entertainment | 40 | Perintah hiburan |

**Total: 277+ Commands**

---

## Instalasi

### Prasyarat
- Node.js v18.0.0 atau lebih baru
- npm atau yarn
- Discord Bot Token

### Langkah Instalasi

```bash
# Clone repository
git clone https://github.com/Ulpy1311/D99.git
cd D99

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan token bot Anda

# Jalankan bot
npm start
```

---

## Konfigurasi

Buat file `.env` di root folder dengan format:

```env
TOKEN=your_discord_bot_token
PREFIX=g!
OWNER_ID=your_user_id
DEVELOPER_ROLE_ID=your_developer_role_id
```

| Variable | Deskripsi |
|----------|-----------|
| `TOKEN` | Discord Bot Token dari Developer Portal |
| `PREFIX` | Prefix command (default: g!) |
| `OWNER_ID` | ID User owner bot |
| `DEVELOPER_ROLE_ID` | ID Role developer |

---

## Struktur Folder

```
D99/
├── bot.js                    # Main file bot
├── package.json              # Dependencies
├── .env                      # Environment variables
├── README.md                 # Dokumentasi
│
├── Moderation/               # Commands moderasi
│   ├── Ban.js
│   ├── Kick.js
│   ├── Warn.js
│   └── ... (35 files)
│
├── Auto Moderation/          # Auto-mod commands
│   ├── Anti_Spam.js
│   ├── Anti_Raid.js
│   └── ... (25 files)
│
├── Logging/                  # Logging system
│   ├── Set_Log_Channel.js
│   ├── Message_Delete_Log.js
│   └── ... (30 files)
│
├── Welcome & Farewell/       # Welcome system
│   ├── Welcome_Setup.js
│   ├── Farewell_Setup.js
│   └── ... (18 files)
│
├── Ticket System/            # Ticket management
│   ├── Ticket_Create.js
│   ├── Ticket_Close.js
│   └── ... (21 files)
│
├── Leveling XP/              # XP & Leveling
│   ├── Rank.js
│   ├── Leaderboard.js
│   └── ... (31 files)
│
├── Economy/                  # Virtual economy
│   ├── Balance.js
│   ├── Shop.js
│   └── ... (42 files)
│
├── Games/                    # Interactive games
│   ├── Tic_Tac_Toe.js
│   ├── Trivia.js
│   └── ... (35 files)
│
├── Fun & Entertainment/      # Fun commands
│   ├── Joke.js
│   ├── Meme.js
│   └── ... (40 files)
│
├── Database/                 # Database storage
│
└── node_modules/             # Dependencies
```

---

## Daftar Command

### Moderation

Perintah moderasi untuk mengelola member server.

| Command | Deskripsi |
|---------|-----------|
| `g!ban <user> [reason]` | Ban member dari server |
| `g!unban <user_id>` | Unban member yang ter banned |
| `g!kick <user> [reason]` | Kick member dari server |
| `g!warn <user> <reason>` | Beri warning kepada member |
| `g!warnings <user>` | Lihat daftar warning member |
| `g!clearwarns <user>` | Hapus semua warning member |
| `g!timeout <user> <duration> [reason]` | Timeout member sementara |
| `g!untimeout <user>` | Hapus timeout member |
| `g!tempban <user> <duration> [reason]` | Ban sementara |
| `g!softban <user> [reason]` | Ban lalu unban (hapus pesan) |
| `g!massban <users...>` | Ban banyak member sekaligus |
| `g!purge <amount>` | Hapus pesan (1-100) |
| `g!purge user <user>` | Hapus pesan dari user tertentu |
| `g!purge bots` | Hapus pesan dari bot |
| `g!purge embeds` | Hapus pesan dengan embed |
| `g!purge attachments` | Hapus pesan dengan attachment |
| `g!purge contains <text>` | Hapus pesan mengandung teks |
| `g!slowmode <seconds>` | Set slowmode channel |
| `g!lockdown` | Lock channel |
| `g!unlock` | Unlock channel |
| `g!lockserver` | Lock semua channel server |
| `g!unlockserver` | Unlock semua channel server |
| `g!quarantine <user>` | Isolasi member (remove all roles) |
| `g!nickname <user> <nickname>` | Set nickname member |
| `g!resetnick <user>` | Reset nickname member |
| `g!resetallnicks` | Reset semua nickname server |
| `g!move <user> <channel>` | Pindahkan member ke voice channel |
| `g!disconnect <user>` | Disconnect member dari voice |
| `g!voicemute <user>` | Mute member di voice |
| `g!voicedeafen <user>` | Deafen member di voice |
| `g!warnthreshold <count>` | Set batas warning auto-ban |
| `g!caseinfo <case_id>` | Lihat detail kasus moderasi |
| `g!modhistory <user>` | Lihat riwayat moderasi member |
| `g!editreason <case_id> <reason>` | Edit alasan kasus |

### Auto Moderation

Sistem proteksi otomatis server.

| Command | Deskripsi |
|---------|-----------|
| `g!automod setup` | Setup auto moderation |
| `g!automod log <channel>` | Set channel log automod |
| `g!automod whitelist add <role/user>` | Tambah whitelist |
| `g!automod whitelist remove <role/user>` | Hapus whitelist |
| `g!antispam [on/off]` | Toggle anti spam |
| `g!antiraid [on/off]` | Toggle anti raid |
| `g!antinuke [on/off]` | Toggle anti nuke |
| `g!anticaps [on/off]` | Toggle anti caps lock |
| `g!antilink [on/off]` | Toggle anti link |
| `g!antiinvite [on/off]` | Toggle anti invite Discord |
| `g!antiscam [on/off]` | Toggle anti scam link |
| `g!antiemoji [on/off]` | Toggle anti emoji spam |
| `g!antisticker [on/off]` | Toggle anti sticker spam |
| `g!antimention [on/off]` | Toggle anti mass mention |
| `g!antighostping [on/off]` | Toggle anti ghost ping |
| `g!antialt [on/off]` | Toggle anti alt account |
| `g!antihoisting [on/off]` | Toggle anti hoisting |
| `g!antizalgo [on/off]` | Toggle anti zalgo text |
| `g!antirepeated [on/off]` | Toggle anti repeated text |
| `g!wordfilter` | Kelola word filter |
| `g!wordfilter add <word>` | Tambah kata terlarang |
| `g!wordfilter remove <word>` | Hapus kata terlarang |
| `g!wordfilter list` | Lihat daftar kata terlarang |

### Logging

Sistem audit log untuk memantau aktivitas server.

| Command | Deskripsi |
|---------|-----------|
| `g!setlog <channel>` | Set channel log utama |
| `g!avatarlog [on/off]` | Log perubahan avatar |
| `g!boostlog [on/off]` | Log server boost |
| `g!bulkdeletelog [on/off]` | Log penghapusan massal |
| `g!channelcreatelog [on/off]` | Log pembuatan channel |
| `g!channeldeletelog [on/off]` | Log penghapusan channel |
| `g!channelupdatelog [on/off]` | Log perubahan channel |
| `g!emojiupdatelog [on/off]` | Log perubahan emoji |
| `g!invitecreatelog [on/off]` | Log pembuatan invite |
| `g!invitedeletelog [on/off]` | Log penghapusan invite |
| `g!memberbanlog [on/off]` | Log ban member |
| `g!memberjoinlog [on/off]` | Log member join |
| `g!memberleavelog [on/off]` | Log member leave |
| `g!memberrolelog [on/off]` | Log perubahan role member |
| `g!membertimeoutlog [on/off]` | Log timeout member |
| `g!memberunbanlog [on/off]` | Log unban member |
| `g!messagedeletelog [on/off]` | Log penghapusan pesan |
| `g!messageeditlog [on/off]` | Log edit pesan |
| `g!modactionlog [on/off]` | Log aksi moderasi |
| `g!nicknamechangelog [on/off]` | Log perubahan nickname |
| `g!rolecreatelog [on/off]` | Log pembuatan role |
| `g!roledeletelog [on/off]` | Log penghapusan role |
| `g!roleupdatelog [on/off]` | Log perubahan role |
| `g!serverupdatelog [on/off]` | Log perubahan server |
| `g!stickerupdatelog [on/off]` | Log perubahan sticker |
| `g!threadcreatelog [on/off]` | Log pembuatan thread |
| `g!threaddeletelog [on/off]` | Log penghapusan thread |
| `g!voicejoinlog [on/off]` | Log join voice channel |
| `g!voiceleavelog [on/off]` | Log leave voice channel |
| `g!voicemovelog [on/off]` | Log pindah voice channel |

### Welcome & Farewell

Sistem sambutan dan perpisahan member.

| Command | Deskripsi |
|---------|-----------|
| `g!welcome setup` | Setup welcome system |
| `g!welcome channel <channel>` | Set channel welcome |
| `g!welcome message <text>` | Set pesan welcome |
| `g!welcome embed [on/off]` | Toggle embed welcome |
| `g!welcome image [on/off]` | Toggle gambar welcome |
| `g!welcome background <url>` | Set background image |
| `g!welcome dm <message>` | Set DM welcome message |
| `g!welcome autorole <role>` | Set auto role untuk member baru |
| `g!welcome ping [on/off]` | Toggle ping member |
| `g!welcome test` | Test welcome message |
| `g!farewell setup` | Setup farewell system |
| `g!farewell channel <channel>` | Set channel farewell |
| `g!farewell message <text>` | Set pesan farewell |
| `g!farewell embed [on/off]` | Toggle embed farewell |
| `g!farewell image [on/off]` | Toggle gambar farewell |
| `g!farewell test` | Test farewell message |
| `g!membercount <channel>` | Set member count channel |
| `g!rejoin [on/off]` | Toggle rejoin detection |

### Ticket System

Sistem tiket untuk support member.

| Command | Deskripsi |
|---------|-----------|
| `g!ticket setup` | Setup ticket system |
| `g!ticket create [category]` | Buat tiket baru |
| `g!ticket close` | Tutup tiket |
| `g!ticket reopen` | Buka kembali tiket |
| `g!ticket delete` | Hapus tiket |
| `g!ticket add <user>` | Tambah user ke tiket |
| `g!ticket remove <user>` | Hapus user dari tiket |
| `g!ticket claim` | Claim tiket (staff) |
| `g!ticket unclaim` | Unclaim tiket |
| `g!ticket transfer <user>` | Transfer tiket ke staff lain |
| `g!ticket rename <name>` | Rename tiket |
| `g!ticket priority <level>` | Set prioritas tiket |
| `g!ticket category <name>` | Set kategori tiket |
| `g!ticket blacklist <user>` | Blacklist user dari tiket |
| `g!ticket transcript` | Generate transcript tiket |
| `g!ticket feedback` | Kirim feedback tiket |
| `g!ticket panel` | Buat panel tiket dengan button |
| `g!ticket snippet add <name> <response>` | Tambah snippet response |
| `g!ticket snippet remove <name>` | Hapus snippet |
| `g!ticket stats` | Statistik tiket server |

### Leveling XP

Sistem leveling dan experience points.

| Command | Deskripsi |
|---------|-----------|
| `g!rank [user]` | Lihat rank member |
| `g!rankcard background <url>` | Set background rank card |
| `g!rankcard color <color>` | Set warna rank card |
| `g!leaderboard` | Lihat leaderboard server |
| `g!globalleaderboard` | Lihat leaderboard global |
| `g!weeklylb` | Leaderboard mingguan |
| `g!monthlylb` | Leaderboard bulanan |
| `g!leveling setup` | Setup leveling system |
| `g!levelup message <text>` | Set pesan level up |
| `g!levelup notify [channel]` | Set notifikasi level up |
| `g!xp add <user> <amount>` | Tambah XP member |
| `g!xp remove <user> <amount>` | Kurangi XP member |
| `g!xp set <user> <amount>` | Set XP member |
| `g!xp reset <user>` | Reset XP member |
| `g!xp resetall` | Reset semua XP server |
| `g!xp blacklist <channel>` | Blacklist channel dari XP |
| `g!xp whitelist <channel>` | Whitelist channel untuk XP |
| `g!xp cooldown <seconds>` | Set cooldown XP |
| `g!xp multiplier <amount>` | Set XP multiplier |
| `g!doublexp [on/off]` | Toggle double XP event |
| `g!streak` | Lihat streak harian |
| `g!prestige` | Prestige untuk bonus |
| `g!levelstats [user]` | Statistik level member |
| `g!rolereward add <level> <role>` | Tambah role reward |
| `g!rolereward remove <level>` | Hapus role reward |
| `g!rolereward list` | Lihat daftar role reward |

### Economy

Sistem ekonomi virtual dengan berbagai fitur.

| Command | Deskripsi |
|---------|-----------|
| `g!balance [user]` | Lihat saldo member |
| `g!daily` | Klaim daily reward |
| `g!weekly` | Klaim weekly reward |
| `g!hourly` | Klaim hourly reward |
| `g!work` | Bekerja untuk uang |
| `g!beg` | Meminta-minta |
| `g!crime` | Lakukan kriminal (risky) |
| `g!rob <user>` | Rampok uang member lain |
| `g!deposit <amount>` | Deposit uang ke bank |
| `g!withdraw <amount>` | Tarik uang dari bank |
| `g!transfer <user> <amount>` | Transfer uang ke member |
| `g!shop` | Lihat toko |
| `g!buy <item>` | Beli item |
| `g!sell <item>` | Jual item |
| `g!shop add <item> <price>` | Tambah item ke toko |
| `g!shop remove <item>` | Hapus item dari toko |
| `g!inventory [user]` | Lihat inventory |
| `g!use <item>` | Gunakan item |
| `g!slots [amount]` | Main slot machine |
| `g!blackjack [amount]` | Main blackjack |
| `g!roulette [amount] <bet>` | Main roulette |
| `g!coinflip [amount]` | Main coinflip |
| `g!lottery buy <number>` | Beli tiket lotre |
| `g!lottery draw` | Draw lotre |
| `g!auction create <item> <price>` | Buat lelang |
| `g!auction bid <id> <amount>` | Bid lelang |
| `g!auction list` | Lihat daftar lelang |
| `g!trade <user>` | Trade dengan member |
| `g!fish` | Mancing ikan |
| `g!hunt` | Berburu |
| `g!mine` | Menambang |
| `g!farm` | Bertani |
| `g!pet shop` | Toko pet |
| `g!pet buy <pet>` | Beli pet |
| `g!pet feed` | Beri makan pet |
| `g!pet info` | Info pet |
| `g!achievement` | Lihat achievement |
| `g!richlb` | Leaderboard terkaya |
| `g!prestige` | Prestige economy |
| `g!economy setup` | Setup economy system |
| `g!economy admin` | Admin economy controls |

### Games

Berbagai game interaktif untuk server.

| Command | Deskripsi |
|---------|-----------|
| `g!tictactoe <user>` | Main Tic Tac Toe |
| `g!connectfour <user>` | Main Connect Four |
| `g!chess <user>` | Main Chess |
| `g!checkers <user>` | Main Checkers |
| `g!duel <user>` | Duel RPG |
| `g!rpg` | RPG Adventure |
| `g!akinator` | Main Akinator |
| `g!trivia` | Main Trivia |
| `g!triviaapi` | Trivia dari API |
| `g!hangman` | Main Hangman |
| `g!wordle` | Main Wordle |
| `g!wordscramble` | Tebak kata acak |
| `g!numberguess` | Tebak angka |
| `g!mathchallenge` | Tantangan matematika |
| `g!speedtype` | Ketik cepat |
| `g!emojiguess` | Tebak emoji |
| `g!flagquiz` | Tebak bendera negara |
| `g!countryquiz` | Tebak negara |
| `g!memorymatch` | Game memory |
| `g!minesweeper` | Main Minesweeper |
| `g!snake` | Game snake |
| `g!2048` | Main 2048 |
| `g!russianroulette` | Russian Roulette |
| `g!coinflip` | Lempar koin |
| `g!diceroll` | Lempar dadu |
| `g!rockpaperscissors <user>` | Suit dengan member |
| `g!truthordare` | Truth or Dare |
| `g!wouldyourather` | Would You Rather |
| `g!uno` | Main UNO |
| `g!mafia` | Main Mafia |
| `g!whosaidit` | Tebak siapa yang bilang |
| `g!counting` | Game counting |
| `g!dare` | Dapatkan dare random |
| `g!truth` | Dapatkan truth random |

### Fun & Entertainment

Perintah hiburan dan fun.

| Command | Deskripsi |
|---------|-----------|
| `g!joke` | Dapatkan joke random |
| `g!dadjoke` | Dad joke |
| `g!pickupline` | Pickup line random |
| `g!roast <user>` | Roast member |
| `g!compliment <user>` | Compliment member |
| `g!8ball <question>` | Tanya magic 8-ball |
| `g!coin` | Lempar koin |
| `g!dice` | Lempar dadu |
| `g!random` | Angka random |
| `g!randomcat` | Gambar kucing random |
| `g!randomdog` | Gambar anjing random |
| `g!randomfox` | Gambar rubah random |
| `g!meme` | Meme random |
| `g!catfact` | Fakta kucing |
| `g!dogfact` | Fakta anjing |
| `g!randomfact` | Fakta random |
| `g!quote` | Quote random |
| `g!fortune` | Fortune cookie |
| `g!horoscope <sign>` | Horoscope harian |
| `g!ship <user1> <user2>` | Kalkulasi kecocokan |
| `g!rate <user>` | Rate member |
| `g!pp <user>` | PP size meter (joke) |
| `g!howgay <user>` | How gay meter (joke) |
| `g!howsus <user>` | How sus meter (joke) |
| `g!iqtest` | IQ test (joke) |
| `g!hug <user>` | Hug member |
| `g!kiss <user>` | Kiss member |
| `g!slap <user>` | Slap member |
| `g!pat <user>` | Pat member |
| `g!cuddle <user>` | Cuddle member |
| `g!poke <user>` | Poke member |
| `g!wink <user>` | Wink at member |
| `g!cry` | Cry reaction |
| `g!dance` | Dance reaction |
| `g!choose <option1> \| <option2>` | Pilih random |
| `g!ascii <text>` | Convert ke ASCII art |
| `g!clap <text>` | Clap text |
| `g!mock <text>` | Mock text |
| `g!owo <text>` | OwOify text |
| `g!vaporwave <text>` | Vaporwave text |
| `g!reverse <text>` | Reverse text |

---

## Event Handlers

Bot ini menggunakan event handlers yang diimplementasikan di `bot.js`:

### Member Events
- `GuildMemberAdd` - Welcome message, auto role, rejoin detection
- `GuildMemberRemove` - Farewell message, member count update
- `GuildMemberUpdate` - Timeout, nickname, avatar, role changes

### Message Events
- `MessageDelete` - Log deleted messages
- `MessageUpdate` - Log edited messages
- `MessageBulkDelete` - Log bulk deletions

### Moderation Events
- `GuildBanAdd` - Log bans
- `GuildBanRemove` - Log unbans

### Channel Events
- `ChannelCreate` - Log channel creation
- `ChannelDelete` - Log channel deletion
- `ChannelUpdate` - Log channel changes

### Role Events
- `GuildRoleCreate` - Log role creation
- `GuildRoleDelete` - Log role deletion
- `GuildRoleUpdate` - Log role changes

### Voice Events
- `VoiceStateUpdate` - Track voice activity for XP

### Server Events
- `GuildUpdate` - Log server changes
- `GuildEmojiCreate/Delete` - Log emoji changes
- `GuildStickerCreate/Delete` - Log sticker changes
- `ThreadCreate/Delete` - Log thread changes
- `InviteCreate/Delete` - Log invite changes
- `GuildMemberBoost` - Log boosts

### Interaction Events
- Button interactions untuk tickets, games, dll
- Select menu interactions untuk snippets

---

## Sistem Global

Bot menggunakan sistem penyimpanan global dengan Map:

```javascript
// Struktur data global
global.logChannels = new Map();       // Channel log per server
global.logConfig = new Map();         // Konfigurasi logging
global.welcomeConfig = new Map();     // Konfigurasi welcome
global.farewellConfig = new Map();    // Konfigurasi farewell
global.memberCountConfig = new Map(); // Member count channel
global.rejoinConfig = new Map();      // Rejoin detection
global.memberHistory = new Map();     // History member join/leave
global.ticketConfig = new Map();      // Konfigurasi ticket
global.tickets = new Map();           // Data tiket aktif
global.ticketCount = new Map();       // Counter tiket
global.ticketBlacklist = new Map();   // Blacklist ticket
global.ticketFeedback = new Map();    // Feedback tiket
global.ticketSnippets = new Map();    // Snippet response
global.levelingConfig = new Map();    // Konfigurasi leveling
global.userXP = new Map();            // XP per user
global.xpCooldown = new Map();        // Cooldown XP
global.voiceXPTracking = new Map();   // Voice XP tracking
global.weeklyXP = new Map();          // XP mingguan
global.monthlyXP = new Map();         // XP bulanan
global.rankCardConfig = new Map();    // Konfigurasi rank card
global.economyConfig = new Map();     // Konfigurasi economy
global.economyData = new Map();       // Data economy user
global.auctions = new Map();          // Lelang aktif
global.lottery = new Map();           // Data lotre
global.trades = new Map();            // Trade aktif
```

---

## Intents

Bot menggunakan intents berikut:

```javascript
GatewayIntentBits.Guilds              // Akses guild info
GatewayIntentBits.GuildMessages       // Baca pesan
GatewayIntentBits.MessageContent      // Baca konten pesan
GatewayIntentBits.GuildMembers        // Akses member events
GatewayIntentBits.GuildVoiceStates    // Voice channel tracking
GatewayIntentBits.GuildBans           // Ban/unban events
GatewayIntentBits.GuildInvites        // Invite tracking
GatewayIntentBits.GuildEmojisAndStickers  // Emoji/sticker events
GatewayIntentBits.GuildMessageReactions   // Reaction events
```

---

## Dependencies

| Package | Version | Fungsi |
|---------|---------|--------|
| discord.js | ^14.25.1 | Discord API wrapper |
| dotenv | ^17.3.1 | Environment variables |
| ms | ^2.1.3 | Parse duration string |

---

## Kontribusi

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## Lisensi

Proyek ini menggunakan lisensi **ISC**.

---

## Author

**Ulpy1311**

Repository: [https://github.com/Ulpy1311/D99](https://github.com/Ulpy1311/D99)

---

<p align="center">
  Made with ❤️ using Discord.js v14
</p>

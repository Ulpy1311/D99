const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const wordleGames = new Map();

const words = [
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
    'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
    'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARMOR', 'ARMY', 'ARRAY', 'ARROW', 'ASSET', 'AVOID',
    'AWARD', 'AWARE', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN', 'BEGUN', 'BEING', 'BELOW', 'BENCH',
    'BILLY', 'BIRTH', 'BLACK', 'BLADE', 'BLAME', 'BLANK', 'BLAST', 'BLEND', 'BLESS', 'BLIND',
    'BLOCK', 'BLOOD', 'BLOOM', 'BLOWN', 'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND',
    'BRAVE', 'BREAD', 'BREAK', 'BREED', 'BRICK', 'BRIDE', 'BRIEF', 'BRING', 'BROAD', 'BROKE',
    'BROWN', 'BUILD', 'BUILT', 'BUNCH', 'BURST', 'BUYER', 'CABLE', 'CALIF', 'CARRY', 'CATCH',
    'CAUSE', 'CHAIN', 'CHAIR', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD'
];

module.exports = {
    name: 'wordle',
    description: 'Wordle game - tebak kata 5 huruf',
    async execute(message, args, client) {
        const key = `${message.guild.id}-${message.author.id}`;
        
        if (wordleGames.has(key)) {
            return message.reply('❌ Kamu sudah punya game berlangsung. Selesaikan dulu!');
        }

        const word = words[Math.floor(Math.random() * words.length)];
        
        const gameState = {
            word: word,
            guesses: [],
            maxGuesses: 6,
            startedAt: Date.now(),
            playerId: message.author.id
        };

        wordleGames.set(key, gameState);

        const embed = new EmbedBuilder()
            .setTitle('🟩 Wordle')
            .setDescription('Tebak kata 5 huruf dalam 6 percobaan!\n\n⬛ = Huruf tidak ada\n🟨 = Huruf ada tapi posisi salah\n🟩 = Huruf benar di posisi benar')
            .addFields(
                { name: '📊 Status', value: `0/${gameState.maxGuesses} percobaan` },
                { name: '📝 Cara Bermain', value: 'Ketik `g!wordleguess KATA` untuk menebak' }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.wordleGames = wordleGames;
module.exports.words = words;

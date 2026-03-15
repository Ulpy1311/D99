const { EmbedBuilder } = require('discord.js');

const scrambleGames = new Map();

const words = [
    'JAVASCRIPT', 'PROGRAMMING', 'COMPUTER', 'ALGORITHM', 'DEVELOPER',
    'KEYBOARD', 'MONITOR', 'SOFTWARE', 'HARDWARE', 'DATABASE',
    'FUNCTION', 'VARIABLE', 'CONSTANT', 'INTERFACE', 'FRAMEWORK',
    'LIBRARY', 'COMPONENT', 'TERMINAL', 'COMPILER', 'DEBUGGER'
];

module.exports = {
    name: 'wordscramble',
    description: 'Tebak kata yang diacak',
    async execute(message, args, client) {
        const key = `${message.guild.id}-${message.author.id}`;
        
        if (scrambleGames.has(key)) {
            return message.reply('❌ Kamu sudah punya game berlangsung.');
        }

        const word = words[Math.floor(Math.random() * words.length)];
        const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');

        const gameState = {
            word,
            scrambled,
            attempts: 0,
            maxAttempts: 5,
            startedAt: Date.now(),
            playerId: message.author.id
        };

        scrambleGames.set(key, gameState);

        const embed = new EmbedBuilder()
            .setTitle('🔀 Word Scramble')
            .setDescription(`Acak kata: **${scrambled}**\n\nTebak kata aslinya!`)
            .addFields(
                { name: '📊 Percobaan', value: `0/${gameState.maxAttempts}` },
                { name: '📝 Cara Bermain', value: 'Ketik `g!unscramble <kata>` untuk menjawab!' }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.scrambleGames = scrambleGames;
module.exports.words = words;

const { EmbedBuilder } = require('discord.js');

const numberGames = new Map();

module.exports = {
    name: 'numberguess',
    description: 'Tebak angka 1-100',
    async execute(message, args, client) {
        const key = `${message.guild.id}-${message.author.id}`;
        
        if (numberGames.has(key)) {
            return message.reply('❌ Kamu sudah punya game berlangsung. Ketik angka untuk menebak!');
        }

        const number = Math.floor(Math.random() * 100) + 1;
        
        const gameState = {
            number,
            attempts: 0,
            maxAttempts: 10,
            startedAt: Date.now(),
            playerId: message.author.id,
            rangeMin: 1,
            rangeMax: 100
        };

        numberGames.set(key, gameState);

        const embed = new EmbedBuilder()
            .setTitle('🔢 Number Guessing')
            .setDescription(`Aku sedang memikirkan angka antara 1-100!\nKamu punya ${gameState.maxAttempts} percobaan.`)
            .addFields(
                { name: '📊 Status', value: `Percobaan: 0/${gameState.maxAttempts}` },
                { name: '📝 Cara Bermain', value: 'Ketik `g!guess <angka>` untuk menebak!' }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.numberGames = numberGames;

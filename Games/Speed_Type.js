const { EmbedBuilder } = require('discord.js');

const typingGames = new Map();

const texts = [
    'The quick brown fox jumps over the lazy dog.',
    'Pack my box with five dozen liquor jugs.',
    'How vexingly quick daft zebras jump!',
    'The five boxing wizards jump quickly.',
    'Sphinx of black quartz, judge my vow.',
    'Two driven jocks help fax my big quiz.',
    'Public junk dwarves hug my quartz fox.',
    'Quick zephyrs blow, vexing daft Jim.',
    'Waltz, nymph, for quick jigs vex Bud.',
    'Glib jocks quiz nymph to vex dwarf.'
];

module.exports = {
    name: 'speedtype',
    description: 'Lomba ketik cepat',
    async execute(message, args, client) {
        const key = `${message.guild.id}-${message.channel.id}`;
        
        if (typingGames.has(key)) {
            return message.reply('❌ Ada speed type berlangsung di channel ini.');
        }

        const text = texts[Math.floor(Math.random() * texts.length)];

        const gameState = {
            text,
            startedAt: Date.now(),
            participants: new Map()
        };

        typingGames.set(key, gameState);

        const embed = new EmbedBuilder()
            .setTitle('⌨️ Speed Typing Challenge')
            .setDescription(`Ketik teks berikut secepat mungkin:\n\n**"${text}"**\n\n⏱️ Waktu dimulai sekarang!`)
            .addFields({ name: '📝 Cara Ikut', value: 'Ketik ulang teks di atas dengan benar!' })
            .setColor(0x5865F2)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.typingGames = typingGames;
module.exports.texts = texts;

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rankcardcolor',
    description: 'Set custom color untuk rank card',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        const config = global.levelingConfig?.get(message.guild.id);
        if (!config) {
            return message.reply('❌ Leveling system belum di-setup.');
        }

        if (!global.rankCardConfig) global.rankCardConfig = new Map();
        const cardConfig = global.rankCardConfig.get(message.guild.id) || {};

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setTitle('🎨 Rank Card Color')
                .setDescription('Warna custom untuk rank card.')
                .addFields(
                    { name: 'Current Color', value: cardConfig.color || 'Default (Blue)' },
                    { name: 'Usage', value: 
                        '• `g!rankcardcolor #FF5733` - Set warna hex\n' +
                        '• `g!rankcardcolor red/blue/green/etc` - Set warna nama\n' +
                        '• `g!rankcardcolor reset` - Reset ke default'
                    }
                )
                .setColor(cardConfig.color?.replace('#', '0x') || 0x5865F2)
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        const colorInput = args[0].toLowerCase();

        if (colorInput === 'reset') {
            delete cardConfig.color;
            global.rankCardConfig.set(message.guild.id, cardConfig);

            return message.reply('✅ Warna rank card direset ke default.');
        }

        const namedColors = {
            red: '#FF0000', green: '#00FF00', blue: '#0000FF',
            yellow: '#FFFF00', purple: '#9B59B6', orange: '#FFA500',
            pink: '#FF69B4', cyan: '#00FFFF', white: '#FFFFFF',
            black: '#000000', gold: '#FFD700', silver: '#C0C0C0'
        };

        let color = namedColors[colorInput] || args[0];
        
        if (color.startsWith('#') && /^#[0-9A-Fa-f]{6}$/.test(color)) {
            cardConfig.color = color;
        } else if (namedColors[colorInput]) {
            cardConfig.color = namedColors[colorInput];
        } else {
            return message.reply('❌ Warna tidak valid. Gunakan format hex (#FF5733) atau nama warna.');
        }

        global.rankCardConfig.set(message.guild.id, cardConfig);

        const embed = new EmbedBuilder()
            .setTitle('✅ Color Updated')
            .setDescription(`Warna rank card diatur ke ${cardConfig.color}`)
            .setColor(parseInt(cardConfig.color.replace('#', '0x')))
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

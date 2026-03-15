const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'trade',
    description: 'Trade item dengan user lain',
    async execute(message, args, client) {
        const config = global.economyConfig?.get(message.guild.id);
        if (!config?.enabled) {
            return message.reply('❌ Economy system belum diaktifkan.');
        }

        const target = message.mentions.users.first();
        if (!target || target.bot || target.id === message.author.id) {
            return message.reply('❌ Mention user yang valid untuk trade.');
        }

        if (!global.economyData) global.economyData = new Map();
        const key = `${message.guild.id}-${message.author.id}`;
        const targetKey = `${message.guild.id}-${target.id}`;

        const userData = global.economyData.get(key) || { wallet: 0, bank: 0, inventory: [] };
        const targetData = global.economyData.get(targetKey) || { wallet: 0, bank: 0, inventory: [] };

        if (!userData.inventory || userData.inventory.length === 0) {
            return message.reply('🎒 Inventory kamu kosong.');
        }

        if (!targetData.inventory || targetData.inventory.length === 0) {
            return message.reply(`🎒 ${target.username} tidak punya item untuk di-trade.`);
        }

        const embed = new EmbedBuilder()
            .setTitle('🤝 Trade Request')
            .setDescription(`${message.author} ingin trade dengan ${target}\n\n${target}, apakah kamu setuju?`)
            .addFields(
                { name: `🎒 ${message.author.username}`, value: `${userData.inventory.length} items`, inline: true },
                { name: `🎒 ${target.username}`, value: `${targetData.inventory.length} items`, inline: true }
            )
            .setColor(0x9B59B6)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('trade_accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('trade_decline')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
            );

        const msg = await message.reply({ embeds: [embed], components: [row] });

        const filter = i => i.user.id === target.id;
        try {
            const interaction = await msg.awaitInteractions({ filter, time: 60000, max: 1 });

            if (interaction.customId === 'trade_accept') {
                const tradeEmbed = new EmbedBuilder()
                    .setTitle('✅ Trade Started')
                    .setDescription(`Trade dimulai! Gunakan:\n• \`g!tradeadd <item_number> <target>\` untuk menambah item\n• \`g!tradecancel\` untuk membatalkan`)
                    .setColor(0x00FF00);

                if (!global.trades) global.trades = new Map();
                global.trades.set(`${message.guild.id}-${message.author.id}-${target.id}`, {
                    user1: message.author.id,
                    user2: target.id,
                    user1Items: [],
                    user2Items: [],
                    status: 'pending'
                });

                await interaction.update({ embeds: [tradeEmbed], components: [] });
            } else {
                await interaction.update({ content: '❌ Trade ditolak.', embeds: [], components: [] });
            }
        } catch (err) {
            msg.edit({ content: '⏰ Trade timeout.', embeds: [], components: [] });
        }
    }
};

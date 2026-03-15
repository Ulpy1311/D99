const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ticketpriority',
    description: 'Set prioritas ticket (Low/Medium/High/Urgent)',
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Kamu memerlukan permission Administrator untuk menggunakan perintah ini.');
        }

        if (!global.tickets) global.tickets = new Map();
        
        const ticket = global.tickets.get(message.channel.id);
        if (!ticket) {
            return message.reply('❌ Channel ini bukan ticket channel.');
        }

        const priority = args[0]?.toLowerCase();
        if (!priority) {
            return message.reply('❌ Silakan pilih prioritas: `low`, `medium`, `high`, atau `urgent`.');
        }

        const priorityMap = {
            'low': { name: 'Low', color: 0x00FF00, emoji: '🟢' },
            'medium': { name: 'Medium', color: 0xFFA500, emoji: '🟡' },
            'high': { name: 'High', color: 0xFF6600, emoji: '🟠' },
            'urgent': { name: 'Urgent', color: 0xFF0000, emoji: '🔴' }
        };

        const selectedPriority = priorityMap[priority];
        if (!selectedPriority) {
            return message.reply('❌ Prioritas tidak valid. Gunakan: `low`, `medium`, `high`, atau `urgent`.');
        }

        const oldPriority = ticket.priority || 'normal';
        ticket.priority = priority;
        global.tickets.set(message.channel.id, ticket);

        const priorityEmbed = new EmbedBuilder()
            .setTitle(`${selectedPriority.emoji} Priority Updated`)
            .setDescription(`Prioritas ticket telah diubah.`)
            .addFields(
                { name: 'Prioritas Lama', value: oldPriority.charAt(0).toUpperCase() + oldPriority.slice(1), inline: true },
                { name: 'Prioritas Baru', value: selectedPriority.name, inline: true },
                { name: 'Updated by', value: message.author.tag, inline: true }
            )
            .setColor(selectedPriority.color)
            .setTimestamp();

        await message.channel.send({ embeds: [priorityEmbed] });

        message.reply(`✅ Prioritas ticket diubah ke **${selectedPriority.name}**.`);
    }
};

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const rouletteGames = new Map();

async function getAIComment(prompt) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'nvidia/nemotron-3-super-120b-a12b:free',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 100
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '🔫 Russian Roulette!';
    } catch (err) {
        return '🔫 Russian Roulette!';
    }
}

module.exports = {
    name: 'russianroulette',
    description: 'Play Russian Roulette (game version, no real harm)',
    async execute(message, args, client) {
        const players = [message.author.id];
        const maxRounds = Math.min(Math.max(parseInt(args[0]) || 6, 2), 10);

        if (rouletteGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a Russian Roulette game running in this channel.');
        }

        const aiComment = await getAIComment(`Give a short suspenseful comment (1 sentence) for starting a Russian Roulette game. Be dramatic but safe.`);

        const gameState = {
            players: [{ id: message.author.id, name: message.author.username }],
            chamber: Math.floor(Math.random() * maxRounds) + 1,
            currentRound: 0,
            maxRounds: maxRounds,
            currentPlayer: 0,
            status: 'waiting',
            startedAt: Date.now()
        };

        rouletteGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const embed = new EmbedBuilder()
            .setTitle('🔫 Russian Roulette')
            .setDescription(`${aiComment}\n\n**Chamber Size:** ${maxRounds} rounds\n**Current Players:** 1\n\nClick the button to join or start!`)
            .setColor(0x2C2C2C)
            .addFields(
                { name: '💀 Players', value: `<@${message.author.id}>` }
            )
            .setFooter({ text: 'Click Join to participate, Start when ready!' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rr_join')
                    .setLabel('Join')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✋'),
                new ButtonBuilder()
                    .setCustomId('rr_start')
                    .setLabel('Start Game')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔫')
            );

        const msg = await message.reply({ embeds: [embed], components: [row] });
        gameState.messageId = msg.id;

        setTimeout(() => {
            if (gameState.status === 'waiting') {
                rouletteGames.delete(`${message.guild.id}-${message.channel.id}`);
                msg.edit({ content: '⏰ Game expired.', embeds: [], components: [] }).catch(() => {});
            }
        }, 120000);
    }
};

async function pullTrigger(message, gameState) {
    gameState.currentRound++;
    const player = gameState.players[gameState.currentPlayer];

    const aiComment = await getAIComment(`Give a short intense comment (1 sentence, max 15 words) for Russian Roulette round ${gameState.currentRound}/${gameState.maxRounds}. Player ${player.name} is pulling the trigger.`);

    const pullEmbed = new EmbedBuilder()
        .setTitle('🔫 Click...')
        .setDescription(`${aiComment}\n\n**Round:** ${gameState.currentRound}/${gameState.maxRounds}\n**Player:** <@${player.id}>\n\nPulling the trigger...`)
        .setColor(0x2C2C2C)
        .setTimestamp();

    await message.channel.send({ embeds: [pullEmbed] });

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (gameState.currentRound === gameState.chamber) {
        const eliminatedEmbed = new EmbedBuilder()
            .setTitle('💥 BANG!')
            .setDescription(`💀 <@${player.id}> has been eliminated!\n\n**Game Over!**`)
            .setColor(0xFF0000)
            .addFields(
                { name: '🏆 Survivors', value: gameState.players.filter(p => p.id !== player.id).map(p => `<@${p.id}>`).join('\n') || 'None' }
            )
            .setTimestamp();

        rouletteGames.delete(`${message.guild.id}-${message.channel.id}`);
        await message.channel.send({ embeds: [eliminatedEmbed] });
        return;
    }

    const safeEmbed = new EmbedBuilder()
        .setTitle('🔔 Click... Safe!')
        .setDescription(`<@${player.id}> survived this round!\n\n**Next Player:** <@${gameState.players[(gameState.currentPlayer + 1) % gameState.players.length].id}>`)
        .setColor(0x00FF00)
        .setTimestamp();

    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('rr_pull')
                .setLabel('Pull Trigger')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔫')
        );

    await message.channel.send({ embeds: [safeEmbed], components: [row] });
}

module.exports.rouletteGames = rouletteGames;
module.exports.getAIComment = getAIComment;
module.exports.pullTrigger = pullTrigger;

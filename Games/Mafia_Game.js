const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const mafiaGames = new Map();

const ROLES = {
    mafia: { name: 'Mafia', emoji: '🔪', team: 'mafia', description: 'Kill villagers at night' },
    doctor: { name: 'Doctor', emoji: '💉', team: 'village', description: 'Protect one player each night' },
    detective: { name: 'Detective', emoji: '🔍', team: 'village', description: 'Investigate one player each night' },
    villager: { name: 'Villager', emoji: '👨‍🌾', team: 'village', description: 'Vote to eliminate mafia' }
};

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
                max_tokens: 150
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'The game begins...';
    } catch (err) {
        return 'The game begins...';
    }
}

module.exports = {
    name: 'mafia',
    description: 'Play Mafia - the social deduction game',
    async execute(message, args, client) {
        if (mafiaGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a Mafia game running in this channel.');
        }

        const minPlayers = 5;

        const gameState = {
            players: [],
            phase: 'waiting',
            day: 0,
            votes: new Map(),
            mafiaTarget: null,
            doctorTarget: null,
            detectiveResults: [],
            startedAt: Date.now()
        };

        mafiaGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const aiIntro = await getAIComment(`Give a short mysterious intro (1-2 sentences) for starting a Mafia game. Be dramatic and secretive.`);

        const introEmbed = new EmbedBuilder()
            .setTitle('🔪 Mafia Game')
            .setDescription(`${aiIntro}\n\n**Minimum Players:** ${minPlayers}\n\nClick Join to participate!\n\n**Roles:**\n🔪 Mafia - Kill at night\n💉 Doctor - Protect players\n🔍 Detective - Investigate\n👨‍🌾 Villager - Find mafia`)
            .setColor(0x2C2C2C)
            .setFooter({ text: 'Waiting for players...' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('mafia_join')
                    .setLabel('Join Game')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✋'),
                new ButtonBuilder()
                    .setCustomId('mafia_start')
                    .setLabel('Start Game')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('▶️')
            );

        const msg = await message.reply({ embeds: [introEmbed], components: [row] });
        gameState.messageId = msg.id;

        setTimeout(() => {
            if (gameState.phase === 'waiting') {
                mafiaGames.delete(`${message.guild.id}-${message.channel.id}`);
                msg.edit({ content: '⏰ Mafia game expired.', embeds: [], components: [] }).catch(() => {});
            }
        }, 180000);
    }
};

function assignRoles(players) {
    const roles = [];
    const mafiaCount = Math.max(1, Math.floor(players.length / 4));

    for (let i = 0; i < mafiaCount; i++) {
        roles.push('mafia');
    }
    roles.push('doctor');
    roles.push('detective');
    while (roles.length < players.length) {
        roles.push('villager');
    }

    for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    players.forEach((player, index) => {
        player.role = roles[index];
        player.alive = true;
        player.protected = false;
    });

    return players;
}

async function sendNightPhase(message, gameState) {
    gameState.phase = 'night';
    gameState.day++;
    gameState.mafiaTarget = null;
    gameState.doctorTarget = null;
    gameState.detectiveResults = [];

    const aiNight = await getAIComment(`Give a short atmospheric description (1 sentence) of night falling in a Mafia game. Be mysterious and tense.`);

    const nightEmbed = new EmbedBuilder()
        .setTitle(`🌙 Night ${gameState.day}`)
        .setDescription(`${aiNight}\n\nThe village sleeps...\n\nMafia, Doctor, and Detective - check your DMs!`)
        .setColor(0x1a1a2e);

    await message.channel.send({ embeds: [nightEmbed] });

    const alivePlayers = gameState.players.filter(p => p.alive);

    for (const player of alivePlayers) {
        const role = ROLES[player.role];
        if (role.team === 'village' && player.role !== 'doctor' && player.role !== 'detective') continue;

        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle(`🌙 Night ${gameState.day} - Your Action`)
                .setDescription(`You are the **${role.emoji} ${role.name}**\n\n**${role.description}**\n\nChoose your target:`)
                .setColor(0x1a1a2e);

            const options = alivePlayers
                .filter(p => p.id !== player.id)
                .map(p => new ButtonBuilder()
                    .setCustomId(`mafia_action_${p.id}`)
                    .setLabel(p.name.substring(0, 20))
                    .setStyle(ButtonStyle.Primary));

            const row = new ActionRowBuilder().addComponents(options.slice(0, 5));
            const user = await message.client.users.fetch(player.id);
            await user.send({ embeds: [dmEmbed], components: [row] });
        } catch (err) {}
    }
}

async function processNightActions(message, gameState) {
    const alivePlayers = gameState.players.filter(p => p.alive);

    if (gameState.mafiaTarget) {
        const target = gameState.players.find(p => p.id === gameState.mafiaTarget);
        if (target && target.alive) {
            if (gameState.doctorTarget === gameState.mafiaTarget) {
                target.protected = true;
            }
            if (!target.protected) {
                target.alive = false;
            }
        }
    }

    await sendDayPhase(message, gameState);
}

async function sendDayPhase(message, gameState) {
    gameState.phase = 'day';
    gameState.votes.clear();

    const aiDay = await getAIComment(`Give a short description (1 sentence) of dawn in a Mafia game. Be hopeful but tense.`);

    const alivePlayers = gameState.players.filter(p => p.alive);
    const deadPlayers = gameState.players.filter(p => !p.alive);

    const dayEmbed = new EmbedBuilder()
        .setTitle(`☀️ Day ${gameState.day}`)
        .setDescription(`${aiDay}\n\n**Alive:** ${alivePlayers.length}\n**Dead:** ${deadPlayers.length}\n\nDiscuss and vote to eliminate!`)
        .setColor(0xFFD700);

    if (deadPlayers.length > 0) {
        dayEmbed.addFields({ name: '💀 Eliminated', value: deadPlayers.map(p => `<@${p.id}> (${ROLES[p.role].name})`).join('\n') });
    }

    const checkResult = checkWinCondition(gameState);
    if (checkResult) {
        return endGame(message, gameState, checkResult);
    }

    await message.channel.send({ embeds: [dayEmbed] });
}

function checkWinCondition(gameState) {
    const alivePlayers = gameState.players.filter(p => p.alive);
    const mafiaAlive = alivePlayers.filter(p => p.role === 'mafia').length;
    const villageAlive = alivePlayers.filter(p => p.role !== 'mafia').length;

    if (mafiaAlive === 0) return 'village';
    if (mafiaAlive >= villageAlive) return 'mafia';
    return null;
}

function endGame(message, gameState, winner) {
    mafiaGames.delete(`${message.guild.id}-${message.channel.id}`);

    const winnerEmbed = new EmbedBuilder()
        .setTitle(winner === 'mafia' ? '🔪 Mafia Wins!' : '👨‍🌾 Village Wins!')
        .setDescription(winner === 'mafia' ? 'The mafia has taken over the village!' : 'The village has eliminated all mafia!')
        .setColor(winner === 'mafia' ? 0xFF0000 : 0x00FF00)
        .addFields({
            name: '📋 All Roles',
            value: gameState.players.map(p => `<@${p.id}>: ${ROLES[p.role].emoji} ${ROLES[p.role].name}`).join('\n')
        });

    message.channel.send({ embeds: [winnerEmbed] });
}

module.exports.mafiaGames = mafiaGames;
module.exports.ROLES = ROLES;
module.exports.getAIComment = getAIComment;
module.exports.assignRoles = assignRoles;
module.exports.sendNightPhase = sendNightPhase;
module.exports.processNightActions = processNightActions;
module.exports.sendDayPhase = sendDayPhase;
module.exports.checkWinCondition = checkWinCondition;
module.exports.endGame = endGame;

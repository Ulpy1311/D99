const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const duelGames = new Map();

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
        return data.choices?.[0]?.message?.content || '⚔️ Duel!';
    } catch (err) {
        return '⚔️ Duel!';
    }
}

const ATTACKS = {
    slash: { name: 'Slash', damage: [10, 20], emoji: '⚔️', accuracy: 90 },
    heavy: { name: 'Heavy Attack', damage: [20, 40], emoji: '💥', accuracy: 60 },
    quick: { name: 'Quick Attack', damage: [5, 15], emoji: '⚡', accuracy: 100 },
    heal: { name: 'Heal', damage: [-20, -10], emoji: '💚', accuracy: 100 },
    block: { name: 'Block', damage: [0, 0], emoji: '🛡️', accuracy: 100, block: true }
};

module.exports = {
    name: 'duel',
    description: 'Challenge someone to a duel!',
    async execute(message, args, client) {
        const opponent = message.mentions.users.first();

        if (!opponent || opponent.bot || opponent.id === message.author.id) {
            return message.reply('❌ Mention a valid user to duel with.');
        }

        if (duelGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a duel running in this channel.');
        }

        const aiComment = await getAIComment(`Give a short dramatic comment (1 sentence) for a duel challenge between ${message.author.username} and ${opponent.username}. Be epic!`);

        const gameState = {
            players: [
                { id: message.author.id, hp: 100, maxHp: 100, name: message.author.username, blocked: false },
                { id: opponent.id, hp: 100, maxHp: 100, name: opponent.username, blocked: false }
            ],
            currentTurn: 0,
            started: false,
            round: 0,
            timeout: null,
            startedAt: Date.now()
        };

        duelGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const challengeEmbed = new EmbedBuilder()
            .setTitle('⚔️ Duel Challenge!')
            .setDescription(`${aiComment}\n\n**${message.author}** has challenged **${opponent}** to a duel!\n\nDo you accept?`)
            .setColor(0xE74C3C)
            .addFields(
                { name: '⚔️ Challenger', value: message.author.username, inline: true },
                { name: '🎯 Opponent', value: opponent.username, inline: true }
            )
            .setFooter({ text: 'Waiting for opponent to accept...' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('duel_accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('⚔️'),
                new ButtonBuilder()
                    .setCustomId('duel_decline')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🚫')
            );

        const msg = await message.reply({ embeds: [challengeEmbed], components: [row] });

        gameState.challengeMessageId = msg.id;

        gameState.timeout = setTimeout(() => {
            if (!gameState.started) {
                duelGames.delete(`${message.guild.id}-${message.channel.id}`);
                msg.edit({ content: '⏰ Duel challenge expired.', embeds: [], components: [] }).catch(() => {});
            }
        }, 60000);
    }
};

async function startDuel(message, gameState) {
    gameState.started = true;
    gameState.round = 1;
    if (gameState.timeout) clearTimeout(gameState.timeout);

    const aiComment = await getAIComment(`Give a short dramatic comment (1 sentence) for the start of a duel between ${gameState.players[0].name} and ${gameState.players[1].name}. Be intense!`);

    const startEmbed = new EmbedBuilder()
        .setTitle('⚔️ DUEL BEGINS!')
        .setDescription(`${aiComment}\n\n**Round 1**`)
        .setColor(0xE74C3C)
        .addFields(
            { name: `👤 ${gameState.players[0].name}`, value: `❤️ HP: ${gameState.players[0].hp}/${gameState.players[0].maxHp}`, inline: true },
            { name: `👤 ${gameState.players[1].name}`, value: `❤️ HP: ${gameState.players[1].hp}/${gameState.players[1].maxHp}`, inline: true }
        )
        .setFooter({ text: `${gameState.players[gameState.currentTurn].name}'s turn` });

    const row = new ActionRowBuilder();
    Object.entries(ATTACKS).forEach(([key, attack]) => {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`duel_${key}`)
                .setLabel(`${attack.emoji} ${attack.name}`)
                .setStyle(ButtonStyle.Primary)
        );
    });

    await message.channel.send({ embeds: [startEmbed], components: [row] });
}

function executeAttack(gameState, attackKey) {
    const attacker = gameState.players[gameState.currentTurn];
    const defender = gameState.players[1 - gameState.currentTurn];
    const attack = ATTACKS[attackKey];

    defender.blocked = false;

    const roll = Math.random() * 100;
    if (roll > attack.accuracy) {
        return { hit: false, damage: 0, message: `${attacker.name} used ${attack.emoji} ${attack.name}... but missed!` };
    }

    if (attack.block) {
        attacker.blocked = true;
        return { hit: true, damage: 0, message: `${attacker.name} raises their shield! 🛡️` };
    }

    const damage = Math.floor(Math.random() * (attack.damage[1] - attack.damage[0] + 1)) + attack.damage[0];

    if (attackKey === 'heal') {
        attacker.hp = Math.min(attacker.maxHp, attacker.hp - damage);
        return { hit: true, damage: -damage, message: `${attacker.name} heals for ${-damage} HP! 💚` };
    }

    if (defender.blocked) {
        const reducedDamage = Math.floor(damage * 0.5);
        defender.hp -= reducedDamage;
        return { hit: true, damage: reducedDamage, message: `${attacker.name} attacks but ${defender.name} blocks! (${reducedDamage} damage)` };
    }

    defender.hp -= damage;
    return { hit: true, damage: damage, message: `${attacker.name} uses ${attack.emoji} ${attack.name} on ${defender.name}! (${damage} damage)` };
}

function checkWinner(gameState) {
    if (gameState.players[0].hp <= 0) return gameState.players[1];
    if (gameState.players[1].hp <= 0) return gameState.players[0];
    return null;
}

function nextTurn(gameState) {
    gameState.currentTurn = 1 - gameState.currentTurn;
    if (gameState.currentTurn === 0) gameState.round++;
}

module.exports.duelGames = duelGames;
module.exports.ATTACKS = ATTACKS;
module.exports.getAIComment = getAIComment;
module.exports.startDuel = startDuel;
module.exports.executeAttack = executeAttack;
module.exports.checkWinner = checkWinner;
module.exports.nextTurn = nextTurn;

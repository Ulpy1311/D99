const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const unoGames = new Map();

const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_EMOJIS = { red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡' };
const COLOR_HEX = { red: 0xFF0000, blue: 0x0000FF, green: 0x00FF00, yellow: 0xFFFF00 };

const SPECIAL_CARDS = ['skip', 'reverse', 'draw2'];
const WILD_CARDS = ['wild', 'wild4'];

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
        return data.choices?.[0]?.message?.content || '🃏 UNO!';
    } catch (err) {
        return '🃏 UNO!';
    }
}

function createDeck() {
    const deck = [];
    for (const color of COLORS) {
        deck.push({ color, value: '0', type: 'number' });
        for (let i = 1; i <= 9; i++) {
            deck.push({ color, value: String(i), type: 'number' });
            deck.push({ color, value: String(i), type: 'number' });
        }
        for (const special of SPECIAL_CARDS) {
            deck.push({ color, value: special, type: 'action' });
            deck.push({ color, value: special, type: 'action' });
        }
    }
    for (let i = 0; i < 4; i++) {
        deck.push({ color: null, value: 'wild', type: 'wild' });
        deck.push({ color: null, value: 'wild4', type: 'wild' });
    }
    return shuffleDeck(deck);
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getCardDisplay(card) {
    if (card.type === 'wild') {
        return card.value === 'wild' ? '🌈 Wild' : '🌈 +4';
    }
    const colorEmoji = COLOR_EMOJIS[card.color];
    if (card.type === 'action') {
        const actionNames = { skip: '⏭️ Skip', reverse: '🔄 Reverse', draw2: '+2 Draw' };
        return `${colorEmoji} ${actionNames[card.value]}`;
    }
    return `${colorEmoji} ${card.value}`;
}

function canPlayCard(card, topCard, currentColor) {
    if (card.type === 'wild') return true;
    if (card.color === currentColor) return true;
    if (card.value === topCard.value) return true;
    return false;
}

module.exports = {
    name: 'uno',
    description: 'Play UNO card game',
    async execute(message, args, client) {
        const maxPlayers = Math.min(Math.max(parseInt(args[0]) || 4, 2), 8);

        if (unoGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already an UNO game running in this channel.');
        }

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting an UNO card game. Be energetic.`);

        const gameState = {
            players: [],
            deck: [],
            discard: [],
            currentPlayer: 0,
            direction: 1,
            currentColor: null,
            started: false,
            startedAt: Date.now()
        };

        unoGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const startEmbed = new EmbedBuilder()
            .setTitle('🃏 UNO Game')
            .setDescription(`${aiComment}\n\n**Players needed:** ${maxPlayers}\n\nClick Join to participate!`)
            .setColor(0x5865F2)
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`uno_join_${maxPlayers}`)
                    .setLabel('Join Game')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✋'),
                new ButtonBuilder()
                    .setCustomId('uno_start')
                    .setLabel('Start Game')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('▶️')
            );

        const msg = await message.reply({ embeds: [startEmbed], components: [row] });

        gameState.messageId = msg.id;
        gameState.maxPlayers = maxPlayers;
    }
};

async function startGame(message, gameState) {
    gameState.deck = createDeck();
    gameState.started = true;

    for (const player of gameState.players) {
        player.hand = [];
        for (let i = 0; i < 7; i++) {
            player.hand.push(gameState.deck.pop());
        }
    }

    let topCard = gameState.deck.pop();
    while (topCard.type === 'wild') {
        gameState.deck.unshift(topCard);
        gameState.deck = shuffleDeck(gameState.deck);
        topCard = gameState.deck.pop();
    }
    gameState.discard.push(topCard);
    gameState.currentColor = topCard.color;

    await showGameBoard(message, gameState);
}

async function showGameBoard(message, gameState) {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const topCard = gameState.discard[gameState.discard.length - 1];

    const boardEmbed = new EmbedBuilder()
        .setTitle('🃏 UNO')
        .setDescription(`**Current Turn:** <@${currentPlayer.id}>\n**Direction:** ${gameState.direction === 1 ? '➡️' : '⬅️'}\n\n**Top Card:** ${getCardDisplay(topCard)}`)
        .setColor(COLOR_HEX[gameState.currentColor] || 0x5865F2)
        .setTimestamp();

    let playersInfo = '';
    gameState.players.forEach((player, idx) => {
        const arrow = idx === gameState.currentPlayer ? '▶️ ' : '';
        playersInfo += `${arrow}<@${player.id}>: ${player.hand.length} cards\n`;
    });
    boardEmbed.addFields({ name: 'Players', value: playersInfo });

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('uno_draw')
                .setLabel('Draw Card')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('uno_hand')
                .setLabel('View Hand')
                .setStyle(ButtonStyle.Secondary)
        );

    await message.channel.send({ embeds: [boardEmbed], components: [row] });
}

module.exports.unoGames = unoGames;
module.exports.COLORS = COLORS;
module.exports.COLOR_EMOJIS = COLOR_EMOJIS;
module.exports.SPECIAL_CARDS = SPECIAL_CARDS;
module.exports.WILD_CARDS = WILD_CARDS;
module.exports.getAIComment = getAIComment;
module.exports.createDeck = createDeck;
module.exports.getCardDisplay = getCardDisplay;
module.exports.canPlayCard = canPlayCard;
module.exports.startGame = startGame;
module.exports.showGameBoard = showGameBoard;

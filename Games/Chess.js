const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const chessGames = new Map();

const PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

const INITIAL_BOARD = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

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
        return data.choices?.[0]?.message?.content || '♟️ Chess Battle!';
    } catch (err) {
        return '♟️ Chess Battle!';
    }
}

function createBoard() {
    return INITIAL_BOARD.map(row => [...row]);
}

function getBoardDisplay(board) {
    let display = '  a  b  c  d  e  f  g  h\n';
    for (let i = 0; i < 8; i++) {
        display += `${8 - i} `;
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                display += `${PIECES[piece]} `;
            } else {
                display += (i + j) % 2 === 0 ? '⬜' : '⬛';
                display += ' ';
            }
        }
        display += ` ${8 - i}\n`;
    }
    display += '  a  b  c  d  e  f  g  h';
    return display;
}

function isWhitePiece(piece) {
    return piece && piece === piece.toUpperCase();
}

function isBlackPiece(piece) {
    return piece && piece === piece.toLowerCase();
}

function parsePosition(pos) {
    if (!pos || pos.length !== 2) return null;
    const col = pos.charCodeAt(0) - 97;
    const row = 8 - parseInt(pos[1]);
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    return { row, col };
}

function isValidMove(board, from, to, isWhite) {
    const piece = board[from.row][from.col];
    if (!piece) return false;
    if (isWhite && !isWhitePiece(piece)) return false;
    if (!isWhite && !isBlackPiece(piece)) return false;

    const targetPiece = board[to.row][to.col];
    if (targetPiece) {
        if (isWhite && isWhitePiece(targetPiece)) return false;
        if (!isWhite && isBlackPiece(targetPiece)) return false;
    }

    const dx = to.col - from.col;
    const dy = to.row - from.row;
    const type = piece.toLowerCase();

    switch (type) {
        case 'p': {
            const direction = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            if (dx === 0 && dy === direction && !targetPiece) return true;
            if (dx === 0 && dy === 2 * direction && from.row === startRow && !targetPiece) return true;
            if (Math.abs(dx) === 1 && dy === direction && targetPiece) return true;
            return false;
        }
        case 'r':
            if (dx !== 0 && dy !== 0) return false;
            return isPathClear(board, from, to);
        case 'n':
            return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
        case 'b':
            if (Math.abs(dx) !== Math.abs(dy)) return false;
            return isPathClear(board, from, to);
        case 'q':
            if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return false;
            return isPathClear(board, from, to);
        case 'k':
            return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    }
    return false;
}

function isPathClear(board, from, to) {
    const dx = Math.sign(to.col - from.col);
    const dy = Math.sign(to.row - from.row);
    let x = from.col + dx;
    let y = from.row + dy;
    while (x !== to.col || y !== to.row) {
        if (board[y][x]) return false;
        x += dx;
        y += dy;
    }
    return true;
}

module.exports = {
    name: 'chess',
    description: 'Play Chess game',
    async execute(message, args, client) {
        const opponent = message.mentions.users.first();

        if (!opponent || opponent.bot || opponent.id === message.author.id) {
            return message.reply('❌ Mention a valid user to play chess with.');
        }

        if (chessGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a chess game running in this channel.');
        }

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a chess game between two players. Be strategic and encouraging.`);

        const gameState = {
            players: [message.author.id, opponent.id],
            board: createBoard(),
            currentTurn: 0,
            captured: { white: [], black: [] },
            moveHistory: [],
            startedAt: Date.now()
        };

        chessGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const embed = new EmbedBuilder()
            .setTitle('♟️ Chess')
            .setDescription(`${aiComment}\n\n**<@${message.author.id}>** (White) vs **<@${opponent.id}>** (Black)\n\n\`\`\`\n${getBoardDisplay(gameState.board)}\n\`\`\`\n\n**Current Turn:** <@${gameState.players[gameState.currentTurn]}> (White)`)
            .setColor(0x5865F2)
            .setFooter({ text: 'Use: g!chessmove <from> <to> (e.g., g!chessmove e2 e4)' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};

module.exports = {
    name: 'chess',
    description: 'Play Chess game',
    async execute(message, args, client) {
        const opponent = message.mentions.users.first();

        if (!opponent || opponent.bot || opponent.id === message.author.id) {
            return message.reply('❌ Mention a valid user to play chess with.');
        }

        if (chessGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a chess game running in this channel.');
        }

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a chess game between two players. Be strategic and encouraging.`);

        const gameState = {
            players: [message.author.id, opponent.id],
            board: createBoard(),
            currentTurn: 0,
            captured: { white: [], black: [] },
            moveHistory: [],
            startedAt: Date.now()
        };

        chessGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const embed = new EmbedBuilder()
            .setTitle('♟️ Chess')
            .setDescription(`${aiComment}\n\n**<@${message.author.id}>** (White) vs **<@${opponent.id}>** (Black)\n\n\`\`\`\n${getBoardDisplay(gameState.board)}\n\`\`\`\n\n**Current Turn:** <@${gameState.players[gameState.currentTurn]}> (White)`)
            .setColor(0x5865F2)
            .setFooter({ text: 'Use: g!chessmove <from> <to> (e.g., g!chessmove e2 e4)' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};

module.exports.chessGames = chessGames;
module.exports.getAIComment = getAIComment;
module.exports.createBoard = createBoard;
module.exports.getBoardDisplay = getBoardDisplay;
module.exports.parsePosition = parsePosition;
module.exports.isValidMove = isValidMove;
module.exports.isWhitePiece = isWhitePiece;
module.exports.isBlackPiece = isBlackPiece;
module.exports.PIECES = PIECES;

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const checkersGames = new Map();

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
        return data.choices?.[0]?.message?.content || '🔴 Checkers!';
    } catch (err) {
        return '🔴 Checkers!';
    }
}

function createBoard() {
    const board = [];
    for (let i = 0; i < 8; i++) {
        board[i] = [];
        for (let j = 0; j < 8; j++) {
            if ((i + j) % 2 === 1) {
                if (i < 3) {
                    board[i][j] = { player: 1, king: false };
                } else if (i > 4) {
                    board[i][j] = { player: 2, king: false };
                } else {
                    board[i][j] = null;
                }
            } else {
                board[i][j] = null;
            }
        }
    }
    return board;
}

function getBoardDisplay(board) {
    let display = '  0  1  2  3  4  5  6  7\n';
    for (let i = 0; i < 8; i++) {
        display += `${i} `;
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                if (piece.player === 1) {
                    display += piece.king ? '👑' : '🔴';
                } else {
                    display += piece.king ? '👑' : '🔵';
                }
            } else {
                display += (i + j) % 2 === 0 ? '⬜' : '⬛';
            }
            display += ' ';
        }
        display += ` ${i}\n`;
    }
    display += '  0  1  2  3  4  5  6  7';
    return display;
}

function isValidMove(board, fromRow, fromCol, toRow, toCol, player) {
    const piece = board[fromRow][fromCol];
    if (!piece || piece.player !== player) return false;

    const targetPiece = board[toRow][toCol];
    if (targetPiece) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);

    if (!piece.king) {
        const direction = player === 1 ? 1 : -1;
        if (colDiff === 1 && rowDiff === direction) return true;
        if (colDiff === 2 && rowDiff === 2 * direction) {
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;
            const midPiece = board[midRow][midCol];
            if (midPiece && midPiece.player !== player) return true;
        }
    } else {
        if (colDiff === 1 && Math.abs(rowDiff) === 1) return true;
        if (colDiff === 2 && Math.abs(rowDiff) === 2) {
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;
            const midPiece = board[midRow][midCol];
            if (midPiece && midPiece.player !== player) return true;
        }
    }
    return false;
}

function checkForKing(board, row, col) {
    const piece = board[row][col];
    if (!piece) return;
    if (piece.player === 1 && row === 7) piece.king = true;
    if (piece.player === 2 && row === 0) piece.king = true;
}

function getValidMoves(board, player) {
    const moves = [];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (!piece || piece.player !== player) continue;

            for (let di = -2; di <= 2; di++) {
                for (let dj = -2; dj <= 2; dj++) {
                    if (di === 0 && dj === 0) continue;
                    const ni = i + di;
                    const nj = j + dj;
                    if (ni >= 0 && ni < 8 && nj >= 0 && nj < 8) {
                        if (isValidMove(board, i, j, ni, nj, player)) {
                            moves.push({ from: { row: i, col: j }, to: { row: ni, col: nj } });
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function countPieces(board, player) {
    let count = 0;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j]?.player === player) count++;
        }
    }
    return count;
}

module.exports = {
    name: 'checkers',
    description: 'Play Checkers game',
    async execute(message, args, client) {
        const opponent = message.mentions.users.first();

        if (!opponent || opponent.bot || opponent.id === message.author.id) {
            return message.reply('❌ Mention a valid user to play checkers with.');
        }

        if (checkersGames.has(`${message.guild.id}-${message.channel.id}`)) {
            return message.reply('❌ There is already a checkers game running in this channel.');
        }

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a checkers game between two players. Be playful.`);

        const gameState = {
            players: [message.author.id, opponent.id],
            board: createBoard(),
            currentTurn: 0,
            startedAt: Date.now()
        };

        checkersGames.set(`${message.guild.id}-${message.channel.id}`, gameState);

        const embed = new EmbedBuilder()
            .setTitle('🔴 Checkers')
            .setDescription(`${aiComment}\n\n**<@${message.author.id}>** (🔴) vs **<@${opponent.id}>** (🔵)\n\n\`\`\`\n${getBoardDisplay(gameState.board)}\n\`\`\`\n\n**Current Turn:** <@${gameState.players[gameState.currentTurn]}> (🔴)`)
            .setColor(0x5865F2)
            .setFooter({ text: 'Use: g!checkersmove <from_row,from_col> <to_row,to_col> (e.g., g!checkersmove 2,3 3,4)' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};

module.exports.checkersGames = checkersGames;
module.exports.getAIComment = getAIComment;
module.exports.createBoard = createBoard;
module.exports.getBoardDisplay = getBoardDisplay;
module.exports.isValidMove = isValidMove;
module.exports.checkForKing = checkForKing;
module.exports.getValidMoves = getValidMoves;
module.exports.countPieces = countPieces;

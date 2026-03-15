const { EmbedBuilder } = require('discord.js');

const minesweeperGames = new Map();

function generateBoard(rows, cols, mines) {
    const board = Array(rows).fill(null).map(() => Array(cols).fill(0));
    let placed = 0;
    
    while (placed < mines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (board[r][c] !== -1) {
            board[r][c] = -1;
            placed++;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c] === -1) continue;
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === -1) {
                        count++;
                    }
                }
            }
            board[r][c] = count;
        }
    }

    return board;
}

const emojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '💣'];

module.exports = {
    name: 'minesweeper',
    description: 'Minesweeper game dengan spoiler',
    async execute(message, args, client) {
        const size = parseInt(args[0]) || 8;
        const mines = Math.min(Math.floor(size * size * 0.15), 20);
        
        const board = generateBoard(size, size, mines);
        
        let display = '';
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = board[r][c];
                const emoji = cell === -1 ? '💣' : emojis[cell];
                display += `||${emoji}||`;
            }
            display += '\n';
        }

        const embed = new EmbedBuilder()
            .setTitle('💣 Minesweeper')
            .setDescription(display)
            .addFields(
                { name: '📊 Info', value: `Ukuran: ${size}x${size}\n💣 Mines: ${mines}` },
                { name: '🎮 Cara Main', value: 'Klik spoiler untuk membuka kotak. Hindari 💣!' }
            )
            .setColor(0x5865F2)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

module.exports.minesweeperGames = minesweeperGames;

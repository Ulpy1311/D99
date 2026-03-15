const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const countingGames = new Map();

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
        return data.choices?.[0]?.message?.content || '🔢 Count with us!';
    } catch (err) {
        return '🔢 Count with us!';
    }
}

module.exports = {
    name: 'counting',
    description: 'Start a counting game where users must count consecutively',
    async execute(message, args, client) {
        const goal = parseInt(args[0]) || 100;

        if (countingGames.has(message.channel.id)) {
            return message.reply('❌ There is already a counting game running in this channel.');
        }

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence) for starting a counting game with a goal of ${goal}. Be encouraging.`);

        const gameState = {
            currentNumber: 0,
            goal: goal,
            lastUser: null,
            participants: new Map(),
            startedAt: Date.now(),
            mistakes: 0,
            highScore: 0
        };

        countingGames.set(message.channel.id, gameState);

        const embed = new EmbedBuilder()
            .setTitle('🔢 Counting Game Started!')
            .setDescription(`${aiComment}\n\n**Goal:** Reach ${goal}\n**Rules:**\n• Users must count consecutively (1, 2, 3...)\n• Same user cannot count twice in a row\n• Wrong number resets the count!\n\n**Current Number:** 0\n**Next Number:** 1`)
            .setColor(0x5865F2)
            .setFooter({ text: 'Start counting!' })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};

function handleCountingMessage(message, client) {
    const gameState = countingGames.get(message.channel.id);
    if (!gameState) return false;

    const number = parseInt(message.content);

    if (isNaN(number)) return false;

    const expectedNumber = gameState.currentNumber + 1;

    if (number !== expectedNumber) {
        gameState.mistakes++;
        const wrongEmbed = new EmbedBuilder()
            .setTitle('❌ Wrong Number!')
            .setDescription(`You said **${number}** but expected **${expectedNumber}**!\n\nThe count has been reset.\n**High Score:** ${gameState.highScore}\n\nStart again from 1!`)
            .setColor(0xFF0000);

        message.reply({ embeds: [wrongEmbed] });
        gameState.currentNumber = 0;
        gameState.lastUser = null;
        gameState.participants.clear();
        return true;
    }

    if (gameState.lastUser === message.author.id) {
        const sameUserEmbed = new EmbedBuilder()
            .setTitle('⚠️ Same User!')
            .setDescription(`<@${message.author.id}>, you cannot count twice in a row!\n\nWait for someone else to continue.`)
            .setColor(0xFFAA00);

        message.reply({ embeds: [sameUserEmbed] });
        return true;
    }

    gameState.currentNumber = expectedNumber;
    gameState.lastUser = message.author.id;
    gameState.participants.set(message.author.id, (gameState.participants.get(message.author.id) || 0) + 1);

    if (gameState.currentNumber > gameState.highScore) {
        gameState.highScore = gameState.currentNumber;
    }

    if (gameState.currentNumber >= gameState.goal) {
        const winEmbed = new EmbedBuilder()
            .setTitle('🎉 Goal Reached!')
            .setDescription(`Congratulations! You reached **${gameState.goal}**!\n\n**Participants:**\n${[...gameState.participants.entries()].map(([id, count]) => `<@${id}>: ${count} numbers`).join('\n')}\n\n**Total Mistakes:** ${gameState.mistakes}`)
            .setColor(0x00FF00)
            .setTimestamp();

        message.channel.send({ embeds: [winEmbed] });
        countingGames.delete(message.channel.id);
        return true;
    }

    if (gameState.currentNumber % 10 === 0) {
        const milestoneEmbed = new EmbedBuilder()
            .setTitle(`🔢 Milestone: ${gameState.currentNumber}!`)
            .setDescription(`Great progress! Next number: **${gameState.currentNumber + 1}**`)
            .setColor(0x5865F2);

        message.channel.send({ embeds: [milestoneEmbed] });
    }

    return true;
}

function getCountingStatus(channelId) {
    const gameState = countingGames.get(channelId);
    if (!gameState) return null;
    return {
        currentNumber: gameState.currentNumber,
        goal: gameState.goal,
        participants: gameState.participants.size,
        highScore: gameState.highScore,
        mistakes: gameState.mistakes
    };
}

module.exports.countingGames = countingGames;
module.exports.handleCountingMessage = handleCountingMessage;
module.exports.getCountingStatus = getCountingStatus;
module.exports.getAIComment = getAIComment;

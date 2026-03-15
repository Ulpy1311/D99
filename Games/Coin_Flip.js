const { EmbedBuilder } = require('discord.js');

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
        return data.choices?.[0]?.message?.content || '🪙 Flipping the coin!';
    } catch (err) {
        return '🪙 Flipping the coin!';
    }
}

module.exports = {
    name: 'coinflip',
    description: 'Flip a coin',
    async execute(message, args, client) {
        const prediction = args[0]?.toLowerCase();

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const emoji = result === 'heads' ? '🪙' : '🥈';

        let aiPrompt = `Give a short fun comment (1 sentence, max 15 words) for a coin flip landing on ${result}.`;
        let resultText = `The coin landed on **${result.toUpperCase()}**! ${emoji}`;

        if (prediction === 'heads' || prediction === 'tails') {
            const won = prediction === result;
            aiPrompt = `Give a short fun comment (1 sentence, max 15 words) for a coin flip where someone predicted ${prediction} and ${won ? 'won' : 'lost'}. The result was ${result}.`;
            resultText = `You predicted: **${prediction.toUpperCase()}**\nThe coin landed on: **${result.toUpperCase()}** ${emoji}\n\n${won ? '🎉 You guessed correctly!' : '❌ Better luck next time!'}`;
        }

        const aiComment = await getAIComment(aiPrompt);

        const embed = new EmbedBuilder()
            .setTitle('🪙 Coin Flip')
            .setDescription(`${aiComment}\n\n${resultText}`)
            .setColor(0x5865F2)
            .setFooter({ text: `Flipped by ${message.author.tag}` })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};

module.exports.getAIComment = getAIComment;

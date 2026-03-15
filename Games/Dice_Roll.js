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
        return data.choices?.[0]?.message?.content || '🎲 Rolling the dice!';
    } catch (err) {
        return '🎲 Rolling the dice!';
    }
}

module.exports = {
    name: 'diceroll',
    description: 'Roll one or more dice',
    async execute(message, args, client) {
        const diceNotation = args[0] || '1d6';

        const match = diceNotation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
        if (!match) {
            return message.reply('❌ Invalid dice notation. Use format: `NdS` (e.g., 2d6, 1d20, 3d8+5)');
        }

        const numDice = parseInt(match[1]) || 1;
        const diceSides = parseInt(match[2]);
        const modifier = parseInt(match[3]) || 0;

        if (numDice < 1 || numDice > 100) {
            return message.reply('❌ Number of dice must be between 1 and 100.');
        }

        if (diceSides < 2 || diceSides > 1000) {
            return message.reply('❌ Number of sides must be between 2 and 1000.');
        }

        const rolls = [];
        for (let i = 0; i < numDice; i++) {
            rolls.push(Math.floor(Math.random() * diceSides) + 1);
        }

        const total = rolls.reduce((a, b) => a + b, 0) + modifier;

        const aiComment = await getAIComment(`Give a short fun comment (1 sentence, max 15 words) for a dice roll result of ${total} from ${numDice}d${diceSides}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}. Individual rolls: ${rolls.join(', ')}.`);

        const embed = new EmbedBuilder()
            .setTitle('🎲 Dice Roll')
            .setDescription(`${aiComment}\n\n**Roll:** ${numDice}d${diceSides}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}\n**Result:** ${total}`)
            .setColor(0x5865F2)
            .addFields(
                { name: 'Individual Rolls', value: rolls.join(', '), inline: true },
                { name: 'Modifier', value: modifier !== 0 ? (modifier > 0 ? `+${modifier}` : String(modifier)) : 'None', inline: true }
            )
            .setFooter({ text: `Rolled by ${message.author.tag}` })
            .setTimestamp();

        await message.reply({ embeds: [embed] });
    }
};

module.exports.getAIComment = getAIComment;

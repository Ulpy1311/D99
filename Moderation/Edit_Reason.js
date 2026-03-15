module.exports = {
    name: 'editreason',
    description: 'Edit alasan mod action',
    async execute(message, args, client) {
        const caseId = parseInt(args[0]);
        if (isNaN(caseId)) return message.reply('Mohon berikan Case ID.');

        const newReason = args.slice(1).join(' ');
        if (!newReason) return message.reply('Mohon berikan alasan baru.');

        global.modHistory = global.modHistory || [];
        if (!global.modHistory[caseId]) return message.reply('Case tidak ditemukan.');

        global.modHistory[caseId].reason = newReason;
        message.reply(`Alasan untuk Case #${caseId} telah diperbarui.`);
    }
};

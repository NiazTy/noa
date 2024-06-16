import { Collection, ChannelType, Events } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const escapeRegex = (string) => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default {
    name: Events.MessageCreate,
    async execute(message) {
        const { client, guild, channel, content, author } = message;

        if (message.content == `<@${client.user.id}>` || message.content == `<@!${client.user.id}>`) { 
            require("../messages/onMention").default.execute(message);
            return;
        }

        const prefix = process.env.PREFIX;
        const checkPrefix = prefix.toLocaleLowerCase()
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(checkPrefix)})\\s*`);

        if (!prefixRegex.test(content.toLowerCase())) 
            return;

        const [
            matchedPrefix
        ] = content.toLowerCase().match(prefixRegex);
		const args = content.slice(matchedPrefix.length).trim().split(/ +/);
		const commandName = args.shift().toLowerCase();

        if (!content.startsWith(matchedPrefix) || author.bot) 
            return;

        const command = client.commands.get(commandName) || client.commands.find((cmd) => 
            cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) 
            return;

		if (command.devOnly && author.id !== process.env.DEVELOPER) {
			return message.reply({
                content: "Sorry you don't have access to this command! This command can only be used by the owner!"
            });
		}
        if (command.guildOnly && channel.type === ChannelType.DM) {
			return message.reply({
                content: "Sorry, but this command can only be used inside the server!"
            });
		}
        if (command.permissions && channel.type !== ChannelType.DM) {
			const authorPerms = channel.permissionsFor(author);

			if (!authorPerms || !authorPerms.has(command.permissions)) {
				return message.reply({
                    content: "Sorry, but you cannot access the command"
                });
			}
		}
        if (command.args && !args.length) {
			let reply = `You didn't provide any arguments, ${author}!`;

			if (command.usage) {
				reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
			}

			return channel.send({ content: reply })
		}

        const { cooldowns } = client;

		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.reply({
					content: `please wait ${timeLeft.toFixed(
						1
					)} more second(s) before reusing the \`${command.name}\` command.`,
				});
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        try {
			command.execute(message, args);
		} catch (error) {
			console.error(error);
			message.reply({
                content: "There was an error when trying to execute the command, please view the console"
            });
		}
    }
}
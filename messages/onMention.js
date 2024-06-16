import dotenv from "dotenv";
dotenv.config();

export default {
    name: "onMention",
    async execute(message) {
        const prefix = process.env.PREFIX;
		return message.channel.send(
			`Hi ${message.author}! My prefix is \`${prefix}\`, get help by \`${prefix}help\``
		);
	},
}
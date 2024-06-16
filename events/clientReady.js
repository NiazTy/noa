import chalk from "chalk";
import { Events } from "discord.js";
// import readline from "readline";

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });

export default {
    name: Events.ClientReady,
	once: true,
	execute(client) {
        const kaomoji = [
            "♡⸜(˶˃ ᵕ ˂˶)⸝♡", "♡( ◡‿◡ )", "( ˶ˆ ᗜ ˆ˵ )", "(˶ᵔ ᵕ ᵔ˶)"
        ]

        console.log([
            chalk.bold(`Hello System Admin!`),
            chalk.gray(`If you want to stop me, press stop button in your panel or if doesn't type exit`),
            chalk.gray(`Watching all my commands`),
            '',
            chalk.magenta(kaomoji[Math.floor(Math.random() * kaomoji.length)]),
            '',
            chalk.bold(`If you need help`),
            chalk.gray(`Please contact our developer, Niaz`)
        ].join("\n"))
    }
}
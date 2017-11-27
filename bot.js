#!/usr/bin/env node

// load discord.js and create a client object
const Discord = require("discord.js");
const client = new Discord.Client();

// configuration file
const config = require("./config");

// cli flags
const flags = {};

// remove mentions of the bot from a message
function removeMentions(msg)
{
	const mention = `<@${client.user.id}>`;
	return msg.replace(new RegExp(mention, "g"), "");
}

// get the designated bot channel for the guild
// for now just the first channel with the name specified in the config
function getBotChannel(guild)
{
	return guild.channels.filter(channel => channel.name === config.botChannel).first();
}

// send discord messages safely
// and properly split up messages longer than _limit_ characters
// callback is the send function for the first chunk
// tail is for the rest
function safeSend(msg, callback, callbackTail, chunkDelimiter="\n", charLimit=1800, doneCallback)
{
	if(!msg.trim().length)
	{
		if(doneCallback) doneCallback();
		return;
	}
	var first = msg;
	var rest = "";
	// make this safer so it aborts if something can't be split small enough
	while(first.length > charLimit)
	{
		if(first.indexOf(chunkDelimiter) == -1)
		{
			console.error("\t-> Can't split message into small enough pieces:");
			console.error(`{${first}}\n`);
			console.error("\t<-!!");
			return;
		}
		rest = first.split(chunkDelimiter).slice(-1).concat([rest]).join(chunkDelimiter);
		first = first.split(chunkDelimiter).slice(0, -1).join(chunkDelimiter);
	}
	callback(first);
	safeSend(rest, callbackTail || callback, callbackTail || callback, chunkDelimiter, charLimit, doneCallback);
}

// send a bot string from config file
// with optional stuff after it (arg)
function sendBotString(string, headSendFunction, tailSendFunction, arg="", chunkDelimiter, charLimit, doneCallback)
{
	const stringObj = config.botStrings[string];
	const msg = stringObj.string + arg;
	if(stringObj.enabled) safeSend(msg, headSendFunction, tailSendFunction, chunkDelimiter, charLimit, doneCallback);
}

// reply to a message with msg
// mentions the user unless its private
function reply(message, msg, options)
{
	if(config.replyMention && message.guild) return message.reply(msg, options);
	else return message.channel.send(msg, options);
}

// tab over newlines
function tabNewlines(string)
{
	return string.split("\n").map((line, i) => {
		return i ? `\t${line}` : line;
	}).join("\n");
}

// pretty print a received discord message to console
function logMessage(message, edit)
{
	// +tab newlines for readability
	const loggedMsg = tabNewlines(message.content);

	// string indicated this was an edit
	const e = edit ? "(edit) " : "";

	// if direct message (no guild)
	if(!message.guild) console.log(`${e}${message.author.tag}> ${loggedMsg}`);
	// if message from guild
	else console.log(`${e}${message.guild.name}> #${message.channel.name}> ${message.author.tag}> ${loggedMsg}`);
}

/* BOT COMMAND FUNCTIONS */

// respond with help message
function requestHelp(arg, args, message)
{
	sendBotString("onHelpRequest", msg => reply(message, msg), msg => message.channel.send(msg));
}

// respond with discord server invite link in private messages
function requestInviteLink(arg, args, message)
{
	sendBotString("onInviteLinkRequest", msg => reply(message, msg), msg => message.channel.send(msg));
}

// respond with info message
function requestInfo(arg, args, message)
{
	sendBotString("onInfoRequest", msg => reply(message, msg), msg => message.channel.send(msg));
}

// respond with list of commands
function requestCommandListing(arg, args, message)
{
        // get the list of command strings
        const ls = Object.keys(config.commands).sort().map(key => {
		const aliases = config.commands[key].aliases.map((v, i) =>
			(i ? `\`${config.trigger}${v}\`` : `**\`${config.trigger}${v}\`**`));
		const description = config.commands[key].description;
		const aliasString = aliases.join(", ");
		return `• ${aliasString}:\n\t\t**->** ${description}`;
	});
        sendBotString("onCommandListingRequest", msg => reply(message, msg), msg => message.channel.send(msg), `\n${ls.join("\n")}`);
}

// assign a color role to a user
function requestColorRole(arg, args, message)
{
	if(message.guild)
	{
		// get the case-retaining role name
		const roles = config.colorRoles.filter(role => role.toLowerCase() === arg.trim().toLowerCase());
		if(roles.length)
		{
			// get the role name
			// get the role itself
			const roleName = roles[0];
			const role = message.guild.roles.find("name", roleName);

			// see if they already have the role or not
			if(message.member.roles.has(role.id))
			{
				// remove the role since they have it already
				message.member.removeRole(role).then(() => {
					reply(message, `You no longer have the ${roleName} color role.`);
				}).catch(console.error);
			}
			else
			{
				// remove all other color roles first
				config.colorRoles.forEach(roleName => {
					const role = message.guild.roles.find("name", roleName);
					if(message.member.roles.has(role.id))
						message.member.removeRole(role).catch(console.error);
				});
				// then add this color
				message.member.addRole(role).then(() => {
					reply(message, `You now have the ${roleName} color role!`);
				}).catch(console.error);
			}
		}
		else sendBotString("onUnknownColorRole", msg => reply(message, msg));
	}
	else sendBotString("guildOnlyCommand", msg => reply(message, msg));
}

// respond with list of color roles
function requestColorRoleListing(arg, args, message)
{
	const ls = config.colorRoles.map(color => `• ${color}`).join("\n");
        sendBotString("onColorRoleListingRequest", msg => reply(message, msg), msg => message.channel.send(msg), `\n${ls}`);
}

// map of commands
const commands = {};

// add a command to the commands map
// names is all the aliases of the command
// f is the command function
function registerCommand(names, f)
{
	names.forEach(name => commands[name] = f);
}

// register the commands
registerCommand(config.commands.requestHelp.aliases, requestHelp);
registerCommand(config.commands.requestInviteLink.aliases, requestInviteLink);
registerCommand(config.commands.requestInfo.aliases, requestInfo);
registerCommand(config.commands.requestCommandListing.aliases, requestCommandListing);
registerCommand(config.commands.colorRole.aliases, requestColorRole);
registerCommand(config.commands.colorRoleList.aliases, requestColorRoleListing);

// executes a command
// given cmd name, arg string, args list, and originating discord message
function executeCommand(cmd, arg, args, message)
{
	// get the command function and call it
	// return false if command doesn't exist
	const command = commands[cmd];
	if(command) command(arg, args, message);
	else return false;
	return true;
}

// process a message to the bot
// the message string, and the originating discord message object
function processBotMessage(msg, message)
{
	// cmd is case insensitive, args retain case
	const words = msg.split(/\s+/g);
	const cmd = words[0].toLowerCase();
	const arg = msg.slice(msg.indexOf(cmd) + cmd.length);
	// remove empty args
	const args = words.slice(1).filter((v) => {
		return v.length;
	});

	// execute the command
	if(!executeCommand(cmd, arg, args, message)) sendBotString("onUnknownCommand", msg => reply(message, msg), msg => message.channel.send(msg));
}

// process a discord message
function processMessage(message)
{
	// ignore messages from bots
	if(message.author.bot) return;

	// figure out if a message is directed at the bot or not
	// and extract the intended message to the bot
        const content = message.content.trim();
        const dm = !message.guild;
	// is it safe to use arbitrary string as regex ? ?
	const triggerCount = (content.match(new RegExp(config.trigger, "g")) || []).length;
        const triggered = content.startsWith(config.trigger) &&
		(!config.singleTrigger || triggerCount == 1);
	const mentioned = message.mentions.users.has(client.user.id);
	const inBotChannel = config.enableBotChannelAddressing &&
		message.channel.name === config.botChannel;
	const clean = mentioned ? removeMentions(content).trim() : content;
	const msg = triggered ? clean.slice(config.trigger.length).trim() : clean;

	// care only if it isn't empty or has an attachment
	// that and must be addressing the bot in some way
	if(msg.length && (dm || triggered || mentioned || inBotChannel))
	{
		if(!config.logAllMessages) logMessage(message);
		// go handle the message to the bot
		processBotMessage(msg, message);
	}
}

// when the bot successfully logs in
client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

// when bot is added to a guild
client.on("guildCreate", guild => {
	console.log(`Added to guild ${guild.name} <${guild.id}>!`);
	console.log(`Now a part of ${client.guilds.size} guilds!`);
});

// when bot is removed from a guild
client.on("guildDelete", guild => {
	console.log(`Removed from guild ${guild.name} <${guild.id}>!`);
	console.log(`Now a part of ${client.guilds.size} guilds!`);
});

// when a message is received
client.on("message", message => {
	if(config.logAllMessages) logMessage(message);
	processMessage(message);
});

// when a message is edited
client.on("messageUpdate", (newMessage, oldMessage) => {
	if(config.logAllMessages) logMessage(message);
});

// start bot with token from command line
function main()
{
	// scan the command line args for flags and token
	const args = process.argv.slice(2);
	var token = null;
	args.forEach((arg, i) => {
		// if its a flag in the flags object
		if(arg.startsWith("--"))
		{
			// check if its a known flag (in flags object)
			// set it if so
			// otherwise fail
			const flag = arg.slice(2);	// the flag name
			if(Object.keys(flags).includes(flag)) flags[flag] = true;
			else exit(`Unknown argument: ${arg}`);
		}
		// otherwise expect the token
		else token = arg;
	});

	// login with supplied token
	if(token) client.login(token);
	else console.error("Please supply the login token!");
}

// start
main();

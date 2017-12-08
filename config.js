const discord = require("discord.js");
const config = {};
module.exports = config;

config.botName = "MegoRain";			// the name of the bot
config.author = "Mego#8517 and ๖̶̶̶ζ͜͡SoapyRainmaker#1098";	// the author(s) of the bot
config.framework = `discord.js ${discord.version}`;	// the framework used
config.trigger = "-";				// bot prefix
config.singleTrigger = false;			// whether the prefix must occur only once in a message
config.botChannel = "";				// channel where all messages are directed at the bot
config.enableBotChannelAddressing = false;	// enable the bot channel or not
config.logAllMessages = false;			// log all messages (or just ones @ bot)
config.replyMention = false;			// always ping in reply

// links
const inviteLink = "https://discordapp.com/oauth2/authorize?client_id=384488531738886154&scope=bot&permissions=0";

// bot command aliases and descriptions
// these are what the users type in to interact with the bot
config.commands = {};
config.commands.requestHelp = {
	aliases: ["help", "tutorial"],
	description: "Help on using this bot",
};
config.commands.requestInviteLink = {
	aliases: ["invite", "link", "server", "discord"],
	description: "Invite this bot to your Discord server!",
};
config.commands.requestInfo = {
	aliases: ["info", "about", "information"],
	description: "See some information about this bot",
};
config.commands.requestCommandListing = {
	aliases: ["commands", "command", "commandlist", "commandlisting"],
	description: "See all of this bot's commands",
};
config.commands.colorRole = {
	aliases: ["color", "assigncolor", "colorrole", "role"],
	description: "Give yourself a color role!",
};
config.commands.colorRoleList = {
	aliases: ["colors", "colorlist", "colorroles", "colorrolelist"],
	description: "See what color roles there are",
};
config.commands.overwatchNews = {
	aliases: ["own", "overwatch", "news", "overwatchnews"],
	description: "See the latest Overwatch news posts",
};

// help message
const helpString = `This is **${config.botName}**!

**Here's some things you can try:** _(Commands)_
• \`${config.trigger}help\` — See this help message!
• \`${config.trigger}invite\` — Add this bot to your own Discord server!
• \`${config.trigger}info\` — Get some basic information about this bot!
• \`${config.trigger}commands\` — See all the commands you can use!

**How to talk to this bot:**
There are a few different ways you can get this bot's attention. The first way is to start your message with \`${config.trigger}\` so it know you are addressing it. Another way is to simply @mention it with your message. You can also simply send it a direct message!` + (config.enableBotChannelAddressing ? ` One final way to talk to this bot is to simply talk in the #{config.botChannel} channel.` : "");

// info message
const infoString = `**${config.botName}**
Made with :heart: by **${config.author}** with **${config.framework}**
Ask if you'd like to \`${config.trigger}invite\` this bot to your Discord server!
Ask for \`${config.trigger}help\` to get started!`;

// strings the bot uses
config.botStrings = {
	// when you ask for general help
	"onHelpRequest": {
		string: helpString,
		enabled: true,
	},
	// when you ask for the server invite link for the bot
	"onInviteLinkRequest": {
		string: `Thank you for inviting the bot to your server!\n${inviteLink}`,
		enabled: true,
	},
	// when you ask for info on the bot
	"onInfoRequest": {
		string: infoString,
		enabled: true,
	},
	// when you ask for listing of commands
	"onCommandListingRequest": {
		string: "Here's all the commands you can use with this bot:",
		enabled: true,
	},
	// when you ask for what color roles there are
	"onColorRoleListingRequest": {
		string: "Here are the color roles you can get:",
		enabled: true,
	},
	// when you ask for latest overwatch news
	"onOverwatchNewsRequest": {
		string: "Here are the latest Overwatch news articles:",
		enabled: true,
	},
	// when you try to assign an unknown color role
	"onUnknownColorRole": {
		string: "I'm sorry, that color isn't available! (See `${config.trigger}colors`)",
		enabled: true,
	},
	// when you try a command that is only allowed in guilds
	"guildOnlyCommand": {
		string: "You can only use that command in servers!",
		enabled: true,
	},
	// when you try a command that the bot doesn't know
	"onUnknownCommand": {
		string: "I'm sorry, that is an unknown command!",
		enabled: true,
	},
};

// the self assignable color roles
config.colorRoles = [
	"Blu",
	"Overwatch Orange",
	"Soapy Purple",
	"Pocket Camp Purple",
	"Ukuletea Yellow",
	"Wasabi Green",
	"greys biology",
	"Garnet Red",
];

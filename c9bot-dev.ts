import * as Discord from 'discord.js';                         // This is required--the discord API.
import * as config from "../deps/c9bot_deps/dev-config.json";  // Configuration options for the bot -- Witheld from the repository for privacy.
//import * as config from "../deps/c9bot_deps/live-config.json"; // Configuration options for the bot -- Witheld from the repository for privacy.
import * as fs from 'fs';                                      // Filesystem control.
import { Time, Day, updateTime } from "./deps/timeContext";    // Local Time
import { MagicBilliard } from "./deps/8ball";                  // Magic 8-ball
import { User, Message } from "./deps/serverContext";          // Server Helpers
import { profile } from 'console';

const Terminal = require('node-cmd'); // Interface with the Server Terminal

// Create bot instance and log in.
const bot = new Discord.Client();
bot.login(config.token);

// External Data
let userPath: string = "../deps/c9bot_deps/profileCache.json";
let cmdData: any = fs.readFileSync("../deps/c9bot_deps/commandCache.json");
let roleData: any = fs.readFileSync("../deps/c9bot_deps/roleCache.json");
let userData: any = fs.readFileSync(userPath);

let profileCache: any = JSON.parse(userData);
let commandCache: any = JSON.parse(cmdData);
let roleCache: any = JSON.parse(roleData);

// Time
let localTime: Time = new Time();
let classEnded: boolean = false;
updateTime(localTime, 1000, executeTimedEvents);

// Timed Events
function executeTimedEvents(Today: Day) {

    let channelGeneral: any = bot.channels.fetch(config.channel_general_id);

    // It is Saturday or Sunday
    if (Today.IsWeekend === true) {
        // Saturday, 10:00 AM
        if (Today.Name === "Saturday") {
            if (Today.Clock.Time === "10:00:00") {
                channelGeneral.then((c: any) => {
                    c.send(
                        "I don't know who needed to hear this today, but you matter and you're loved. :heart:\n" +
                        "We may not have class today, but make sure to complete any assignments you may have and check in with your accountability partner.\n" +
                        "Let's all do our best to get to where we're going together one step at a time. :slight_smile:"
                    );
                });
            }
        }

        // Sunday, 10:00 AM
        if (Today.Name === "Sunday") {
            if (Today.Clock.Time === "10:00:00") {
                channelGeneral.then((c: any) => {
                    c.send(
                        `It's ${Today.Name}, so even I get a day off, too, right? :sleeping: That'd be nice... but I'm here to serve ~♫\n` +
                        "Since we have class tomorrow, I hope everyone is prepared. I'm looking forward to sending a reminder!"
                    );
                });
            }
        }
    }
    else {
        // 8:00 AM
        if (Today.Clock.Time === "08:00:00") {
            classEnded = false;
        }

        // 1:45 PM
        if (Today.Clock.Time === "13:45:00") {
            channelGeneral.then((c: any) => {
                sendEmbed(null, localTime, "class");
            });
        }

        // 6:00 PM
        if (Today.Clock.Time === "18:00:00") {
            classEnded = true;
        }
    }
}

// Send an embedded message.
function sendEmbed(message: any, time: Time, embedType: string) {
    let eArgs = embedType.split(' ');
    let embedMsg: Discord.MessageEmbed = new Discord.MessageEmbed()
    .setTimestamp()
    .setFooter("NPower C9 Afternoon Class");

    switch(eArgs[0])
    {
        case "class": {
            let pdDay: boolean = (time.Today.Name === "Thursday");
            let zoomLinks: Array<String> = [config.zoom_tech, config.zoom_pd];
            let studyTopic: Array<String> = ["studying technical instruction", "professionally developing ourselves"];

            embedMsg.setTitle("Class Reminder");
            embedMsg.setDescription(`It's almost time for class, everyone! Today is ${time.Today.Name}, so you know what that means--today we're ${studyTopic[pdDay ? 1 : 0]}!`);
            embedMsg.addFields(
                { name: "📝 Class Resources", value: `Click [here](${config.moodle}) to access resources on Moodle.\n`},
                { name: "🕑 Don't forget to clock in!", value: `Click [here](${config.timeclock}) to clock in with OpenTimeClock.\n`},
                { name: "🎦 Zoom Meeting", value: `Click [here](${zoomLinks[pdDay ? 1 : 0]}) to directly join class for the day.\n`},
                { name: "📅 Homework Calendar", value: `Click [here](${config.team_calendar}) to see today's homework as summarized by Nick.\n`}
            );

            embedMsg.setColor("#0095FF");
        } break;
        case "profile": {
            let userID: any = profileCache[message.member.id];
            let userAvatar: string = "";

            embedMsg.setTitle(`${userID.first_name} ${userID.last_name}`);
            embedMsg.setAuthor("Server Profile", "https://cdn.discordapp.com/app-icons/814220039045382235/e9a9e01e8b0c0f4eb420487a56547207.png");
            embedMsg.addFields(
                {name: "Role", value: `${roleCache[userID.role].alias}`, inline: true},
                {name: "Occupation", value: `${userID.job}`, inline: true},
                {name: "Contact", value: `${userID.email}`, inline: true},
                {name: "Likes", value: `${userID.likes}`, inline: true},
                {name: "Dislikes", value: `${userID.dislikes}`, inline: true},
                {name: "Favorite Quote", value: `“${userID.quote.body}” – ${userID.quote.author}`, inline: false}
            );

            if (message.author.avatarURL("png", true, 256) != null) {
                userAvatar = message.author.avatarURL("png", true, 256);
                embedMsg.setThumbnail(`${userAvatar}`);
            }

            embedMsg.setColor(`${userID.color}`);
        } break;
        case "commands": {
            let cmdKeys = Object.keys(commandCache);

            embedMsg.setTitle("Command List");
            embedMsg.setDescription("This is what I'm capable of:");
            for (let i: number = 0; i < cmdKeys.length; i++) {
                if (commandCache[cmdKeys[i]].access === "Everyone") {
                    if (commandCache[cmdKeys[i]].args !== "") {
                        let argString: string = `${commandCache[cmdKeys[i]].desc}`;
                        for (var key in commandCache[cmdKeys[i]].args) {
                            argString += `\n   **• ${key}**: ${commandCache[cmdKeys[i]].args[key]}`;
                        }
                        embedMsg.addField(`${cmdKeys[i]}`, argString);
                    }
                    else {
                        embedMsg.addField(`${cmdKeys[i]}`, `${commandCache[cmdKeys[i]].desc}`);
                    }
                }
            }

            embedMsg.setColor("#CCCCCC");
        } break;
        case "staff": {
            let profileKeys = Object.keys(profileCache);

            embedMsg.setTitle("Staff Contact Card");
            embedMsg.setDescription("Our _lovely_ staff members include the following:");
            for (let i: number = 0; i < profileKeys.length; i++) {
                if (profileCache[profileKeys[i]].role === "Staff") {
                    embedMsg.addField(
                        `:envelope: ${profileCache[profileKeys[i]].first_name} ${profileCache[profileKeys[i]].last_name}`,
                        `${profileCache[profileKeys[i]].email}`
                    );
                }
            }

            embedMsg.setColor("#FFF644");
        } break;
        case "support": {
            let profileKeys = Object.keys(profileCache);

            embedMsg.setTitle("Support Contact Card");
            embedMsg.setDescription("Our amazing social support managers and help with attendance:");
            for (let i: number = 0; i < profileKeys.length; i++) {
                if (profileCache[profileKeys[i]].job.includes("Support")) {
                    embedMsg.addField(
                        `:envelope: ${profileCache[profileKeys[i]].first_name} ${profileCache[profileKeys[i]].last_name}`,
                        `${profileCache[profileKeys[i]].email}`
                    );
                }
            }

            embedMsg.setColor("#FFF644");
        } break;
        case "email": {

            embedMsg.setTitle("Contact Card");
            embedMsg.addField(
                `:envelope: ${profileCache[eArgs[1]].username}`,
                `${profileCache[eArgs[1]].email}`
            );
            embedMsg.setColor("#FFF644");
        } break;
    }

    message.channel.send(embedMsg);
}

// Manipulate PM2 Process
function serverProcess(channel: any, op: string) {
    if (op.toLowerCase() === "status") {
        channel.send(`The process has been alive for ${bot.uptime}ms.`);
    }
    else if (op.toLowerCase() === "time") {
        channel.send(`${localTime.Today.Name}, ${localTime.Month.Name} ${localTime.Date}, ` +
        `${localTime.Year}\n${localTime.Today.Clock.Time}`);
    }
    else if (op.toLowerCase() === "restart") { 
        channel.send("Restarting...");
        Terminal.get(
            `pm2 restart ${config.process}`, function (err: any, data: string, stderr: any) {
                try { console.log(`Restarting ${config.process}...`); } 
                catch(err) {}
            });
        channel.send("I'm back, baby! :sunglasses:");
    }
    else if (op.toLowerCase() === "shutdown") {
        channel.send("I'm feeling sleepy. Goodnight! :sleeping:")
        .then((msg: any) => bot.destroy());
        Terminal.get(
            `pm2 stop ${config.process}`, function (err: any, data: string, stderr: any) {
                try { console.log(`Stopping ${config.process}...`); } 
                catch(err) {}
            });
    }
    else if (op.toLowerCase() === "update") {
        channel.send("Pulling from GitHub...");
        Terminal.get("cd ~/discord/c9bot && git pull");
        channel.send("Transpiling from TypeScript...");
        Terminal.get(`tsc ${config.process}.ts --resolveJsonModule`);
        serverProcess(channel, "restart");
        channel.send("Update complete.");
    }
}

//bot.on('ready', () => {
//
//});

bot.on('message', (m: any) => {

    let channelGeneral: any = bot.channels.fetch(config.channel_general_id);
    let msg: Message = new Message(m);
    let cmdString: string = msg.Arguments[0].slice(config.prefix.length);

    // Commands
    switch(cmdString) {
        case "server": {
            if (msg.Sender.VerifyID(config.dev_id)) {
                // Send in general channel.
                if (msg.Arguments[1] === "say") {
                    let sendString = msg.ContentWithoutPrefix.replace(msg.Arguments[1], "").trim();
                    m.delete();
                    channelGeneral.then((c: any) => {
                        c.send(`${sendString}`);
                    })
                }
                else
                    serverProcess(m.channel, msg.Arguments[1]);
            }
            else {
                m.reply("you aren't authorized to use this command.");
            }
        } break;
        case "debug": {
            if (msg.Sender.VerifyRole(config.mod_role) || msg.Sender.VerifyID(config.dev_id)) {
                switch(msg.Arguments[1]) {
                    case "remind":
                    case "reminder": {
                        sendEmbed(m, localTime, "class");
                    } break;
                    case "user": {
                        let dbgUser: any = msg.Sender.ResolveMention(bot, msg.Arguments[2]);
                        if (!dbgUser) {
                            m.reply("please mention a user to debug.");
                        } else {
                            m.channel.send(`Tag: ${dbgUser.username}#${dbgUser.discriminator}\nID: ${dbgUser.id}`);
                        }
                    } break;
                }
            }
            else {
                m.reply("you aren't authorized to use this command.");
            }
        } break;
        case "commands":
        case "?": {
            sendEmbed(m, localTime, "commands");
        } break;
        case "source":
        case "src": {
            m.channel.send(`W-what do you mean you want to see what I'm like on the inside? That's so embarassing... :flushed:\nMy source can be found here: ${config.git_repo}`);
        } break;
        case "coinflip": {
            let sides: Array<string> = ["heads", "tails"];
            m.channel.send(`The coin landed on **${sides[Math.round(Math.random())]}**. :coin:`);
        } break;
        case "8ball":
        case "8b": {
            let magic: MagicBilliard = new MagicBilliard();
            if (msg.ContentWithoutPrefix)
                m.channel.send(magic.getResponse());
            else
                m.reply("please ask a question before relying on my cosmic powers. :sparkles:");
        } break;
        case "homework":
        case "hw": {
            m.reply(`you're doing your homework? How studious of you. In case you forgot, you can find that here: ${config.team_calendar}`);
        } break;
        case "contact":
        case "email": {
            if (!msg.Arguments[1]) {
                if (!profileCache[msg.Sender.ID] || profileCache[msg.Sender.ID].email === "") {
                    m.reply("it doesn't look like you have registered an e-mail with me. Did you mean to set one up with `userconfig email` instead?");
                } else {
                    sendEmbed(m, localTime, `email ${msg.Sender.ID}`);
                }
            }
            else {
                let userContact: any;
                if (msg.Arguments[1] === "staff" || msg.Arguments[1] === "support") {
                    sendEmbed(m, localTime, msg.Arguments[1]);
                }
                else if (userContact = msg.Sender.ResolveMention(bot, msg.Arguments[1])) {
                    if (!profileCache[userContact.id] || profileCache[userContact.id].email === "") {
                        m.reply("it doesn't look like this user has registered an e-mail with me.");
                    } else {
                        sendEmbed(m, localTime, `email ${userContact.id}`);
                    }
                }
            }
        } break;
        case "class": {
            let classLink: string = "";
            // Determine Class Link
            if (localTime.Today.IsWeekend === false)
            {
                if (localTime.Today.Name === "Thursday") {
                    classLink = config.zoom_pd;
                }
                else {
                    classLink = config.zoom_tech;
                }
    
                if (classEnded === false)
                    m.reply(`hurry up! You _don't_ want to be late. Join here: ${classLink}`);
                else
                    m.reply(`I'm glad that you want to join class, but that session ended already. The link was this today, though: ${classLink}`);
            }
            else {
                m.reply("hurry up! You _don't_ want to be la--wait, it's the weekend. We don't have class today, silly.");
            }
        } break;
        case "userconfig": {
            switch(msg.Arguments[1]) {
                case "email": {
                    if (!msg.Arguments[2]) {
                        m.reply("Please enter an e-mail to register. Did you mean to view a contact with `email` instead?");
                    }
                    else {
                        if (!profileCache[msg.Sender.ID]) {
                            //console.log("Member ID does not already exist. Adding them...");
                            profileCache[msg.Sender.ID] = {
                                username: msg.Sender.ServerNickname,
                                first_name: "",
                                last_name: "",
                                role: "None",
                                job: "",
                                email: `${msg.Arguments[2]}`,
                                likes: "",
                                dislikes: "",
                                quote: {
                                    body: "",
                                    author: ""
                                },
                                color: ""
                            };
                        }
                        else {
                            profileCache[msg.Sender.ID].email = `${msg.Arguments[2]}`;
                        }
                        fs.writeFileSync(userPath, JSON.stringify(profileCache, null, 4));
                        m.reply(`your email has been registered as \`${msg.Arguments[2]}\``);
                    }
                } break;
                case "profile": {
                    m.reply("this feature is still in development. Thank you for your interest. :slight_smile:");
                }
            }
        }
    }

    // Conversation
    let pingUser: any = msg.Sender.ResolveMention(bot, msg.Arguments[0]);
    if (pingUser === bot.user && !msg.Arguments[1]) {
        m.reply("mmm? Did you need something from me?");
    }
    else if (pingUser === bot.user && msg.ContentWithoutPrefix) {
        // Call and Response
    }
});
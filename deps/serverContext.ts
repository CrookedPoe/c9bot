import { DiscordAPIError } from "discord.js";

export interface IServer {
    Name: string;
    ID: string;
    Owner: User;
}

export interface IMessage {
    Content: string;
    ContentWithoutPrefix: string;
    Sender: User;
    Arguments: any;
}

export class Message implements IMessage {
    Content: string;
    ContentWithoutPrefix: string;
    Sender: User;
    Arguments: any;

    constructor(m: any) {
        this.Content = m.content;
        this.Arguments = m.content.split(' ');
        this.ContentWithoutPrefix = this.Content.replace(this.Arguments[0], "").trim();
        this.Sender = new User(m.member);
    }
}

export class User {
    ID: string;
    Username: string;
    Tag: string;
    ServerNickname: string;
    Roles: any;

    constructor(member: any) {
        if (!member) {
            console.log("This was a webhook, probably.");
        }
        this.ID = member.id;
        this.Username = member.user.username;
        this.Tag = member.user.tag;
        this.ServerNickname = member.nickname;
        this.Roles = member.roles.cache;
    }

    VerifyID(id: string) {
        if (this.ID === id) {
            return true;
        }
        return false;
    }

    VerifyRole(test: string) {
        if (this.Roles.some((role: any) => role.name === test)) {
            return true;
        }
        return false;
    }

    ResolveMention(bot: any, test: string) {
        if (test.startsWith("<@") && test.endsWith('>')) {
            test = test.slice(2, -1);

            if (test.startsWith('!')) {
                test = test.slice(1);
            }

            return bot.users.cache.get(test);
        }
    }
}
import { DiscordAPIError } from "discord.js";

export interface IServer {
    Name: string;
    ID: string;
    Owner: User;
}

export class User {
    ID: string;
    Username: string;
    Tag: number;
    ServerNickname: string;
    Roles: any;

    constructor(member: any) {
        if (member) { // is not null
            this.ID = member.id;
            this.Username = member.user.username;
            this.Tag = member.user.tag;
            this.ServerNickname = member.nickname;
            this.Roles = member.roles.cache;
        }
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
}
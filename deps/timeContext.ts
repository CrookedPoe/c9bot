export interface IDay {
    Name: string;
    Index: number;
    IsWeekend: boolean;
    Clock: Clock;
}

export interface IMonth {
    Name: string;
    Index: number;
}

export class Time {
    Year: number;
    Date: number;
    Month: Month;
    Today: Day;
    monthNames: Array<string> = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];
    dayNames: Array<string> = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
}

export class Clock extends Time {
    Hours: number;
    Minutes: number;
    Seconds: number;
    Time: string;

    constructor(h: number, m: number, s: number) {
        super();
        this.Hours = h;
        this.Minutes = m;
        this.Seconds = s;
        this.Time = this.ClockTime(this);
    };

    ClockTime(time: Clock) {
        return `${time.Hours.toLocaleString(`en-US`, {minimumIntegerDigits: 2, useGrouping: false})}:`+
        `${time.Minutes.toLocaleString(`en-US`, {minimumIntegerDigits: 2, useGrouping: false})}:` +
        `${time.Seconds.toLocaleString(`en-US`, {minimumIntegerDigits: 2, useGrouping: false})}`;
    };

    sClockTime(time: string) {
        let clockSplit = time.split(':');
        return new Clock(Number(clockSplit[0]), Number(clockSplit[1]), Number(clockSplit[2]));
    }   
}

export class Month implements IMonth {
    Name: string;
    Index: number;
}

export class Day implements IDay {
    Name: string;
    Index: number;
    IsWeekend: boolean;
    Clock: Clock;
}

export function updateTime(
    localTime: Time, ms: number, eventCallback: any) {
    setInterval(() => {
        let internalDate: Date = new Date();
        localTime.Year = internalDate.getFullYear();
        localTime.Month = new Month();
        localTime.Month.Name = localTime.monthNames[internalDate.getMonth()];
        localTime.Month.Index = internalDate.getMonth();
        localTime.Date = internalDate.getDate();
        localTime.Today = new Day();
        localTime.Today.Name = localTime.dayNames[internalDate.getDay()];
        localTime.Today.Index = internalDate.getDay();
        localTime.Today.Clock = new Clock(internalDate.getHours(), internalDate.getMinutes(), internalDate.getSeconds());

        if (localTime.Today.Name === "Saturday" || localTime.Today.Name === "Sunday")
            localTime.Today.IsWeekend = true;
        else
            localTime.Today.IsWeekend = false;

        eventCallback(localTime.Today);

    }, ms);
}
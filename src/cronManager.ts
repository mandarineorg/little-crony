import { CronJob, ExpressionErrors, CronStructure, Days, Months } from "./types.ts";
import { v4 } from "https://deno.land/std@0.84.0/uuid/mod.ts";

const NA = "N/A";
const VALID_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const VALID_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC", 
                        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const GLOBAL_SIGN = "*";                        
const GLOBAL_VAL = -1;
const LAST_DATE_RAN = "LAST_DATE_RAN";


const isNumber = (number: string | number) => {
    return !isNaN(number as any);
}

const isValidNumericArray = (number: string) => {
    if(number.includes("-") && number.split("-")[0] !== "") {
        const [fromValid, toValid] = <[boolean, boolean]> number.split("-").map((item) => isNumber(item));
        return (fromValid === true && toValid === true);
    }
    return false;
}

const isIncluded = (input: any, options: Array<any>): boolean =>  { 
    for(const data of options) { 
        if(input.toLowerCase() === data.toLowerCase()) { 
            return true; 
        } 
    } 
    return false; 
}

const verifyDayInExpression = (data: any, month: boolean = false): boolean => {
    if(!isNumber(data)) {

        if(data.includes("-")) {
            let [from, to] = data.split("-");
            return verifyDayInExpression(from, month) && verifyDayInExpression(to, month);
        }

        return data === GLOBAL_SIGN ? true : isIncluded(data, VALID_DAYS);
    } else {
        let day = Math.round(data);

        if(month === false) {
            return day >= 0 && day <= 6;
        } else {
            return day >= 1 && day <= 31;
        }
    }
}

const verifyMonthInExpression = (data: any): boolean => {
    if(!isNumber(data)) {

        if(data.includes("-")) {
            let [from, to] = data.split("-");
            return verifyMonthInExpression(from) && verifyMonthInExpression(to);
        }

        return data  === GLOBAL_SIGN ? true : isIncluded(data, VALID_MONTHS);
    } else {
        let day = Math.round(data);
        return day >= 1 && day <= 12;
    }
}

const processDaySignature = (day: string): number => {
    const dayInString = (<string>day).toLowerCase();
    switch(true) {
        case dayInString.startsWith("sun") || dayInString === Days.SUNDAY.toString():
            return Days.SUNDAY;
        case dayInString.startsWith("mon") || dayInString === Days.MONDAY.toString():
            return Days.MONDAY;
        case dayInString.startsWith("tue") || dayInString === Days.TUESDAY.toString():
            return Days.TUESDAY;
        case dayInString.startsWith("wed") || dayInString === Days.WEDNESDAY.toString():
            return Days.WEDNESDAY;
        case dayInString.startsWith("thu") || dayInString === Days.THURSDAY.toString():
            return Days.THURSDAY;
        case dayInString.startsWith("fri") || dayInString === Days.FRIDAY.toString():
            return Days.FRIDAY;
        case dayInString.startsWith("sat") || dayInString === Days.SATURDAY.toString():
            return Days.SATURDAY;
        default:
            throw new Error(`Unknown CRON Day ${day}`);
    }
}

const processMonthSignature = (month: string): number => {
    const monthInString = (<string>month).toLowerCase();
    switch(true) {
        case monthInString.startsWith("jan") || monthInString === Months.JANUARY.toString():
            return Months.JANUARY;
        case monthInString.startsWith("feb") || monthInString === Months.FEBRUARY.toString():
            return Months.FEBRUARY;
        case monthInString.startsWith("mar") || monthInString === Months.MARCH.toString():
            return Months.MARCH;
        case monthInString.startsWith("apr") || monthInString === Months.APRIL.toString():
            return Months.APRIL;
        case monthInString.startsWith("may") || monthInString === Months.MAY.toString():
            return Months.MAY;
        case monthInString.startsWith("jun") || monthInString === Months.JUNE.toString():
            return Months.JUNE;
        case monthInString.startsWith("jul") || monthInString === Months.JULY.toString():
            return Months.JULY;
        case monthInString.startsWith("aug") || monthInString === Months.AUGUST.toString():
            return Months.AUGUST;  
        case monthInString.startsWith("sep") || monthInString === Months.SEPTEMBER.toString():
            return Months.SEPTEMBER;  
        case monthInString.startsWith("oct") || monthInString === Months.OCTOBER.toString():
            return Months.OCTOBER;
        case monthInString.startsWith("nov") || monthInString === Months.NOVEMBER.toString():
            return Months.NOVEMBER;
        case monthInString.startsWith("dec") || monthInString === Months.DECEMBER.toString():
            return Months.DECEMBER;
        default:
            throw new Error("Unknown CRON Month");
    }
}

const processDay = (day: any): number | [number, number] => {
    if(isNumber(day)) {
        return Math.round(day);
    } else if(day === GLOBAL_SIGN) {
        return GLOBAL_VAL;
    } else if(typeof day === 'string' && day.includes("-")) {
        return <[number, number]> day.split("-").map((item) => processDaySignature(item));
    } else {
        return processDaySignature(day);
    }
}

const processMonth = (month: any): number | [number, number] => {
    if(isNumber(month)) {
        return Math.round(month);
    } else if(month === GLOBAL_SIGN) {
        return GLOBAL_VAL;
    } else if(typeof month === 'string' && month.includes("-")) {
        return <[number, number]> month.split("-").map((item) => processMonthSignature(item));
    } else {
        return processMonthSignature(month);
    }
}

const round = (data: any) => {
    if(data === GLOBAL_SIGN) return GLOBAL_VAL;
    if(data === NA) return undefined;
    if(typeof data === 'string' && isValidRange(data)) return <[number, number]> data.split("-").map((item) => Math.round(item as any));
    return Math.round(data);
}

const isValidRange = (rangeData: string) => {
    if(rangeData.includes("-")) {
        let spliter = rangeData.split("-");
        return spliter[0] !== "";
    } else {
        return false;
    }
}

const convertTZ = (date: Date, tzString: string): Date => {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}

const isInRange = (input: number, range: [number, number]): boolean => {
    for(let i = range[0]; i<=range[1]; i++) { 
        if(input === i) return true;
    }
    return false;
}

const verifyExpressionProperty = (inputValue: number, property: number | [number, number]): boolean => {
    if(property === GLOBAL_VAL) return true;
    if(inputValue === property) return true;
    if(Array.isArray(property) && property.length === 2) {
        return isInRange(inputValue, property);
    }
    return false;
}

const verifyProperties = (type: "seconds" | "minutes" | "hours" | "monthDay", data: any): ValidationResult | undefined => {
    let verifier: Function;
    let error: ExpressionErrors;

    switch(type) {
        case "seconds":
            verifier = verifySecondsOrMinutes;
            error = ExpressionErrors.SECONDS_TOO_MUCH_TOO_LESS;
        break;
        case "minutes":
            verifier = verifySecondsOrMinutes;
            error = ExpressionErrors.MINUTES_TOO_MUCH_TOO_LESS;
        break;
        case "hours":
            verifier = verifyHour;
            error = ExpressionErrors.HOURS_TOO_MUCH_TOO_LESS;
        break;
        case "monthDay":
            verifier = (item: any) => verifyDayInExpression(item, true);
            error = ExpressionErrors.MONTHDAY_TOO_MUCH_TOO_LESS;
        break;
    }

    if(isValidRange(data)) {
        const invalidItem = (data as string).split("-").map((item) => Math.round(item as any)).map((item) => verifier(item)).filter((item) => item === false);
        if(!invalidItem) return [false, undefined, error];
    } else {
        if(!verifier(Math.round(data))) return [false, undefined, error];
    }
}

const verifySecondsOrMinutes = (data: number) => { return !(data > 60 || data < 0); }
const verifyHour = (hour: number) => { return !(hour > 23 || hour < 0); }

type ValidationResult = [boolean, CronStructure | undefined, ExpressionErrors | undefined];

export class CronManager {

    private tasks: Array<CronJob> = new Array<CronJob>();
    public interval: any;

    public static validate(expression: string): ValidationResult {
        let splitExpression = expression.split(" ");
        const expressionParamCount = splitExpression.length;
        
        if (expressionParamCount < 5 || expressionParamCount > 7) return [false, undefined, ExpressionErrors.INVALID_ARGUMENT_AMOUNT]

        if(expressionParamCount == 5) splitExpression = [NA, ...splitExpression, "*"];
        if(expressionParamCount == 6) splitExpression = [...splitExpression, "*"];
        
        let [seconds, minutes, hour, monthDay, month, weekDay, year]: [...any] = splitExpression;

        if((seconds !== NA && seconds !== GLOBAL_SIGN)) {
            if(!isNumber(seconds) && !isValidNumericArray(seconds)) return [false, undefined, ExpressionErrors.SECONDS_NOT_VALID];
        }
        if(minutes !== "*" && !isNumber(minutes) && !isValidNumericArray(minutes)) return [false, undefined, ExpressionErrors.MINUTES_NOT_VALID];
        if(hour !== "*" && !isNumber(hour) && !isValidNumericArray(hour)) return [false, undefined, ExpressionErrors.HOURS_NOT_VALID];
        if(monthDay !== "*" && !isNumber(monthDay) && !isValidNumericArray(monthDay)) return [false, undefined, ExpressionErrors.MONTH_DAY_NOT_VALID];
        if(year !== "*" && !isNumber(year) && !isValidNumericArray(year)) return [false, undefined, ExpressionErrors.YEAR_NOT_VALID];

        // To number
        if(seconds !== NA && seconds !== GLOBAL_SIGN) {
            const validation = verifyProperties("seconds", seconds);
            if(validation !== undefined) return validation;
        }
        seconds = round(seconds);

        // To number
        if(minutes !== GLOBAL_SIGN) {
            const validation = verifyProperties("minutes", minutes);
            if(validation !== undefined) return validation;
        }
        minutes = round(minutes);

        // To number
        if(hour !== GLOBAL_SIGN) {
            const validation = verifyProperties("hours", hour);
            if(validation !== undefined) return validation;
        }
        hour = round(hour);

        // To number
        if(monthDay !== GLOBAL_SIGN) {
            const validation = verifyProperties("monthDay", monthDay);
            if(validation !== undefined) return validation;
        }
        monthDay = round(monthDay);

        // To number
        year = round(year);

        if(!verifyMonthInExpression(month)) return [false, undefined, ExpressionErrors.MONTH_NOT_VALID];
        if(!verifyDayInExpression(weekDay)) return [false, undefined, ExpressionErrors.DAY_NOT_VALID];

        // ------------------------------------------------------------------ //

        month = processMonth(month);
        weekDay = processDay(weekDay);

        // ------------------------------------------------------------------ //

        const cronStructure = {
            seconds: (seconds !== "N/A") ? seconds : undefined,
            min: minutes,
            hour: hour,
            monthDay: monthDay,
            month: month,
            weekDay: weekDay,
            year: year
        };

        return [true, cronStructure, undefined];
    }

    public static isMatch(job: CronJob, options?: { timeZone?: string, date?: Date }): boolean {
        const expression = job.structure;
        const date = (options?.date) ? options.date : new Date();
        const currentDate: Date = (options?.timeZone) ? convertTZ(date, options?.timeZone) : date;
        
        const [seconds, minutes, hour, monthDay, month, weekDay, year] = [
            currentDate.getSeconds(), 
            currentDate.getMinutes(), 
            currentDate.getHours(), 
            currentDate.getDate(),
            currentDate.getMonth() + 1, // Month start from 0, but we want to take January as 1
            currentDate.getDay(),
            currentDate.getFullYear()
        ];

        // For this cron to run, all the matches need to be true
        const matches: Array<boolean> = [];

        // Verify seconds
        if(expression.seconds === -1 || expression.seconds !== undefined) {
            matches.push(verifyExpressionProperty(seconds, expression.seconds));
        }

        // Verify Minutes
        const verifyMinutes = verifyExpressionProperty(minutes, expression.min);
        if(verifyMinutes && expression.seconds === undefined) {
            if(!job.internalData[LAST_DATE_RAN]) {
                matches.push(true);
            } else {
                // This handles the expression for `every minute`
                const [lastRanDate, currentDate]: Array<Date> = [job.internalData[LAST_DATE_RAN], new Date()];
                matches.push(currentDate.getMinutes() === (lastRanDate.getMinutes() + 1));
            }
        } else {
            // Every second during `X` minute
            matches.push(verifyMinutes);
        }

        // Verify Hours
        matches.push(verifyExpressionProperty(hour, expression.hour));    

        // Verify Month day
        matches.push(verifyExpressionProperty(monthDay, expression.monthDay));  
        
        // Verify Month 
        matches.push(verifyExpressionProperty(month, expression.month));

        // Verify Week Day 
        matches.push(verifyExpressionProperty(weekDay, expression.weekDay));

        // Verify Year
        matches.push(verifyExpressionProperty(year, expression.year));

        return !(matches.includes(false));

    }

    public create(expression: string, handler: () => void, timeZone: string | undefined = undefined): void {
        const [isValid, structure, error] = CronManager.validate(expression);

        if(error !== undefined && isValid === false || structure === undefined) throw new Error(error);

        this.tasks.push({
            id: v4.generate(),
            expression,
            timeZone,
            structure,
            internalData: {},
            handler
        });

    }

    public clearTasks(): void {
        this.tasks = [];
    }

    public beginTasks(): void {
        this.interval = setInterval(() => {
            this.tasks.filter((task: CronJob) => CronManager.isMatch(task, { timeZone: task.timeZone })).forEach(async (job: CronJob) => {
                job.handler();
                job.internalData[LAST_DATE_RAN] = new Date();
            });
        }, 1000);
    }

    public stopTasks(): void {
        clearInterval(this.interval);
        this.interval = undefined;
    }

}
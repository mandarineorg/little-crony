export enum ExpressionErrors {
    INVALID_ARGUMENT_AMOUNT = "Expression requires a minimum of 5 parameters and a maximum of 7 parameters (if seconds are being used)",
    SECONDS_NOT_VALID = "The property for seconds is not a valid numeric value in the expression.",
    MINUTES_NOT_VALID = "The property for minutes is not a valid numeric value in the expression.",
    HOURS_NOT_VALID = "The property for hours is not a valid numeric value in the expression.",
    YEAR_NOT_VALID = "The property for year is not a valid numeric value in the expression.",
    MONTH_DAY_NOT_VALID = "The property for month day is not a valid numeric value or day representation.",
    DAY_NOT_VALID = "The property for day is not a valid numeric value or day representation.",
    MONTH_NOT_VALID = "The property for month is not a valid numeric value or month representation",


    SECONDS_TOO_MUCH_TOO_LESS = "The amount of seconds for the expression is either greater than 60 or less than 0.",
    MINUTES_TOO_MUCH_TOO_LESS = "The amount of minutes for the expression is either greater than 60 or less than 0.",
    HOURS_TOO_MUCH_TOO_LESS = "The amount of hours for the expression is either greater than 23 or less than 0",
    MONTHDAY_TOO_MUCH_TOO_LESS = "The property for day of month is either greater than 31 or less than 1",
}

export enum Days {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6
}

export enum Months {
    JANUARY = 1,
    FEBRUARY = 2,
    MARCH = 3,
    APRIL = 4,
    MAY = 5,
    JUNE = 6,
    JULY = 7,
    AUGUST = 8,
    SEPTEMBER = 9,
    OCTOBER = 10,
    NOVEMBER = 11,
    DECEMBER = 12
}

export interface CronStructure {
    seconds: number | undefined | [number, number];
    min: number | [number, number];
    hour: number | [number, number];
    monthDay: number | [number, number];
    month: number | [number, number];
    weekDay: number | [number, number];
    year: number | [number, number];
}

export interface CronJob {
    id: string;
    expression: string;
    timeZone: string | undefined;
    structure: CronStructure;
    handler: () => void;
    internalData: {
        [prop: string]: any
    };
}


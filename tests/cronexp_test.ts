import { CronManager } from "../src/cronManager.ts"
import * as DenoAsserts from "https://deno.land/std@0.84.0/testing/asserts.ts";
import { CronJob, CronStructure, ExpressionErrors } from "../src/types.ts";


Deno.test({
    name: "Validate scenarios of Cron expressions",
    fn: () => {
        let [valid, structure, error]: [...any] = CronManager.validate("* * * * * * *");
        DenoAsserts.assertEquals<CronStructure>(structure, {
            seconds: -1,
            min: -1,
            hour: -1,
            monthDay: -1,
            month: -1,
            weekDay: -1,
            year: -1
        });

        [valid, structure] = CronManager.validate("* * * * * *");
        DenoAsserts.assertEquals<CronStructure>(structure, {
            seconds: -1,
            min: -1,
            hour: -1,
            monthDay: -1,
            month: -1,
            weekDay: -1,
            year: -1
        });

        [valid, structure] = CronManager.validate("* * * * *");
        DenoAsserts.assertEquals<CronStructure>(structure, {
            seconds: undefined,
            min: -1,
            hour: -1,
            monthDay: -1,
            month: -1,
            weekDay: -1,
            year: -1
        });

        [valid, structure, error] = CronManager.validate("* 1 2 3 4 5 2001");
        DenoAsserts.assertEquals<CronStructure>(structure, {
            seconds: -1,
            min: 1,
            hour: 2,
            monthDay: 3,
            month: 4,
            weekDay: 5,
            year: 2001
        });


        [valid, structure, error] = CronManager.validate("* 1 2 3 4 5 2001");
        DenoAsserts.assertEquals<CronStructure>(structure, {
            seconds: -1,
            min: 1,
            hour: 2,
            monthDay: 3,
            month: 4,
            weekDay: 5,
            year: 2001
        });

        [,,error] = CronManager.validate("61 * * * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.SECONDS_TOO_MUCH_TOO_LESS);

        [,,error] = CronManager.validate("* 61 * * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.MINUTES_TOO_MUCH_TOO_LESS);

        [,,error] = CronManager.validate("-1 * * * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.SECONDS_TOO_MUCH_TOO_LESS);

        [,,error] = CronManager.validate("* -1 * * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.MINUTES_TOO_MUCH_TOO_LESS);

        [,,error] = CronManager.validate("* * 24 * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.HOURS_TOO_MUCH_TOO_LESS);

        [,,error] = CronManager.validate("* * -1 * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.HOURS_TOO_MUCH_TOO_LESS);
        
        [,,error] = CronManager.validate("A * * * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.SECONDS_NOT_VALID);

        [,,error] = CronManager.validate("* A * * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.MINUTES_NOT_VALID);

        [,,error] = CronManager.validate("* * A * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.HOURS_NOT_VALID);

        [,,error] = CronManager.validate("* * * * * * A");
        DenoAsserts.assertEquals(error, ExpressionErrors.YEAR_NOT_VALID);

        [,,error] = CronManager.validate("* * * * * * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.INVALID_ARGUMENT_AMOUNT);

        [,,error] = CronManager.validate("* * * 32 * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.MONTHDAY_TOO_MUCH_TOO_LESS);

        [,,error] = CronManager.validate("* * * 0 * * *");
        DenoAsserts.assertEquals(error, ExpressionErrors.MONTHDAY_TOO_MUCH_TOO_LESS);

        [,,error] = CronManager.validate("* * * 1-31 * * *");
        DenoAsserts.assertEquals(error, undefined);

        [valid, structure, error] = CronManager.validate("* * * 17 JUL WED *");
        console.log(error);
        DenoAsserts.assertEquals<CronStructure>(structure, {
            seconds: -1,
            min: -1,
            hour: -1,
            monthDay: 17,
            month: 7,
            weekDay: 3,
            year: -1
        });

        [valid, structure, error] = CronManager.validate("30-60 1-25 12-23 17-31 JUL-DEC WED-SUN 2001-2012");
        DenoAsserts.assertEquals<CronStructure>(structure, {
            seconds: [30, 60],
            min: [1, 25],
            hour: [12, 23],
            monthDay: [17, 31],
            month: [7, 12],
            weekDay: [3, 0],
            year: [2001, 2012]
        });
    }
});

const createCronJobFromStructure = (structure: CronStructure): CronJob => {
    return {
        id: "-",
        structure: structure,
        expression: "-",
        timeZone: undefined,
        handler: () => {},
        internalData: {}
    }
}
Deno.test({
    name: "Test date against expression",
    fn: () => {
        // HOUR: 10 UTC / ES
        const testingDate = new Date("2021-02-17T15:15:49.292Z");

        let [valid, structure, error]: [...any] = CronManager.validate("* * * * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure), true);

        [valid, structure, error] = CronManager.validate("* * * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure), true);

        [valid, structure, error] = CronManager.validate("* * 17 * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* * 17-21 * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* * 16-18 * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* * 19-21 * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* * 21 * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* * * * 3");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* * * * 4");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* * * * 2-4");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* * * * 4-0");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* * * * 0-6");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* * * 4-12 *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* * * 3-12 *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* * * 4 *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* * * 1-12 *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* * * 2-5 *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* * * 2 *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* 12-16 * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* 12-19 * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* 17-19 * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* 0-9 * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("* 0-24 * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("* 10 * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("16-30 * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("0-14 * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("15 * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("15-60 * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("50-60 * * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("0-48 * * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);

        [valid, structure, error] = CronManager.validate("40-55 * * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("49 * * * * *");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("49 * * * * * 2021");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("49 15 * * * * 2021");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("49 15 10 * * * 2021");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("49 15 10 17 * * 2021");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("49 15 10 17 2 * 2021");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("49 15 10 17 2 3 2021");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), true);

        [valid, structure, error] = CronManager.validate("49 15 10 17 2 4 2021");
        structure = createCronJobFromStructure(structure);
        DenoAsserts.assertEquals(CronManager.isMatch(structure, { date: testingDate }), false);
    }
});


import { CronManager } from "../src/cronManager.ts"
import * as DenoAsserts from "https://deno.land/std@0.84.0/testing/asserts.ts";

export interface ResolvableMethods<T> {
    resolve: (value?: T | PromiseLike<T> | undefined) => void;
    // deno-lint-ignore no-explicit-any
    reject: (reason?: any) => void;
  }
  
export type Resolvable<T> = Promise<T> & ResolvableMethods<T>;
  
export function createResolvable<T>(): Resolvable<T> {
    let methods: ResolvableMethods<T>;
    const promise = new Promise<T>((resolve: any, reject: any): void => {
      methods = { resolve, reject };
    });
    // TypeScript doesn't know that the Promise callback occurs synchronously
    // therefore use of not null assertion (`!`)
    return Object.assign(promise, methods!) as Resolvable<T>;
}

Deno.test({
    name: "CRON `* * * * * * *` Every second",
    fn: async () => {
        let manager = new CronManager();

        let dates: Array<Date> = [];

        manager.create("* * * * * * *", () => {
            dates.push(new Date());
        });

        manager.beginTasks();
        let resolvable = createResolvable();;
        let interval = setTimeout(() => {
            if(dates.length >= 5 && dates.length <= 6) {
                manager.stopTasks();
                resolvable.resolve();
                clearInterval(interval);
            } else {
                resolvable.reject("The operation was executed invalidly");
            }
        }, 6000);
        await resolvable;

        DenoAsserts.assert(dates[1].getSeconds() >= (dates[0].getSeconds() + 1));
    }
});

Deno.test({
    name: "CRON `* * * * *` Every minute",
    fn: async () => {
        let manager = new CronManager();

        let dates: Array<Date> = [];

        manager.create("* * * * *", () => {
            dates.push(new Date());
        });

        manager.beginTasks();
        let resolvable = createResolvable();;
        let interval = setTimeout(() => {
            if(dates.length >= 1 && dates.length <= 2) {
                manager.stopTasks();
                resolvable.resolve();
                clearInterval(interval);
            } else {
                resolvable.reject("The operation was executed invalidly");
            }
        }, 60000);
        await resolvable;

        DenoAsserts.assert(dates[1].getMinutes() >= (dates[0].getMinutes() + 1));
    }
});


Deno.test({
    name: "CRON `* * * * *` Every X minute of any hour",
    fn: async () => {
        const currentDate = new Date();
        const currentMin = currentDate.getMinutes();
        const futureMin = currentMin + 1;

        let manager = new CronManager();

        let dates: Array<Date> = [];
        manager.create(`${futureMin} * * * *`, () => {
            dates.push(new Date());
        });

        manager.beginTasks();
        let resolvable = createResolvable();;
        let interval = setTimeout(() => {
            if(dates.length === 1) {
                manager.stopTasks();
                resolvable.resolve();
                clearInterval(interval);
            } else {
                resolvable.reject("The operation was executed invalidly");
            }
        }, 60000 * 2);
        await resolvable;
        DenoAsserts.assert(dates[0].getMinutes() === futureMin);
    }
});

Deno.test({
    name: "CRON `* * * * *` At X second of X minute of any hour",
    fn: async () => {
        const currentDate = new Date();
        const currentMin = currentDate.getMinutes();
        const futureMin = currentMin + 1;

        let manager = new CronManager();

        let dates: Array<Date> = [];
        manager.create(`30 ${futureMin} * * * *`, () => {
            dates.push(new Date());
        });

        manager.beginTasks();
        let resolvable = createResolvable();;
        let interval = setTimeout(() => {
            if(dates.length === 1) {
                manager.stopTasks();
                resolvable.resolve();
                clearInterval(interval);
            } else {
                resolvable.reject("The operation was executed invalidly");
            }
        }, 60000 * 2);
        await resolvable;
        DenoAsserts.assert(dates[0].getSeconds() === 30);
    }
});

Deno.test({
    name: `CRON "* X * * * *" Every second of X minutes`,
    fn: async () => {
        const currentDate = new Date();
        const currentMin = currentDate.getMinutes();
        const futureMin = currentMin + 1;

        let manager = new CronManager();

        let dates: Array<Date> = [];

        manager.create(`* ${futureMin} * * * *`, () => {
            dates.push(new Date());
        });

        manager.beginTasks();
        let resolvable = createResolvable();;
        let interval = setTimeout(() => {
            if(dates.length > 59 && dates.length <= 61) {
                manager.stopTasks();
                resolvable.resolve();
                clearInterval(interval);
            } else {
                resolvable.reject("The operation was executed invalidly");
            }
        }, (60000 * 2.5));
        await resolvable;
        DenoAsserts.assert(dates[0].getSeconds() === 0);
        DenoAsserts.assert(dates[dates.length - 1].getSeconds() === 59);
    }
});

Deno.test({
    name: `CRON "15 * * * * *" On Second 15 of X minutes`,
    fn: async () => {
        const currentDate = new Date();
        const currentMin = currentDate.getMinutes();
        const futureMin = currentMin + 1;

        let manager = new CronManager();

        let dates: Array<Date> = [];

        manager.create(`15 ${futureMin} * * * *`, () => {
            dates.push(new Date());
        });

        manager.beginTasks();
        let resolvable = createResolvable();;
        let interval = setTimeout(() => {
            if(dates.length === 1) {
                manager.stopTasks();
                resolvable.resolve();
                clearInterval(interval);
            } else {
                resolvable.reject("The operation was executed invalidly");
            }
        }, (60000 * 2.5));
        await resolvable;
        DenoAsserts.assert(dates[0].getSeconds() === 15);
    }
});

Deno.test({
    name: `CRON "* * * * * *" On a false future month day`,
    fn: async () => {
        const currentDate = new Date();
        const currentMonthDay = currentDate.getDate();
        const futureMonthDay = currentMonthDay + 1;

        let manager = new CronManager();

        let dates: Array<Date> = [];

        manager.create(`* * * ${futureMonthDay} * *`, () => {
            dates.push(new Date());
        });

        manager.beginTasks();
        let resolvable = createResolvable();;
        let interval = setTimeout(() => {
            if(dates.length === 0) {
                manager.stopTasks();
                resolvable.resolve();
                clearInterval(interval);
            } else {
                resolvable.reject("The operation was executed invalidly");
            }
        }, (60000 * 2.5));
        await resolvable;
    }
});

Deno.test({
    name: `CRON "* * * * * *" On a false future month`,
    fn: async () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const futureMonth = currentMonth + 2;

        let manager = new CronManager();

        let dates: Array<Date> = [];

        manager.create(`* * * * ${futureMonth} *`, () => {
            dates.push(new Date());
        });

        manager.beginTasks();
        let resolvable = createResolvable();;
        let interval = setTimeout(() => {
            if(dates.length === 0) {
                manager.stopTasks();
                resolvable.resolve();
                clearInterval(interval);
            } else {
                resolvable.reject("The operation was executed invalidly");
            }
        }, (60000 * 2.5));
        await resolvable;
    }
});
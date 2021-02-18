# Leaf
[![Little Crony CI](https://github.com/mandarineorg/little-crony/workflows/Unit%20Tests/badge.svg)](https://github.com/mandarineorg/little-crony)

<img src="https://www.mandarinets.org/assets/images/full-logo-simple.svg" width="180" height="180" />

A Cron manager system for [Deno](https://deno.land) binaries by [Mandarine](https://deno.land/x/mandarinets).

------------

## Description
Little Crony is a [CRON jobs](https://en.wikipedia.org/wiki/Cron) manager which allows you to create and run tasks based on CRON expressions.

## Supported Expresions
Little Crony supports 3 different lengths in the expression:  

** 5 Parameters: ** (Minute, Hour, Day of The Month, Month, Day of The Week)
```
* * * * *
```

** 6 Parameters: ** (Seconds, Minute, Hour, Day of The Month, Month, Day of The Week)
```
* * * * * *
```

** 7 Parameters: ** (Seconds, Minute, Hour, Day of The Month, Month, Day of The Week, Year)
```
* * * * * * *
```

## Format
- Seonds: From 0 to 59
- Minute: From 0 to 59
- Hour: From 0 to 23
- Day of The Month: From 1 to 31
- Month: From 1 to 12 (Abbreviatons and Names accepted)
- Day of The Week: From 0 (Sunday) to 6 (Abbreviatons and Names accepted)
- Year: Any numeric value.

## Usage

```typescript
import { CronManager } from "https://deno.land/x/little_crony@v1.0.0/mod.ts"

const cronManager = new CronManager();
// cronManager.create(expression: string, handler: () => void, timeZone?: string)
cronManager.create("* * * * * * *", () => console.log("Runs every second"));

// Begin Task Scheduler
cronManager.beginTasks();

// Stops Scheduler and clears internal interval
cronManager.stopTasks();

// Deletes all the tasks registered
cronManager.clearTasks();
```

---------------

## Questions
For questions & community support, please visit our [Discord Channel](https://discord.gg/qs72byB) or join us on our [twitter](https://twitter.com/mandarinets).

## Want to help?
### Interested in coding
In order to submit improvements to the code, open a PR and wait for it to review. We appreciate you doing this.
### Not interested in coding
We would love to have you in our community, [please submit an issue](https://github.com/mandarineorg/little-crony/issues) to provide information about a bug, feature, or improvement you would like.

## Follow us wherever we are going
- Author : [Andres Pirela](https://twitter.com/andreestech)
- Website : https://www.mandarinets.org/
- Twitter : [@mandarinets](https://twitter.com/mandarinets)
- Discord : [Click here](https://discord.gg/qs72byB)
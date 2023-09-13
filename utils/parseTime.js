
const parseTime = (time) => {
    const date = (time instanceof Date) ? time : new Date(time)
    const formatter = new Intl.RelativeTimeFormat('en')
    const ranges = {
        years: 3600 * 24 * 365,
        months: 3600 * 24 * 30,
        weeks: 3600 * 24 * 7,
        days: 3600 * 24,
        hours: 3600,
        minutes: 60,
        seconds: 1
    }
    const secondsTillNow = (Date.now() - date.getTime()) / 1000
    for (let key in ranges) {
        if (ranges[key] < secondsTillNow) {
            const delta = secondsTillNow / ranges[key]
            const parsed = formatter.format(Math.round(delta), key)
            return parsed.slice(3) + " ago"
        }
    }
    return "Now"
}

module.exports = parseTime
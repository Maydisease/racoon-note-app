export const friendlyDate = (timestamp: number): string => {

    const currentTimestamp = new Date().getTime();
    const leftTimestamp    = currentTimestamp - timestamp;
    const minute           = Math.ceil(leftTimestamp / 60000);
    const hour             = parseInt(leftTimestamp / 3600000  as any, 10);
    const day              = parseInt(leftTimestamp / 86400000  as any, 10);
    const week             = parseInt(leftTimestamp / 604800000  as any, 10);
    const month            = parseInt(day / 30  as any, 10);
    const year             = parseInt(leftTimestamp / 31536000000  as any, 10);

    let res: string = '';

    if (minute > 0) {
        res = minute + 'm';
    }

    if (hour > 0) {
        res = hour + 'h';
    }

    if (day > 0) {
        res = day + 'd';
    }

    if (week > 0) {
        res = week + 'w';
    }

    if (month > 0) {
        res = month + 'M';
    }

    if (year > 0) {
        res = year + 'y';
    }

    return res;
};
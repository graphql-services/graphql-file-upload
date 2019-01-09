import { ENV } from './env';

export const log = (...values) => {
    const [message, ...rest] = values;
    global.console.log(message, rest);
};

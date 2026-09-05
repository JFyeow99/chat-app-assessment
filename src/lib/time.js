import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s',
    s: 'now',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy',
  },
});

const WEEK_DAYS = 7;

export function formatRelativeTime(iso) {
  const then = dayjs(iso);
  if (dayjs().diff(then, 'day') >= WEEK_DAYS) return then.format('MMM DD, YYYY');
  return then.fromNow(true); // true = no "ago"/"in" wrapping, just the unit
}

export function formatDateTime({ iso, pattern = 'YYYY-MM-DD' }) {
  return dayjs(iso).format(pattern);
}

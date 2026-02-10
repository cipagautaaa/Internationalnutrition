const addDays = (baseDate, daysToAdd) => {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + daysToAdd);
  return next;
};

const formatShortDate = (date, locale) => {
  const month = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(date);
  const cleanMonth = month.replace('.', '');
  const monthCap = cleanMonth.charAt(0).toUpperCase() + cleanMonth.slice(1);
  return `${monthCap} ${day}`;
};

export const getDeliveryRangeLabel = ({
  locale = 'es-CO',
  startOffsetDays = 2,
  endOffsetDays = 3
} = {}) => {
  const now = new Date();
  const startDate = addDays(now, startOffsetDays);
  const endDate = addDays(now, endOffsetDays);
  return `${formatShortDate(startDate, locale)} - ${formatShortDate(endDate, locale)}`;
};

import { DateTime } from "luxon";

export const setDateTime = (timestamp: string | number | Date) => {
  let dateTime: DateTime;
  if (typeof timestamp == "number") {
    dateTime = DateTime.fromMillis(timestamp);
  } else if (typeof timestamp == "string") {
    dateTime = DateTime.fromISO(timestamp);
  } else {
    dateTime = DateTime.fromJSDate(timestamp);
  }
  return dateTime.setLocale("sl-SI");
};

// Format a number into a string with decimal places
export const formatNumbers = (unformattedNumber: number) => {
  if (isNaN(unformattedNumber)) return 0;
  else if (unformattedNumber == Infinity) return unformattedNumber.toFixed(2);
  else return +unformattedNumber.toFixed(2);
};

// Generate a random number between both numbers.
export const rollADie = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
};

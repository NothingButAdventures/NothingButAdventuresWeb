const value = "2026-05-19";
const durationDays = "5";
const days = parseInt(durationDays, 10);
const start = new Date(value);
start.setDate(start.getDate() + (days - 1));
console.log(start.toISOString().split("T")[0]);

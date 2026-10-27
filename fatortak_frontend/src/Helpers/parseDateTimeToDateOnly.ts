export function parseLocalDate(dateString: string) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${year}-${month}-${day}`; // safe for <input type="date">
}

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);

  // Check if the date is invalid
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Or return a default value like an empty string
  }

  return date.toISOString().split('T')[0];
};

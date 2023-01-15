export const calculatePages = (total, limit) => {
  const displayPage = Math.floor(total / limit);
  return total % limit ? displayPage + 1 : displayPage;
};

export const generateRandomAlphabets = (length) => {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const calculatePages = (total, limit) => {
  const displayPage = Math.floor(total / limit);
  return total % limit ? displayPage + 1 : displayPage;
};

import 'dotenv/config';

export const userOneProfile = {
  first_name: 'Victory',
  middle_name: 'Rashidat',
  last_name: 'Babatunde',
  email: 'victory@enyata.com',
  date_of_birth: '1984-12-13',
  gender: 'female'
};

export const userTwoProfile = {
  first_name: 'Adeleye',
  middle_name: 'Popmping',
  last_name: 'Blaise',
  email: 'adeleye@enyata.com',
  date_of_birth: '1997-10-03',
  gender: 'male'
};

export const userThreeProfile = {
  first_name: 'Elizabeth',
  middle_name: '',
  last_name: 'Agboka',
  email: 'eli@enyata.com',
  date_of_birth: '1954-08-08',
  gender: 'female'
};

export const userThreeInvalidDateProfile = {
  first_name: 'Elizabeth',
  middle_name: 'Kuye',
  last_name: 'Agboka',
  email: 'eli@enyata.com',
  date_of_birth: '18-08-1954',
  gender: 'female'
};

export const userThreeInvalidEmailProfile = {
  first_name: 'Elizabeth',
  middle_name: '',
  last_name: 'Agboka',
  email: 'victoryenyata.com',
  date_of_birth: '1954-08-08',
  gender: 'female'
};

export const userThreeExistingEmailProfile = {
  first_name: 'Elizabeth',
  middle_name: '',
  last_name: 'Agboka',
  email: 'victory@enyata.com',
  date_of_birth: '1954-09-29',
  gender: 'female'
};
  


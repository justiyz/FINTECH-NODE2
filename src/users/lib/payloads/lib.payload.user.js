export default {
  imgVerification: (user, body) => [ 
    user.user_id, 
    body.id_type.toLowerCase(),
    body.card_number,
    body.image_url,
    body.verification_url,
    body.issued_date || null,
    body.expiry_date || null
  ]
};
  

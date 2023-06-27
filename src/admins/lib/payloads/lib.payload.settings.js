import dayjs from 'dayjs';

export default {
  createPromo: (body, document, admin) => [
    body.name.trim().toLowerCase(),
    body.description,
    body.start_date + 'T00:00:00.00Z',
    body.end_date + 'T00:00:00.00Z',
    document?.document_url,
    body.status = (dayjs(body.start_date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')) ? 'active' : 'inactive',
    body.percentage_discount,
    body.customer_segment,
    body.tier_category,
    admin.admin_id
  ],

  editPromo: (body, document, promo, promo_id) => [
    promo_id,
    body.name || promo.name,
    body.description || promo.description,
    body.start_date ? body.start_date + 'T00:00:00.00Z' : null || promo.start_date,
    body.end_date ? body.end_date + 'T00:00:00.00Z' : null || promo.end_date,
    document?.document_url || promo.image_url,
    body.percentage_discount || promo.percentage_discount,
    body.customer_segment || promo.customer_segment,
    body.tier_category || promo.tier_category
  ]
};

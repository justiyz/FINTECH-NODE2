/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS loan_calculation_periods
(
    id SERIAL PRIMARY KEY,
    period INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO loan_calculation_periods
    (period) 
VALUES
    (12),
    (24),
    (36);


CREATE INDEX loan_calculation_periods_id_index ON loan_calculation_periods(id);
CREATE INDEX loan_calculation_periods_period_index ON loan_calculation_periods(period) ;

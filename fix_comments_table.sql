-- Drop foreign key constraints
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk8omq0tc18jd43bu5tjh6jvraq;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fkn2na60ukhs76ibtpt9burkm27;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fkh4c7lvsc298whoyd4w9ta25cr;

-- Drop the redundant user_id column
ALTER TABLE comments DROP COLUMN IF EXISTS user_id;

-- Drop the updated_at column if not needed
ALTER TABLE comments DROP COLUMN IF EXISTS updated_at;

-- Recreate the foreign key constraints
ALTER TABLE comments
ADD CONSTRAINT fk_comments_author FOREIGN KEY (author_id) REFERENCES users(id);

ALTER TABLE comments
ADD CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id); 
CREATE TABLE users (
    id UUID PRIMARY KEY,
    github_id BIGINT NOT NULL,
    github_username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    access_token TEXT,
    token_scope VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
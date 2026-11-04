CREATE TABLE repositories (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    github_repo_id VARCHAR(255) NOT NULL,

    owner VARCHAR(255) NOT NULL,

    name VARCHAR(255) NOT NULL,

    full_name VARCHAR(255) NOT NULL,

    description TEXT,

    default_branch VARCHAR(255) NOT NULL,

    language VARCHAR(100),

    html_url TEXT NOT NULL,

    index_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',

    indexed_at TIMESTAMP WITH TIME ZONE,

    check_count INTEGER NOT NULL DEFAULT 0,

    file_total INTEGER NOT NULL DEFAULT 0,

    total_processed BIGINT NOT NULL DEFAULT 0,

    error_message TEXT,

    created_at TIMESTAMP WITH TIME ZONE,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT uk_repositories_user_github_repo
        UNIQUE (user_id, github_repo_id)
);
-- OBSOLETED BY PRISMA

CREATE TYPE operation_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');

CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');

CREATE TABLE account (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, provider_account_id)
);

CREATE TABLE session (
    id TEXT PRIMARY KEY,
    session_token TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    expires TIMESTAMP(3) NOT NULL
);

CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMP(3),
    image TEXT
    --user_role VARCHAR(20),
    --user_status VARCHAR(20)
);

CREATE TABLE verification_token (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires TIMESTAMP(3) NOT NULL,
    UNIQUE(identifier, token)
);

CREATE TABLE shows (
    show_id SERIAL PRIMARY KEY,
    show_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE seasons (
    season_id SERIAL PRIMARY KEY,
    season_number INT NOT NULL,
    season_year INT NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    show_id INT NOT NULL REFERENCES shows (show_id),
    UNIQUE(show_id, season_number)
);

CREATE TABLE episodes (
    episode_id SERIAL PRIMARY KEY,
    episode_number INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    air_date DATE,
    season_id INT NOT NULL REFERENCES seasons (season_id),
    UNIQUE(season_id, episode_number)
);

CREATE TABLE persons (
    person_id SERIAL PRIMARY KEY,
    person_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    date_of_birth DATE,
    gender gender_type NOT NULL
);

CREATE TABLE characters (
    character_id SERIAL PRIMARY KEY,
    character_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE recurring_sketches (
    recurring_sketch_id SERIAL PRIMARY KEY,
    recurring_sketch_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    show_id INT NOT NULL REFERENCES shows (show_id),
    UNIQUE(show_id, recurring_sketch_name)
);

CREATE TABLE sketches (
    sketch_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    thumbnail_url TEXT,
    youbube_embed TEXT,
    teaser TEXT,
    description TEXT,
    quotes TEXT[],
    notes TEXT[],
    duration INT,
    show_id INT NOT NULL REFERENCES shows (show_id),
    episode_id INT REFERENCES episodes (episode_id),
    recurring_sketch_id INT REFERENCES recurring_sketches (recurring_sketch_id),
    UNIQUE(show_id, title)
);

CREATE TABLE sketch_character_actors (
    sketch_id INT NOT NULL REFERENCES sketches (sketch_id),
    character_id INT NOT NULL REFERENCES characters (character_id),
    person_id INT REFERENCES persons (person_id),
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL,
    updated_by INT NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,
    PRIMARY KEY (sketch_id, character_id)
);

CREATE TABLE sketch_writers (
    sketch_id INT NOT NULL REFERENCES sketches (sketch_id),
    person_id INT NOT NULL REFERENCES persons (person_id),
    PRIMARY KEY (sketch_id, person_id)
);

CREATE TABLE tag_categories (
    tag_category_id SERIAL PRIMARY KEY,
    tag_category_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    UNIQUE(tag_category_name)
);

CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    tag_category_id INT NOT NULL REFERENCES tag_categories (tag_category_id),
    UNIQUE(tag_category_id, tag_name),
    UNIQUE(tag_category_id, slug)
);

CREATE TABLE sketch_tags (
    sketch_id INT NOT NULL REFERENCES sketches (sketch_id),
    tag_id INT NOT NULL REFERENCES tags (tag_id),
    PRIMARY KEY (sketch_id, tag_id)
);

CREATE TABLE ratings (
    user_id TEXT NOT NULL REFERENCES "user" (id),
    sketch_id INT NOT NULL REFERENCES sketches (sketch_id),
    rating_value INT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, sketch_id)
);

CREATE TABLE audit (
    audit_id SERIAL PRIMARY KEY,
    changed_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by TEXT NOT NULL REFERENCES "user" (id),
    table_name VARCHAR(50) NOT NULL,
    operation operation_type NOT NULL,
    row_id INT NOT NULL,
    modified_fields JSONB,
    note TEXT
);


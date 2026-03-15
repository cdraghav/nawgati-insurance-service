CREATE TYPE user_role AS ENUM ('agent', 'manager', 'admin');
CREATE TYPE lead_status AS ENUM ('unassigned', 'assigned', 'contacted', 'converted', 'lost');

create table users
(
    id            serial
        primary key,
    first_name    text                                               not null,
    last_name     text                                               not null,
    email         text                                               not null
        constraint users_email_unique unique,
    password_hash text                                               not null,
    phone         text,
    picture_url   text,
    role          user_role                default 'agent'           not null,
    is_deleted    boolean                  default false             not null,
    is_blocked    boolean                  default false             not null,
    is_super_user boolean                  default false             not null,
    created_at    timestamptz              default CURRENT_TIMESTAMP not null,
    updated_at    timestamptz              default CURRENT_TIMESTAMP not null
);

create table leads
(
    id                  serial
        primary key,
    visit_id            text                                               not null
        constraint leads_visit_id_unique unique,
    vehicle_number      text                                               not null,
    vehicle_phone       text,
    assigned_to         integer
        references users,
    status              lead_status              default 'unassigned'      not null,
    partner_lead_id     text,
    partner_notified_at timestamptz,
    converted_at        timestamptz,
    created_at          timestamptz              default CURRENT_TIMESTAMP not null,
    updated_at          timestamptz              default CURRENT_TIMESTAMP not null
);

create table lead_status_history
(
    id          serial
        primary key,
    lead_id     integer
        references leads                                                    not null,
    changed_by  integer
        references users,
    from_status lead_status,
    to_status   lead_status                                                not null,
    note        text,
    created_at  timestamptz              default CURRENT_TIMESTAMP         not null,
    updated_at  timestamptz              default CURRENT_TIMESTAMP         not null
);

CREATE INDEX leads_vehicle_number_idx        ON leads (vehicle_number);
CREATE INDEX leads_assigned_to_idx           ON leads (assigned_to);
CREATE INDEX leads_status_idx                ON leads (status);
CREATE INDEX lead_status_history_lead_id_idx ON lead_status_history (lead_id);

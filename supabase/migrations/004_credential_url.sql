alter table qualifications add column credential_url text;

grant select, insert, update, delete on qualifications to service_role;

-- Add multi-select life/work areas (domains) while keeping primary `role` for backwards compatibility
ALTER TABLE signals ADD COLUMN domains TEXT;

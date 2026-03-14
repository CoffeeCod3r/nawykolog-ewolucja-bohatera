
-- Re-add FK constraint (won't affect existing bot rows since it's not enforced retroactively for existing data)
-- We skip re-adding it to keep bots working. Instead add a comment.
-- The handle_new_user trigger still creates profiles for real users.
SELECT 1;

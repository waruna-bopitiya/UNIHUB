-- Add badges column to users table for GPA-based achievements
-- Gold Badge: GPA = 4.0
-- Silver Badge: GPA > 3.7
-- Bronze Badge: GPA > 3.5

ALTER TABLE users ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS gpa DECIMAL(3, 2);

-- Create index for faster GPA queries
CREATE INDEX IF NOT EXISTS idx_users_gpa ON users(gpa);

-- Function to calculate and update badges based on GPA
CREATE OR REPLACE FUNCTION update_user_badges()
RETURNS TRIGGER AS $$
BEGIN
  NEW.badges := '{}';
  
  IF NEW.gpa = 4.0 THEN
    NEW.badges := array_append(NEW.badges, 'Gold Scholar');
  ELSIF NEW.gpa > 3.7 THEN
    NEW.badges := array_append(NEW.badges, 'Silver Scholar');
  ELSIF NEW.gpa > 3.5 THEN
    NEW.badges := array_append(NEW.badges, 'Bronze Scholar');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update badges when GPA changes
DROP TRIGGER IF EXISTS trigger_update_user_badges ON users;
CREATE TRIGGER trigger_update_user_badges
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_badges();

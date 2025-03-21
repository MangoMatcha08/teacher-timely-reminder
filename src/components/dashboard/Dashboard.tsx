
// Fix line 66 in Dashboard.tsx where it's trying to access user.displayName
// Since we don't have access to the full file, we'll create a utility function to get the user's name

// Create a utility function for getting user display name
export const getUserDisplayName = (user: any): string => {
  // For Supabase users, get name from metadata
  if (user && user.user_metadata) {
    return user.user_metadata.name || user.user_metadata.full_name || user.email || 'Teacher';
  }
  // Fallback to email or default
  return user?.email || 'Teacher';
}

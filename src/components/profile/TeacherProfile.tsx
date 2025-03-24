
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TeacherProfileData {
  id: string;
  display_name: string;
  school: string | null;
  grade_levels: string[];
  subjects: string[];
  bio: string | null;
  avatar_url: string | null;
  share_templates: boolean;
}

const TeacherProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<TeacherProfileData>({
    id: '',
    display_name: '',
    school: '',
    grade_levels: [],
    subjects: [],
    bio: '',
    avatar_url: '',
    share_templates: false
  });
  
  // Temporary input state for multi-select fields
  const [gradeInput, setGradeInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, school, grade_levels, subjects, bio, avatar_url, share_templates')
        .eq('id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        // Convert null arrays to empty arrays
        const grade_levels = data.grade_levels || [];
        const subjects = data.subjects || [];
        
        setProfile({
          id: data.id,
          display_name: data.display_name || '',
          school: data.school || '',
          grade_levels: grade_levels,
          subjects: subjects,
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          share_templates: data.share_templates || false
        });
      } else {
        // Initialize with user data
        setProfile({
          id: user?.id || '',
          display_name: user?.user_metadata?.name || '',
          school: '',
          grade_levels: [],
          subjects: [],
          bio: '',
          avatar_url: '',
          share_templates: false
        });
      }
    } catch (error: any) {
      toast.error(`Error loading profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const saveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: profile.display_name,
          school: profile.school,
          grade_levels: profile.grade_levels,
          subjects: profile.subjects,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          share_templates: profile.share_templates,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast.success('Profile saved successfully!');
    } catch (error: any) {
      toast.error(`Error saving profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user?.id}/avatar.${fileExt}`;
    
    try {
      // Upload avatar to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile state
      setProfile({
        ...profile,
        avatar_url: data.publicUrl
      });
      
      toast.success('Avatar uploaded successfully!');
    } catch (error: any) {
      toast.error(`Error uploading avatar: ${error.message}`);
    }
  };
  
  const addGradeLevel = () => {
    if (gradeInput && !profile.grade_levels.includes(gradeInput)) {
      setProfile({
        ...profile,
        grade_levels: [...profile.grade_levels, gradeInput]
      });
      setGradeInput('');
    }
  };
  
  const removeGradeLevel = (grade: string) => {
    setProfile({
      ...profile,
      grade_levels: profile.grade_levels.filter(g => g !== grade)
    });
  };
  
  const addSubject = () => {
    if (subjectInput && !profile.subjects.includes(subjectInput)) {
      setProfile({
        ...profile,
        subjects: [...profile.subjects, subjectInput]
      });
      setSubjectInput('');
    }
  };
  
  const removeSubject = (subject: string) => {
    setProfile({
      ...profile,
      subjects: profile.subjects.filter(s => s !== subject)
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Profile</CardTitle>
          <CardDescription>Update your professional teaching profile and sharing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name} />
              <AvatarFallback>{profile.display_name?.slice(0, 2).toUpperCase() || 'TR'}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="mb-2 block">Profile Picture</Label>
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
          </div>
          
          {/* Basic Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={profile.display_name} 
                onChange={(e) => setProfile({...profile, display_name: e.target.value})}
                placeholder="Your name as shown to other teachers"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Input 
                id="school" 
                value={profile.school || ''} 
                onChange={(e) => setProfile({...profile, school: e.target.value})}
                placeholder="Your school or institution"
              />
            </div>
          </div>
          
          {/* Grade Levels Section */}
          <div className="space-y-2">
            <Label>Grade Levels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.grade_levels.map(grade => (
                <span 
                  key={grade} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                >
                  {grade}
                  <button 
                    onClick={() => removeGradeLevel(grade)} 
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input 
                value={gradeInput} 
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder="Add grade level (e.g., K-2, 3-5, 6-8, 9-12)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGradeLevel())}
              />
              <Button type="button" onClick={addGradeLevel} variant="secondary">Add</Button>
            </div>
          </div>
          
          {/* Subjects Section */}
          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.subjects.map(subject => (
                <span 
                  key={subject} 
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"
                >
                  {subject}
                  <button 
                    onClick={() => removeSubject(subject)} 
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input 
                value={subjectInput} 
                onChange={(e) => setSubjectInput(e.target.value)}
                placeholder="Add subject (e.g., Math, Science, English)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
              />
              <Button type="button" onClick={addSubject} variant="secondary">Add</Button>
            </div>
          </div>
          
          {/* Bio Section */}
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea 
              id="bio" 
              value={profile.bio || ''} 
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="A brief description of your teaching experience and interests"
              rows={4}
            />
          </div>
          
          {/* Sharing Preferences */}
          <div className="space-y-2">
            <Label htmlFor="shareTemplates" className="flex items-center space-x-2">
              <input 
                id="shareTemplates" 
                type="checkbox" 
                checked={profile.share_templates}
                onChange={(e) => setProfile({...profile, share_templates: e.target.checked})}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>Share my reminder templates with other teachers</span>
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeacherProfile;

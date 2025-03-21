import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useReminders } from '@/context/ReminderContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/shared/Layout';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchIcon, Filter, Share2, Star, Clock, Download } from 'lucide-react';
import { Json } from '@/services/utils/serviceUtils';

interface ReminderTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  timing: string;
  created_by: string;
  creator_name: string;
  download_count: number;
  is_featured: boolean;
  is_public: boolean;
  created_at: string;
  tags: string[];
}

interface TeacherProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  school?: string;
}

const TemplateLibrary = () => {
  const { user, isAuthenticated } = useAuth();
  const { createReminder } = useReminders();
  const [templates, setTemplates] = useState<ReminderTemplate[]>([]);
  const [myTemplates, setMyTemplates] = useState<ReminderTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [creatorProfiles, setCreatorProfiles] = useState<Record<string, TeacherProfile>>({});
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchTemplates();
      fetchMyTemplates();
    }
  }, [isAuthenticated]);
  
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      // Use RPC call for public templates
      const { data, error } = await supabase.rpc('get_public_templates');
      
      if (error) {
        console.error('Error fetching templates:', error);
        // Fallback to empty array if table doesn't exist yet
        setTemplates([]);
        setCategories(['All']);
        setLoading(false);
        return;
      }
      
      if (data && Array.isArray(data)) {
        // Cast data to ReminderTemplate array with explicit type assertion
        const typedData = data.map(item => item as unknown as ReminderTemplate);
        setTemplates(typedData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(typedData.map(template => template.category))];
        setCategories(['All', ...uniqueCategories.filter(Boolean)]);
        
        // Fetch creator profiles
        const creatorIds = [...new Set(typedData.map(template => template.created_by))];
        await fetchCreatorProfiles(creatorIds);
      } else {
        setTemplates([]);
      }
    } catch (error: any) {
      toast.error(`Error loading templates: ${error.message}`);
      // Fallback to empty state
      setTemplates([]);
      setCategories(['All']);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMyTemplates = async () => {
    if (!user) return;
    
    try {
      // Use RPC call for my templates
      const { data, error } = await supabase.rpc('get_my_templates');
      
      if (error) {
        console.error('Error fetching templates:', error);
        // Fallback to empty array if table doesn't exist yet
        setMyTemplates([]);
        return;
      }
      
      if (data && Array.isArray(data)) {
        // Cast data to ReminderTemplate array with explicit type assertion
        const typedData = data.map(item => item as unknown as ReminderTemplate);
        setMyTemplates(typedData);
      } else {
        setMyTemplates([]);
      }
    } catch (error: any) {
      toast.error(`Error loading your templates: ${error.message}`);
      setMyTemplates([]);
    }
  };
  
  const fetchCreatorProfiles = async (creatorIds: string[]) => {
    if (!creatorIds.length) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, school')
        .in('id', creatorIds);
      
      if (error) {
        console.error(`Error loading creator profiles: ${error.message}`);
        return;
      }
      
      if (data) {
        const profiles: Record<string, TeacherProfile> = {};
        data.forEach(profile => {
          profiles[profile.id] = {
            id: profile.id,
            display_name: profile.display_name || 'Unknown Teacher',
            avatar_url: profile.avatar_url || undefined,
            school: profile.school || undefined
          };
        });
        setCreatorProfiles(profiles);
      }
    } catch (error: any) {
      console.error(`Error loading creator profiles: ${error.message}`);
    }
  };
  
  const handleDownloadTemplate = async (template: ReminderTemplate) => {
    try {
      // Increment download count using direct RPC call
      const { error } = await supabase.rpc('increment_template_downloads', {
        template_id: template.id
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(`Template "${template.title}" added to your reminders!`);
      
      // In a complete implementation, we would:
      // 1. Create a reminder from the template
      // 2. Update the local state
    } catch (error: any) {
      toast.error(`Error using template: ${error.message}`);
    }
  };
  
  const handleShareTemplate = async (template: ReminderTemplate) => {
    try {
      const newPublicStatus = !template.is_public;
      
      // Update the template's public status using RPC
      const { error } = await supabase.rpc('update_template_public_status', { 
        template_id: template.id, 
        is_public_status: newPublicStatus 
      });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setMyTemplates(myTemplates.map(t => 
        t.id === template.id ? {...t, is_public: newPublicStatus} : t
      ));
      
      toast.success(
        newPublicStatus
          ? `Template "${template.title}" is now public` 
          : `Template "${template.title}" is now private`
      );
    } catch (error: any) {
      toast.error(`Error updating template: ${error.message}`);
    }
  };
  
  const handleCreateTemplateFromReminder = () => {
    // This would be implemented later - save a reminder as a template
    toast.info("Creating templates from reminders will be available soon!");
  };
  
  const filteredTemplates = templates
    .filter(template => 
      (selectedCategory === 'All' || template.category === selectedCategory) &&
      (template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (creatorProfiles[template.created_by]?.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );
  
  if (!isAuthenticated) {
    return (
      <Layout pageTitle="Template Library">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to access the template library.</p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout pageTitle="Template Library">
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Template Library</h1>
            <p className="text-muted-foreground">Browse and share reminder templates with other teachers</p>
          </div>
          <Button onClick={handleCreateTemplateFromReminder} className="mt-2 md:mt-0">
            Create New Template
          </Button>
        </div>
        
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="browse">Browse Templates</TabsTrigger>
            <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search templates by title, description or creator"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category || 'Uncategorized'}</option>
                ))}
              </select>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No templates found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map(template => (
                      <Card key={template.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{template.title}</CardTitle>
                              <CardDescription className="mt-1">
                                by {creatorProfiles[template.created_by]?.display_name || 'Unknown Teacher'}
                                {creatorProfiles[template.created_by]?.school && 
                                  ` - ${creatorProfiles[template.created_by].school}`}
                              </CardDescription>
                            </div>
                            {template.is_featured && (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                <Star className="w-3 h-3 mr-1" /> Featured
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {template.tags && template.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {template.category && (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                                {template.category}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{new Date(template.created_at).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <Download className="w-4 h-4 mr-1" />
                            <span>{template.download_count} uses</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            onClick={() => handleDownloadTemplate(template)}
                            variant="default"
                            className="w-full"
                          >
                            Use This Template
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="my-templates">
            {myTemplates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't created any templates yet.</p>
                <Button onClick={handleCreateTemplateFromReminder}>
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTemplates.map(template => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle>{template.title}</CardTitle>
                      <CardDescription>
                        {template.is_public ? 'Public Template' : 'Private Template'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {template.tags && template.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.category && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">
                            {template.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{new Date(template.created_at).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <Download className="w-4 h-4 mr-1" />
                        <span>{template.download_count} uses</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        onClick={() => handleShareTemplate(template)}
                        variant={template.is_public ? "outline" : "default"}
                        size="sm"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {template.is_public ? 'Make Private' : 'Share Publicly'}
                      </Button>
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadTemplate(template)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Use
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TemplateLibrary;

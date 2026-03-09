import React, { useRef, useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, BookOpen, Sparkles, FileUp, Download, Play, Users, AlertTriangle, Link, Upload, GripVertical, ChevronUp, ChevronDown, ExternalLink, Image } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from '@/components/admin/FileUpload';

interface LearnContentForm {
  title: string;
  description: string;
  full_description: string;
  instructor_name: string;
  instructor_avatar_url: string;
  company_name: string;
  category: string;
  section_type: string;
  thumbnail_url: string;
  video_url: string;
  video_source_type: 'upload' | 'embed';
  duration_minutes: number;
  is_premium: boolean;
  order_index: number;
}

interface ResourceForm {
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size_mb: number;
  is_premium: boolean;
  order_index: number;
}

interface ExploreProgramForm {
  title: string;
  description: string;
  label: string;
  image_url: string;
  redirect_url: string;
  gradient: string;
  program_tab: 'online' | 'offline';
  order_index: number;
  is_active: boolean;
}

interface AlumniShowcaseForm {
  title: string;
  author_name: string;
  cohort_type: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';
  media_type: 'video' | 'image' | 'reel';
  media_url: string;
  thumbnail_url: string;
  redirect_url: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

const initialForm: LearnContentForm = {
  title: '',
  description: '',
  full_description: '',
  instructor_name: '',
  instructor_avatar_url: '',
  company_name: '',
  category: 'Session',
  section_type: 'community_sessions',
  thumbnail_url: '',
  video_url: '',
  video_source_type: 'upload',
  duration_minutes: 0,
  is_premium: false,
  order_index: 0,
};

const initialResourceForm: ResourceForm = {
  title: '',
  description: '',
  file_url: '',
  file_type: 'pdf',
  file_size_mb: 0,
  is_premium: true,
  order_index: 0,
};

const initialProgramForm: ExploreProgramForm = {
  title: '',
  description: '',
  label: '',
  image_url: '',
  redirect_url: '',
  gradient: '',
  program_tab: 'online',
  order_index: 0,
  is_active: true,
};

const initialShowcaseForm: AlumniShowcaseForm = {
  title: '',
  author_name: '',
  cohort_type: 'FORGE',
  media_type: 'video',
  media_url: '',
  thumbnail_url: '',
  redirect_url: '',
  description: '',
  order_index: 0,
  is_active: true,
};

const cohortMediaDefaults: Record<string, 'video' | 'image' | 'reel'> = {
  FORGE: 'video',
  FORGE_WRITING: 'image',
  FORGE_CREATORS: 'reel',
};

const sectionTypes = [
  { value: 'community_sessions', label: 'Community Sessions' },
  { value: 'bfp_sessions', label: 'Pre Forge Sessions' },
];
const fileTypes = ['pdf', 'doc', 'xlsx', 'pptx', 'zip', 'other'];

// Helper to extract Vimeo video ID from URL or full HTML embed code
const parseVimeoInput = (input: string): { videoId: string; url: string } | null => {
  let url = input.trim();
  
  // Check if input is HTML embed code (contains iframe)
  if (url.includes('<iframe')) {
    const srcMatch = url.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      url = srcMatch[1];
      url = url.replace(/&amp;/g, '&'); // Decode HTML entities
    } else {
      return null;
    }
  }

  // Match Vimeo URL patterns
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { videoId: match[1], url };
    }
  }
  return null;
};

const AdminLearn: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const videoUrlRef = useRef<string>('');
  const [form, setForm] = useState<LearnContentForm>(initialForm);
  const [resourceForm, setResourceForm] = useState<ResourceForm>(initialResourceForm);
  const [activeTab, setActiveTab] = useState('community_sessions');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Explore Programs state
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState<ExploreProgramForm>(initialProgramForm);
  const [programSubTab, setProgramSubTab] = useState<'online' | 'offline'>('online');

  // Alumni Showcase state
  const [isShowcaseDialogOpen, setIsShowcaseDialogOpen] = useState(false);
  const [editingShowcaseId, setEditingShowcaseId] = useState<string | null>(null);
  const [showcaseForm, setShowcaseForm] = useState<AlumniShowcaseForm>(initialShowcaseForm);
  const [showcaseSubTab, setShowcaseSubTab] = useState<'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS'>('FORGE');

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reordered: { id: string; order_index: number }[]) => {
      await Promise.all(
        reordered.map((item) =>
          supabase.from('learn_content').update({ order_index: item.order_index }).eq('id', item.id)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-learn-content'] });
      queryClient.invalidateQueries({ queryKey: ['learn_content'] });
      toast.success('Order updated');
    },
    onError: (error) => {
      toast.error('Failed to reorder: ' + error.message);
    },
  });

  const handleDrop = (dropIdx: number) => {
    if (dragIndex === null || dragIndex === dropIdx) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const items = [...filteredContent];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(dropIdx, 0, moved);
    const updates = items.map((item, idx) => ({ id: item.id, order_index: idx }));
    reorderMutation.mutate(updates);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Fetch learn content
  const { data: content, isLoading } = useQuery({
    queryKey: ['admin-learn-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learn_content')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Fetch resources for selected content
  const { data: resources } = useQuery({
    queryKey: ['admin-learn-resources', selectedContentId],
    queryFn: async () => {
      if (!selectedContentId) return [];
      const { data, error } = await supabase
        .from('learn_resources')
        .select('*')
        .eq('learn_content_id', selectedContentId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedContentId,
  });

  // Fetch explore programs
  const { data: explorePrograms = [], isLoading: isProgramsLoading } = useQuery({
    queryKey: ['admin-explore-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('explore_programs')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch alumni showcase
  const { data: showcaseItems = [], isLoading: isShowcaseLoading } = useQuery({
    queryKey: ['admin-alumni-showcase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alumni_showcase')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Create/Update content mutation
  const saveMutation = useMutation({
    mutationFn: async (data: LearnContentForm) => {
      if (editingId) {
        const { error } = await supabase
          .from('learn_content')
          .update(data)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('learn_content').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-learn-content'] });
      queryClient.invalidateQueries({ queryKey: ['learn_content'] });
      toast.success(editingId ? 'Content updated' : 'Content created');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to save content: ' + error.message);
    },
  });

  // Delete content mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('learn_content').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-learn-content'] });
      queryClient.invalidateQueries({ queryKey: ['learn_content'] });
      toast.success('Content deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete content: ' + error.message);
    },
  });

  // Save resource mutation
  const saveResourceMutation = useMutation({
    mutationFn: async (data: ResourceForm & { learn_content_id: string }) => {
      const { error } = await supabase.from('learn_resources').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-learn-resources', selectedContentId] });
      toast.success('Resource added');
      setResourceForm(initialResourceForm);
      setIsResourceDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to add resource: ' + error.message);
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('learn_resources').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-learn-resources', selectedContentId] });
      toast.success('Resource deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete resource: ' + error.message);
    },
  });

  // Explore Programs mutations
  const saveProgramMutation = useMutation({
    mutationFn: async (data: ExploreProgramForm) => {
      if (editingProgramId) {
        const { error } = await supabase
          .from('explore_programs')
          .update(data)
          .eq('id', editingProgramId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('explore_programs').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-explore-programs'] });
      queryClient.invalidateQueries({ queryKey: ['explore-programs'] });
      toast.success(editingProgramId ? 'Program updated' : 'Program created');
      resetProgramForm();
    },
    onError: (error) => {
      toast.error('Failed to save program: ' + error.message);
    },
  });

  const deleteProgramMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('explore_programs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-explore-programs'] });
      queryClient.invalidateQueries({ queryKey: ['explore-programs'] });
      toast.success('Program deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete program: ' + error.message);
    },
  });

  // Alumni Showcase mutations
  const saveShowcaseMutation = useMutation({
    mutationFn: async (data: AlumniShowcaseForm) => {
      if (editingShowcaseId) {
        const { error } = await supabase
          .from('alumni_showcase')
          .update(data)
          .eq('id', editingShowcaseId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('alumni_showcase').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alumni-showcase'] });
      queryClient.invalidateQueries({ queryKey: ['alumni-showcase'] });
      toast.success(editingShowcaseId ? 'Showcase updated' : 'Showcase item created');
      resetShowcaseForm();
    },
    onError: (error) => {
      toast.error('Failed to save showcase: ' + error.message);
    },
  });

  const deleteShowcaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alumni_showcase').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-alumni-showcase'] });
      queryClient.invalidateQueries({ queryKey: ['alumni-showcase'] });
      toast.success('Showcase item deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete showcase: ' + error.message);
    },
  });

  const resetForm = () => {
    setForm(initialForm);
    videoUrlRef.current = '';
    setIsVideoUploading(false);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const resetProgramForm = () => {
    setProgramForm(initialProgramForm);
    setEditingProgramId(null);
    setIsProgramDialogOpen(false);
  };

  const resetShowcaseForm = () => {
    setShowcaseForm(initialShowcaseForm);
    setEditingShowcaseId(null);
    setIsShowcaseDialogOpen(false);
  };

  const handleEditShowcase = (item: any) => {
    setShowcaseForm({
      title: item.title || '',
      author_name: item.author_name || '',
      cohort_type: item.cohort_type || 'FORGE',
      media_type: item.media_type || 'video',
      media_url: item.media_url || '',
      thumbnail_url: item.thumbnail_url || '',
      redirect_url: item.redirect_url || '',
      description: item.description || '',
      order_index: item.order_index || 0,
      is_active: item.is_active ?? true,
    });
    setEditingShowcaseId(item.id);
    setIsShowcaseDialogOpen(true);
  };

  const handleShowcaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseForm.title.trim() || !showcaseForm.author_name.trim()) {
      toast.error('Title and Author Name are required');
      return;
    }
    saveShowcaseMutation.mutate(showcaseForm);
  };

  const handleEdit = (item: typeof content[0]) => {
    const nextVideoUrl = item.video_url || '';
    const sourceType = (item.video_source_type as 'upload' | 'embed') || 'upload';

    setForm({
      title: item.title,
      description: item.description || '',
      full_description: item.full_description || '',
      instructor_name: item.instructor_name || '',
      instructor_avatar_url: (item as any).instructor_avatar_url || '',
      company_name: item.company_name || '',
      category: item.category,
      section_type: item.section_type || 'community_sessions',
      thumbnail_url: item.thumbnail_url || '',
      video_url: nextVideoUrl,
      video_source_type: sourceType,
      duration_minutes: item.duration_minutes || 0,
      is_premium: item.is_premium,
      order_index: item.order_index,
    });

    videoUrlRef.current = nextVideoUrl;
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleEditProgram = (item: any) => {
    setProgramForm({
      title: item.title || '',
      description: item.description || '',
      label: item.label || '',
      image_url: item.image_url || '',
      redirect_url: item.redirect_url || '',
      gradient: item.gradient || '',
      program_tab: item.program_tab || 'online',
      order_index: item.order_index || 0,
      is_active: item.is_active ?? true,
    });
    setEditingProgramId(item.id);
    setIsProgramDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.video_source_type === 'upload') {
      if (isVideoUploading) {
        toast.error('Please wait for the video upload to finish');
        return;
      }

      const finalVideoUrl = videoUrlRef.current || form.video_url;
      if (!finalVideoUrl) {
        toast.error('Please upload a video before saving');
        return;
      }

      saveMutation.mutate({ ...form, video_url: finalVideoUrl });
    } else {
      // Embed mode - validate Vimeo URL or embed code
      const vimeoData = parseVimeoInput(form.video_url || '');
      if (!vimeoData) {
        toast.error('Please enter a valid Vimeo URL or embed code');
        return;
      }

      // Normalize to clean player URL before saving
      const normalizedUrl = `https://player.vimeo.com/video/${vimeoData.videoId}`;
      saveMutation.mutate({ ...form, video_url: normalizedUrl });
    }
  };

  const handleProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title.trim()) {
      toast.error('Title is required');
      return;
    }
    saveProgramMutation.mutate(programForm);
  };

  const handleResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContentId) return;
    saveResourceMutation.mutate({
      ...resourceForm,
      learn_content_id: selectedContentId,
    });
  };

  const filteredContent = content?.filter(c => c.section_type === activeTab) || [];
  const filteredPrograms = explorePrograms.filter(p => p.program_tab === programSubTab);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Learn Content Management</h1>
          <p className="text-muted-foreground">Upload videos, manage content, and add bonus resources</p>
        </div>
        {activeTab !== 'explore_programs' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setForm({ ...initialForm, section_type: activeTab }); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Content' : 'Create Content'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update the content details below' : 'Upload video and fill in content details'}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Video Source Section */}
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Play className="h-4 w-4 text-primary" />
                      Video Source
                    </h3>
                    
                    {/* Video Source Toggle */}
                    <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg w-fit">
                      <Button
                        type="button"
                        size="sm"
                        variant={form.video_source_type === 'upload' ? 'default' : 'ghost'}
                        className="gap-2"
                        onClick={() => setForm({ ...form, video_source_type: 'upload', video_url: '' })}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Video
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={form.video_source_type === 'embed' ? 'default' : 'ghost'}
                        className="gap-2"
                        onClick={() => setForm({ ...form, video_source_type: 'embed', video_url: '' })}
                      >
                        <Link className="h-4 w-4" />
                        Embed Link
                      </Button>
                    </div>

                    {/* Upload Mode */}
                    {form.video_source_type === 'upload' && (
                      <FileUpload
                        bucket="learn-videos"
                        accept="video/*"
                        maxSizeMB={5120}
                        label="Video File"
                        helperText="Supported formats: MP4, WebM, MOV. Max 5GB. Duration auto-detected."
                        currentUrl={form.video_url}
                        onUploadingChange={setIsVideoUploading}
                        onUploadComplete={(url) => {
                          videoUrlRef.current = url;
                          setForm((prev) => ({ ...prev, video_url: url }));
                        }}
                        onDurationDetected={(duration) => {
                          setForm((prev) => ({ ...prev, duration_minutes: duration }));
                        }}
                      />
                    )}

                    {/* Embed Mode */}
                    {form.video_source_type === 'embed' && (
                      <div className="space-y-2">
                        <Label htmlFor="vimeo_url">Vimeo URL</Label>
                        <Input
                          id="vimeo_url"
                          value={form.video_url}
                          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                          placeholder="Paste Vimeo URL or full embed code"
                        />
                        <p className="text-xs text-muted-foreground">
                          Paste your Vimeo URL or the full embed code from Vimeo's share button.
                        </p>
                      </div>
                    )}

                    <FileUpload
                      bucket="learn-thumbnails"
                      accept="image/*"
                      maxSizeMB={10}
                      label="Thumbnail Image"
                      helperText="Recommended: 16:9 aspect ratio, min 1280x720px"
                      currentUrl={form.thumbnail_url}
                      onUploadComplete={(url) => setForm((prev) => ({ ...prev, thumbnail_url: url }))}
                    />
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Session title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="section_type">Section *</Label>
                      <Select
                        value={form.section_type}
                        onValueChange={(value) => setForm({ ...form, section_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Instructor Details Section */}
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Instructor Details
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instructor_name">Instructor Name</Label>
                        <Input
                          id="instructor_name"
                          value={form.instructor_name}
                          onChange={(e) => setForm({ ...form, instructor_name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company_name">Company</Label>
                        <Input
                          id="company_name"
                          value={form.company_name}
                          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                          placeholder="Google"
                        />
                      </div>
                    </div>

                    {/* Instructor Profile Photo */}
                    <FileUpload
                      bucket="learn-thumbnails"
                      accept="image/*"
                      maxSizeMB={5}
                      label="Instructor Profile Photo"
                      helperText="Square image recommended (1:1 ratio), min 200x200px"
                      currentUrl={form.instructor_avatar_url}
                      onUploadComplete={(url) => setForm(prev => ({ ...prev, instructor_avatar_url: url }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Short Description</Label>
                    <Input
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Brief description for the card"
                    />
                  </div>

                  <div>
                    <Label htmlFor="full_description">Full Description</Label>
                    <Textarea
                      id="full_description"
                      value={form.full_description}
                      onChange={(e) => setForm({ ...form, full_description: e.target.value })}
                      placeholder="Detailed description shown in the video player"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g., Session, Workshop, Masterclass"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Duration</Label>
                      {(() => {
                        const totalSecs = (form.duration_minutes || 0) * 60;
                        const h = Math.floor(totalSecs / 3600);
                        const m = Math.floor((totalSecs % 3600) / 60);
                        const s = totalSecs % 60;
                        const updateDuration = (newH: number, newM: number, newS: number) => {
                          const clampedH = Math.max(0, Math.min(60, newH));
                          const clampedM = Math.max(0, Math.min(59, newM));
                          const clampedS = Math.max(0, Math.min(59, newS));
                          const totalMins = clampedH * 60 + clampedM + (clampedS >= 30 ? 1 : 0);
                          setForm({ ...form, duration_minutes: totalMins });
                        };
                        const Segment = ({ value, label, max, onChange }: { value: number; label: string; max: number; onChange: (v: number) => void }) => (
                          <div className="flex flex-col items-center gap-0.5">
                            <button type="button" className="p-0.5 rounded hover:bg-muted transition-colors" onClick={() => onChange(Math.min(max, value + 1))}>
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <Input
                              type="text"
                              className="w-12 h-9 text-center px-1 text-sm font-mono"
                              value={value.toString().padStart(2, '0')}
                              onChange={(e) => {
                                const v = parseInt(e.target.value) || 0;
                                onChange(Math.max(0, Math.min(max, v)));
                              }}
                            />
                            <button type="button" className="p-0.5 rounded hover:bg-muted transition-colors" onClick={() => onChange(Math.max(0, value - 1))}>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
                          </div>
                        );
                        return (
                          <div className="flex items-center gap-1 mt-1">
                            <Segment value={h} label="H" max={60} onChange={(v) => updateDuration(v, m, s)} />
                            <span className="text-muted-foreground font-bold mt-[-18px]">:</span>
                            <Segment value={m} label="M" max={59} onChange={(v) => updateDuration(h, v, s)} />
                            <span className="text-muted-foreground font-bold mt-[-18px]">:</span>
                            <Segment value={s} label="S" max={59} onChange={(v) => updateDuration(h, m, v)} />
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <Label htmlFor="order_index">Display Order</Label>
                      <Input
                        id="order_index"
                        type="number"
                        value={form.order_index}
                        onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <Switch
                      id="is_premium"
                      checked={form.is_premium}
                      onCheckedChange={(checked) => setForm({ ...form, is_premium: checked })}
                    />
                    <div>
                      <Label htmlFor="is_premium" className="font-medium">Premium Content</Label>
                      <p className="text-xs text-muted-foreground">Only accessible to fully paid members</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending || (form.video_source_type === 'upload' && isVideoUploading) || !form.video_url}
                    >
                      {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Section Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/50 p-1 rounded-lg border border-border/50">
          <TabsTrigger value="community_sessions" className="rounded-md px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            Community Sessions
          </TabsTrigger>
          <TabsTrigger value="bfp_sessions" className="rounded-md px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Pre Forge Sessions
          </TabsTrigger>
          <TabsTrigger value="explore_programs" className="rounded-md px-4 py-2">
            <ExternalLink className="h-4 w-4 mr-2" />
            Explore Programs
          </TabsTrigger>
        </TabsList>

        {/* Learn Content Tabs */}
        <TabsContent value="community_sessions">
          <LearnContentTable
            filteredContent={filteredContent}
            isLoading={isLoading}
            activeTab={activeTab}
            dragOverIndex={dragOverIndex}
            onDragOver={(idx) => setDragOverIndex(idx)}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(idx) => { handleDrop(idx); }}
            onDragStart={(idx) => setDragIndex(idx)}
            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
            onEdit={handleEdit}
            onDelete={(id) => { if (confirm('Delete this content?')) deleteMutation.mutate(id); }}
            onManageResources={(id) => { setSelectedContentId(id); setIsResourceDialogOpen(true); }}
            onAdd={() => { resetForm(); setForm({ ...initialForm, section_type: activeTab }); setIsDialogOpen(true); }}
          />
        </TabsContent>

        <TabsContent value="bfp_sessions">
          <LearnContentTable
            filteredContent={filteredContent}
            isLoading={isLoading}
            activeTab={activeTab}
            dragOverIndex={dragOverIndex}
            onDragOver={(idx) => setDragOverIndex(idx)}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(idx) => { handleDrop(idx); }}
            onDragStart={(idx) => setDragIndex(idx)}
            onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
            onEdit={handleEdit}
            onDelete={(id) => { if (confirm('Delete this content?')) deleteMutation.mutate(id); }}
            onManageResources={(id) => { setSelectedContentId(id); setIsResourceDialogOpen(true); }}
            onAdd={() => { resetForm(); setForm({ ...initialForm, section_type: activeTab }); setIsDialogOpen(true); }}
          />
        </TabsContent>

        {/* Explore Programs Tab */}
        <TabsContent value="explore_programs">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {/* Sub-toggle */}
              <div className="flex gap-1 p-1 rounded-full bg-card border border-border/30 w-fit">
                {(['online', 'offline'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProgramSubTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      programSubTab === tab
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'online' ? 'Online Programs' : 'Offline Residencies'}
                  </button>
                ))}
              </div>
              <Button onClick={() => { resetProgramForm(); setProgramForm({ ...initialProgramForm, program_tab: programSubTab }); setIsProgramDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Program
              </Button>
            </div>

            {isProgramsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading programs...</div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-xl">
                <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No programs yet</h3>
                <p className="text-muted-foreground mb-4">Add your first {programSubTab} program banner</p>
                <Button onClick={() => { resetProgramForm(); setProgramForm({ ...initialProgramForm, program_tab: programSubTab }); setIsProgramDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50"
                  >
                    {/* Thumbnail */}
                    {program.image_url ? (
                      <img
                        src={program.image_url}
                        alt={program.title}
                        className="w-32 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-32 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ background: program.gradient || 'hsl(var(--secondary))' }}
                      >
                        <Image className="h-6 w-6 text-white/50" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">{program.title}</h3>
                        {!program.is_active && (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">Hidden</span>
                        )}
                      </div>
                      {program.label && (
                        <p className="text-xs text-primary font-medium mt-0.5">{program.label}</p>
                      )}
                      <p className="text-sm text-muted-foreground truncate mt-1">{program.description}</p>
                      {program.redirect_url && (
                        <a href={program.redirect_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 mt-1">
                          <ExternalLink className="h-3 w-3" />
                          {program.redirect_url}
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProgram(program)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this program?')) deleteProgramMutation.mutate(program.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Explore Program Dialog */}
      <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingProgramId ? 'Edit Program' : 'Add Program'}</DialogTitle>
            <DialogDescription>
              Configure the program banner with image and redirect link
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <form onSubmit={handleProgramSubmit} className="space-y-4">
              <div>
                <Label htmlFor="prog_title">Title *</Label>
                <Input
                  id="prog_title"
                  value={programForm.title}
                  onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                  placeholder="e.g. Breakthrough Filmmaking"
                  required
                />
              </div>

              <div>
                <Label htmlFor="prog_description">Description</Label>
                <Textarea
                  id="prog_description"
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  placeholder="Short description"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="prog_label">Label</Label>
                <Input
                  id="prog_label"
                  value={programForm.label}
                  onChange={(e) => setProgramForm({ ...programForm, label: e.target.value })}
                  placeholder="e.g. FORGE RESIDENCY"
                />
              </div>

              {/* Banner Image Upload */}
              <FileUpload
                bucket="learn-thumbnails"
                accept="image/*"
                maxSizeMB={10}
                label="Banner Image"
                helperText="Recommended: 1280×465px or similar wide aspect ratio"
                currentUrl={programForm.image_url}
                onUploadComplete={(url) => setProgramForm(prev => ({ ...prev, image_url: url }))}
              />

              <div>
                <Label htmlFor="prog_redirect">Redirect URL *</Label>
                <Input
                  id="prog_redirect"
                  value={programForm.redirect_url}
                  onChange={(e) => setProgramForm({ ...programForm, redirect_url: e.target.value })}
                  placeholder="https://www.example.com"
                />
              </div>

              <div>
                <Label htmlFor="prog_gradient">Fallback Gradient CSS</Label>
                <Input
                  id="prog_gradient"
                  value={programForm.gradient}
                  onChange={(e) => setProgramForm({ ...programForm, gradient: e.target.value })}
                  placeholder="linear-gradient(135deg, hsl(260,60%,25%) 0%, hsl(230,50%,30%) 100%)"
                />
                <p className="text-xs text-muted-foreground mt-1">Used when no banner image is uploaded</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prog_tab">Category</Label>
                  <Select
                    value={programForm.program_tab}
                    onValueChange={(v) => setProgramForm({ ...programForm, program_tab: v as 'online' | 'offline' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online Program</SelectItem>
                      <SelectItem value="offline">Offline Residency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prog_order">Display Order</Label>
                  <Input
                    id="prog_order"
                    type="number"
                    value={programForm.order_index}
                    onChange={(e) => setProgramForm({ ...programForm, order_index: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Switch
                  id="prog_active"
                  checked={programForm.is_active}
                  onCheckedChange={(checked) => setProgramForm({ ...programForm, is_active: checked })}
                />
                <div>
                  <Label htmlFor="prog_active" className="font-medium">Active</Label>
                  <p className="text-xs text-muted-foreground">Show this program on the Learn page</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={resetProgramForm}>Cancel</Button>
                <Button type="submit" disabled={saveProgramMutation.isPending}>
                  {saveProgramMutation.isPending ? 'Saving...' : editingProgramId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Resource Management Dialog */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Bonus Resources</DialogTitle>
            <DialogDescription>
              Upload downloadable resources like PDFs, templates, and checklists
            </DialogDescription>
          </DialogHeader>

          {/* Existing Resources */}
          {resources && resources.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-foreground">Current Resources</h4>
              <div className="space-y-2">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.file_type.toUpperCase()}
                          {resource.file_size_mb && ` • ${resource.file_size_mb} MB`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm('Delete this resource?')) {
                          deleteResourceMutation.mutate(resource.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Resource Form */}
          <form onSubmit={handleResourceSubmit} className="space-y-4 border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground">Add New Resource</h4>

            <div>
              <Label htmlFor="resource_title">Title *</Label>
              <Input
                id="resource_title"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="Resource name"
                required
              />
            </div>

            <div>
              <Label htmlFor="resource_description">Description</Label>
              <Input
                id="resource_description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>

            <FileUpload
              bucket="learn-resources"
              accept=".pdf,.doc,.docx,.xlsx,.pptx,.zip"
              maxSizeMB={100}
              label="Resource File"
              helperText="Upload PDF, DOC, XLSX, PPTX, or ZIP files"
              currentUrl={resourceForm.file_url}
              onUploadComplete={(url) => setResourceForm((prev) => ({ ...prev, file_url: url }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="file_type">File Type</Label>
                <Select
                  value={resourceForm.file_type}
                  onValueChange={(value) => setResourceForm({ ...resourceForm, file_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file_size">File Size (MB)</Label>
                <Input
                  id="file_size"
                  type="number"
                  value={resourceForm.file_size_mb}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, file_size_mb: parseFloat(e.target.value) || 0 })
                  }
                  step="0.1"
                  min={0}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={saveResourceMutation.isPending || !resourceForm.file_url}>
                {saveResourceMutation.isPending ? 'Adding...' : 'Add Resource'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* Extracted table component for learn content */
interface LearnContentTableProps {
  filteredContent: any[];
  isLoading: boolean;
  activeTab: string;
  dragOverIndex: number | null;
  onDragOver: (idx: number) => void;
  onDragLeave: () => void;
  onDrop: (idx: number) => void;
  onDragStart: (idx: number) => void;
  onDragEnd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  onManageResources: (id: string) => void;
  onAdd: () => void;
}

const LearnContentTable: React.FC<LearnContentTableProps> = ({
  filteredContent, isLoading, activeTab, dragOverIndex,
  onDragOver, onDragLeave, onDrop, onDragStart, onDragEnd,
  onEdit, onDelete, onManageResources, onAdd,
}) => {
  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading content...</div>;
  }

  if (filteredContent.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-xl">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No content yet</h3>
        <p className="text-muted-foreground mb-4">Upload your first video to get started</p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Content</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Premium</TableHead>
            <TableHead>Resources</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredContent.map((item, idx) => (
            <TableRow
              key={item.id}
              className={dragOverIndex === idx ? 'border-t-2 border-t-primary' : ''}
              onDragOver={(e) => { e.preventDefault(); onDragOver(idx); }}
              onDragLeave={() => onDragLeave()}
              onDrop={(e) => { e.preventDefault(); onDrop(idx); }}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.title} className="w-16 h-10 rounded-md object-cover" />
                  ) : (
                    <div className="w-16 h-10 rounded-md bg-secondary flex items-center justify-center">
                      <Play className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{item.title}</p>
                      {!item.video_url && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          No video
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{item.instructor_name || '-'}</p>
                  {item.company_name && <p className="text-xs text-muted-foreground">{item.company_name}</p>}
                </div>
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 rounded-full bg-secondary text-foreground text-xs">{item.category}</span>
              </TableCell>
              <TableCell>
                {item.duration_minutes ? (() => {
                  const h = Math.floor(item.duration_minutes / 60);
                  const m = item.duration_minutes % 60;
                  return h > 0 ? `${h}h ${m}m` : `${m}m`;
                })() : '-'}
              </TableCell>
              <TableCell>
                {item.is_premium ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Premium
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">Free</span>
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onManageResources(item.id)}>
                  <FileUp className="h-4 w-4 mr-1" />
                  Manage
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          draggable
                          onDragStart={() => onDragStart(idx)}
                          onDragEnd={onDragEnd}
                          className="cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted transition-colors"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Drag to reorder</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminLearn;

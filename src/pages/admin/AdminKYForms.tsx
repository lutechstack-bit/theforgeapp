import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, GripVertical, Save, Copy, Settings, Download, Search, Eye, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { getSectionsForCohort, type SectionStepField } from '@/components/kyform/KYSectionConfig';
import { useStudentKYData, type StudentRow } from '@/hooks/useStudentKYData';
import { StudentDetailSheet } from '@/components/admin/ky/StudentDetailSheet';
import { buildCsvExport, downloadCsv } from '@/lib/kyFieldSchema';

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'tel', label: 'Phone' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'multi_select', label: 'Multi Select' },
  { value: 'proficiency', label: 'Proficiency Level' },
  { value: 'photo_upload', label: 'Photo Upload' },
];

const COHORT_TYPES = [
  { value: 'FORGE', label: 'Filmmaking' },
  { value: 'FORGE_CREATORS', label: 'Creators' },
  { value: 'FORGE_WRITING', label: 'Writing' },
];

const ICONS = ['User', 'MapPin', 'Heart', 'Film', 'Camera', 'Sparkles', 'FileCheck', 'Pen', 'Video', 'ExternalLink'];

interface FormField {
  id?: string;
  field_key: string;
  label: string;
  field_type: string;
  placeholder: string;
  helper_text: string;
  is_required: boolean;
  options: { value: string; label: string }[];
  order_index: number;
  grid_cols: number;
}

interface FormStep {
  id?: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
  fields: FormField[];
}

interface Form {
  id?: string;
  cohort_type: string;
  name: string;
  description: string;
  is_active: boolean;
  steps: FormStep[];
}

function StudentDataTab() {
  const [cohortFilter, setCohortFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailStudent, setDetailStudent] = useState<StudentRow | null>(null);
  const { toast } = useToast();

  const { data: students, isLoading } = useStudentKYData(cohortFilter);

  const filtered = (students || []).filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.full_name?.toLowerCase().includes(q)) || (s.email?.toLowerCase().includes(q)) || (s.edition_name?.toLowerCase().includes(q));
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  };

  // CSV export is driven by the canonical schema in src/lib/kyFieldSchema.ts
  // — human-readable headers, logical column order, consistent boolean /
  // list / URL formatting. Any unknown fields still on a respondent row are
  // appended as "Other: …" columns so nothing is silently lost.
  const downloadCSV = () => {
    const toExport = selectedIds.size > 0 ? filtered.filter(s => selectedIds.has(s.id)) : filtered;
    if (toExport.length === 0) {
      toast({ title: 'No data to export', variant: 'destructive' });
      return;
    }
    const exp = buildCsvExport(toExport);
    const filename = `ky-responses-${cohortFilter || 'all'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    downloadCsv(filename, exp);
    toast({ title: `Exported ${toExport.length} students` });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <Badge
            variant={!cohortFilter ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setCohortFilter(null)}
          >
            All
          </Badge>
          {COHORT_TYPES.map(c => (
            <Badge
              key={c.value}
              variant={cohortFilter === c.value ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setCohortFilter(c.value)}
            >
              {c.label}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs w-[220px]"
            />
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 h-9 text-xs" onClick={downloadCSV}>
            <Download className="w-3.5 h-3.5" />
            {selectedIds.size > 0 ? `Export ${selectedIds.size}` : 'Export All'}
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : (
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={filtered.length > 0 && selectedIds.size === filtered.length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="text-[10px]">Name</TableHead>
                    <TableHead className="text-[10px]">Email</TableHead>
                    <TableHead className="text-[10px]">Edition</TableHead>
                    <TableHead className="text-[10px]">Cohort</TableHead>
                    <TableHead className="text-center text-[10px]">KY Form</TableHead>
                    <TableHead className="text-center text-[10px]">Community Profile</TableHead>
                    <TableHead className="text-[10px]">MBTI</TableHead>
                    <TableHead className="text-[10px]">City</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(student => (
                    <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDetailStudent(student)}>
                      <TableCell className="py-2" onClick={e => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(student.id)}
                          onCheckedChange={() => toggleSelect(student.id)}
                        />
                      </TableCell>
                      <TableCell className="text-xs font-medium truncate max-w-[140px] py-2">{student.full_name || '—'}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground truncate max-w-[180px] py-2">{student.email || '—'}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground truncate max-w-[120px] py-2">{student.edition_name || '—'}</TableCell>
                      <TableCell className="py-2">
                        {student.cohort_type && (
                          <Badge variant="outline" className="text-[9px] px-1.5">
                            {COHORT_TYPES.find(c => c.value === student.cohort_type)?.label || student.cohort_type}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {student.ky_form_completed
                          ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                          : <X className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {student.has_collaborator_profile
                          ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" />
                          : <X className="w-3.5 h-3.5 text-muted-foreground/40 mx-auto" />}
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground py-2">{student.mbti_type || '—'}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground py-2">{student.city || '—'}</TableCell>
                      <TableCell className="py-2">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-xs text-muted-foreground py-8">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {filtered.length > 0 && (
              <div className="px-4 py-2 border-t border-border/40 text-[10px] text-muted-foreground">
                {selectedIds.size > 0 ? `${selectedIds.size} of ` : ''}{filtered.length} students
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet — renders grouped bento sections with photos,
          proper labels, clickable email/phone, etc. Driven by
          src/lib/kyFieldSchema.ts so the CSV export and this UI stay
          in lockstep. */}
      <StudentDetailSheet student={detailStudent} onClose={() => setDetailStudent(null)} />
    </div>
  );
}

const AdminKYForms: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const hasSeeded = useRef(false);

  useEffect(() => { fetchForms(); }, []);

  const fetchForms = async () => {
    setLoading(true);
    const { data: formsData, error: formsError } = await supabase.from('ky_forms').select('*').order('cohort_type');
    if (formsError) { console.error('Error fetching forms:', formsError); setLoading(false); return; }

    const formsWithSteps: Form[] = await Promise.all(
      (formsData || []).map(async (form) => {
        const { data: steps } = await supabase.from('ky_form_steps').select('*').eq('form_id', form.id).order('order_index');
        const stepsWithFields: FormStep[] = await Promise.all(
          (steps || []).map(async (step) => {
            const { data: fields } = await supabase.from('ky_form_fields').select('*').eq('step_id', step.id).order('order_index');
            return {
              id: step.id, title: step.title, description: step.description || '', icon: step.icon,
              order_index: step.order_index,
              fields: (fields || []).map(f => ({
                id: f.id, field_key: f.field_key, label: f.label, field_type: f.field_type,
                placeholder: f.placeholder || '', helper_text: f.helper_text || '', is_required: f.is_required,
                options: Array.isArray(f.options) ? (f.options as { value: string; label: string }[]) : [],
                order_index: f.order_index, grid_cols: f.grid_cols || 1,
              })),
            };
          })
        );
        return { id: form.id, cohort_type: form.cohort_type, name: form.name, description: form.description || '', is_active: form.is_active, steps: stepsWithFields };
      })
    );

    if ((formsData || []).length === 0 && !hasSeeded.current) {
      hasSeeded.current = true;
      await seedFormsFromConfig();
      return;
    }
    setForms(formsWithSteps);
    setLoading(false);
  };

  const mapFieldType = (type: string): string => {
    const typeMap: Record<string, string> = { 'proficiency-grid': 'proficiency', 'tags': 'multi_select', 'mbti': 'select', 'chronotype': 'radio', 'meal-preference': 'radio', 'tshirt-size': 'select', 'pill-select': 'radio', 'country-state': 'text', 'multi-select': 'multi_select', 'phone': 'tel', 'photo': 'photo_upload' };
    return typeMap[type] || type;
  };

  const getOptionsForSpecialType = (field: SectionStepField): { value: string; label: string }[] => {
    if (field.options && field.options.length > 0) return field.options.map(o => ({ value: o.value, label: o.label }));
    switch (field.type) {
      case 'mbti': return ['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'].map(t => ({ value: t, label: t }));
      case 'meal-preference': return [{ value: 'veg', label: 'Vegetarian' }, { value: 'non_veg', label: 'Non-Vegetarian' }, { value: 'vegan', label: 'Vegan' }, { value: 'eggetarian', label: 'Eggetarian' }];
      case 'tshirt-size': return ['XS','S','M','L','XL','XXL'].map(s => ({ value: s.toLowerCase(), label: s }));
      case 'proficiency-grid': return (field.levels || []).map(l => ({ value: l.toLowerCase(), label: l }));
      default: return [];
    }
  };

  const seedFormsFromConfig = async () => {
    const cohortTypes: Array<'FORGE' | 'FORGE_CREATORS' | 'FORGE_WRITING'> = ['FORGE', 'FORGE_CREATORS', 'FORGE_WRITING'];
    for (const cohortType of cohortTypes) {
      const sections = getSectionsForCohort(cohortType);
      const kySections = sections.filter(s => s.key !== 'community_profile');
      const formName = cohortType === 'FORGE' ? 'Know Your Filmmaker' : cohortType === 'FORGE_CREATORS' ? 'Know Your Creator' : 'Know Your Writer';
      const { data: newForm, error: formError } = await supabase.from('ky_forms').insert({ cohort_type: cohortType, name: formName, description: kySections.map(s => s.title).join(', '), is_active: true }).select().single();
      if (formError || !newForm) { console.error('Error seeding form:', formError); continue; }
      let stepIndex = 0;
      for (const section of kySections) {
        for (const step of section.steps) {
          const { data: newStep, error: stepError } = await supabase.from('ky_form_steps').insert({ form_id: newForm.id, title: `${section.title} — ${step.title}`, description: step.subtitle || '', icon: 'Sparkles', order_index: stepIndex }).select().single();
          if (stepError || !newStep) { console.error('Error seeding step:', stepError); continue; }
          for (let fi = 0; fi < step.fields.length; fi++) {
            const field = step.fields[fi];
            if (field.type === 'proficiency-grid' && field.skills) {
              for (let si = 0; si < field.skills.length; si++) {
                const skill = field.skills[si];
                await supabase.from('ky_form_fields').insert({ step_id: newStep.id, field_key: skill.key, label: skill.label, field_type: 'proficiency' as any, placeholder: '', helper_text: '', is_required: false, options: (field.levels || []).map(l => ({ value: l.toLowerCase(), label: l })), order_index: fi * 10 + si, grid_cols: 1 });
              }
            } else {
              await supabase.from('ky_form_fields').insert({ step_id: newStep.id, field_key: field.key, label: field.label, field_type: mapFieldType(field.type) as any, placeholder: field.placeholder || '', helper_text: field.helperText || '', is_required: field.required || false, options: getOptionsForSpecialType(field), order_index: fi, grid_cols: field.columns || 1 });
            }
          }
          stepIndex++;
        }
      }
    }
    toast({ title: 'Forms auto-populated from existing definitions!' });
    await fetchForms();
  };

  const createNewForm = (cohortType: string) => {
    const newForm: Form = {
      cohort_type: cohortType, name: `Know Your ${cohortType === 'FORGE' ? 'Filmmaker' : cohortType === 'FORGE_CREATORS' ? 'Creator' : 'Writer'}`,
      description: '', is_active: true,
      steps: [
        { title: 'General Details', description: "Let's start with the basics", icon: 'User', order_index: 0, fields: [{ field_key: 'certificate_name', label: 'Full name (as you want it on your certificate)', field_type: 'text', placeholder: '', helper_text: '', is_required: true, options: [], order_index: 0, grid_cols: 1 }] },
        { title: 'Terms & Conditions', description: '', icon: 'FileCheck', order_index: 1, fields: [{ field_key: 'terms_accepted', label: 'I agree to the terms and conditions of the Forge program', field_type: 'checkbox', placeholder: '', helper_text: '', is_required: true, options: [], order_index: 0, grid_cols: 1 }] },
      ],
    };
    setSelectedForm(newForm);
  };

  const addStep = () => {
    if (!selectedForm) return;
    setSelectedForm({ ...selectedForm, steps: [...selectedForm.steps, { title: 'New Step', description: '', icon: 'Sparkles', order_index: selectedForm.steps.length, fields: [] }] });
  };

  const updateStep = (index: number, updates: Partial<FormStep>) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const removeStep = (index: number) => {
    if (!selectedForm) return;
    setSelectedForm({ ...selectedForm, steps: selectedForm.steps.filter((_, i) => i !== index) });
  };

  const addField = (stepIndex: number) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    newSteps[stepIndex].fields.push({ field_key: `field_${Date.now()}`, label: 'New Field', field_type: 'text', placeholder: '', helper_text: '', is_required: false, options: [], order_index: newSteps[stepIndex].fields.length, grid_cols: 1 });
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const updateField = (stepIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    newSteps[stepIndex].fields[fieldIndex] = { ...newSteps[stepIndex].fields[fieldIndex], ...updates };
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const removeField = (stepIndex: number, fieldIndex: number) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    newSteps[stepIndex].fields = newSteps[stepIndex].fields.filter((_, i) => i !== fieldIndex);
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const addOption = (stepIndex: number, fieldIndex: number) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    newSteps[stepIndex].fields[fieldIndex].options = [...newSteps[stepIndex].fields[fieldIndex].options, { value: `option_${Date.now()}`, label: 'New Option' }];
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const updateOption = (stepIndex: number, fieldIndex: number, optionIndex: number, label: string) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    newSteps[stepIndex].fields[fieldIndex].options[optionIndex] = { label, value: label.toLowerCase().replace(/\s+/g, '_') };
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const removeOption = (stepIndex: number, fieldIndex: number, optionIndex: number) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    newSteps[stepIndex].fields[fieldIndex].options = newSteps[stepIndex].fields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const saveForm = async () => {
    if (!selectedForm) return;
    setSaving(true);
    try {
      let formId = selectedForm.id;
      if (formId) {
        await supabase.from('ky_forms').update({ name: selectedForm.name, description: selectedForm.description, is_active: selectedForm.is_active }).eq('id', formId);
      } else {
        const { data: newForm, error } = await supabase.from('ky_forms').insert({ cohort_type: selectedForm.cohort_type as 'FORGE' | 'FORGE_CREATORS' | 'FORGE_WRITING', name: selectedForm.name, description: selectedForm.description, is_active: selectedForm.is_active }).select().single();
        if (error) throw error;
        formId = newForm.id;
      }
      if (selectedForm.id) {
        const { data: existingSteps } = await supabase.from('ky_form_steps').select('id').eq('form_id', formId);
        if (existingSteps) {
          for (const step of existingSteps) { await supabase.from('ky_form_fields').delete().eq('step_id', step.id); }
          await supabase.from('ky_form_steps').delete().eq('form_id', formId);
        }
      }
      for (let i = 0; i < selectedForm.steps.length; i++) {
        const step = selectedForm.steps[i];
        const { data: newStep, error: stepError } = await supabase.from('ky_form_steps').insert({ form_id: formId, title: step.title, description: step.description, icon: step.icon, order_index: i }).select().single();
        if (stepError) throw stepError;
        for (let j = 0; j < step.fields.length; j++) {
          const field = step.fields[j];
          const { error: fieldError } = await supabase.from('ky_form_fields').insert({ step_id: newStep.id, field_key: field.field_key, label: field.label, field_type: field.field_type as any, placeholder: field.placeholder, helper_text: field.helper_text, is_required: field.is_required, options: field.options, order_index: j, grid_cols: field.grid_cols });
          if (fieldError) throw fieldError;
        }
      }
      toast({ title: 'Form saved successfully!' });
      await fetchForms();
      setSelectedForm(null);
    } catch (error: any) {
      toast({ title: 'Error saving form', description: error.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const duplicateForm = (form: Form, newCohortType: string) => {
    setSelectedForm({
      ...form, id: undefined, cohort_type: newCohortType,
      name: `Know Your ${newCohortType === 'FORGE' ? 'Filmmaker' : newCohortType === 'FORGE_CREATORS' ? 'Creator' : 'Writer'}`,
      steps: form.steps.map(s => ({ ...s, id: undefined, fields: s.fields.map(f => ({ ...f, id: undefined })) })),
    });
  };

  const downloadResponses = async (cohortType: string) => {
    const tableMap: Record<string, string> = { 'FORGE': 'kyf_responses', 'FORGE_CREATORS': 'kyc_responses', 'FORGE_WRITING': 'kyw_responses' };
    const tableName = tableMap[cohortType];
    if (!tableName) return;
    try {
      toast({ title: 'Preparing CSV...' });
      const [responsesRes, profilesRes] = await Promise.all([supabase.from(tableName as any).select('*'), supabase.from('profiles').select('id, full_name, email')]);
      if (responsesRes.error) throw responsesRes.error;
      const responses = responsesRes.data || [];
      if (responses.length === 0) { toast({ title: 'No responses found', variant: 'destructive' }); return; }
      const profileMap = new Map<string, { full_name: string; email: string }>();
      (profilesRes.data || []).forEach((p: any) => { profileMap.set(p.id, { full_name: p.full_name || '', email: p.email || '' }); });
      const allKeys = Object.keys(responses[0]).filter(k => k !== 'id');
      const headers = ['user_name', 'user_email', ...allKeys];
      const escapeCSV = (val: any): string => { if (val === null || val === undefined) return ''; const str = Array.isArray(val) ? val.join('; ') : typeof val === 'object' ? JSON.stringify(val) : String(val); return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str; };
      const rows = responses.map((row: any) => { const profile = profileMap.get(row.user_id) || { full_name: '', email: '' }; return [escapeCSV(profile.full_name), escapeCSV(profile.email), ...allKeys.map(k => escapeCSV(row[k]))].join(','); });
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ky-responses-${cohortType.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast({ title: 'CSV downloaded!' });
    } catch (error: any) { toast({ title: 'Download failed', description: error.message, variant: 'destructive' }); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">KY Forms</h1>
        <p className="text-muted-foreground text-xs mt-0.5">View student data & manage form configuration</p>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="students" className="text-xs">Student Data</TabsTrigger>
          <TabsTrigger value="builder" className="text-xs">Form Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentDataTab />
        </TabsContent>

        <TabsContent value="builder">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : !selectedForm ? (
            <div className="grid gap-4 md:grid-cols-3">
              {COHORT_TYPES.map((cohort) => {
                const existingForm = forms.find((f) => f.cohort_type === cohort.value);
                return (
                  <Card key={cohort.value}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {cohort.label}
                        {existingForm?.is_active && <Badge variant="secondary">Active</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {existingForm ? (
                        <>
                          <p className="text-sm text-muted-foreground">{existingForm.steps.length} steps, {existingForm.steps.reduce((acc, s) => acc + s.fields.length, 0)} fields</p>
                          <div className="flex gap-2">
                            <Button onClick={() => setSelectedForm(existingForm)} className="flex-1"><Settings className="h-4 w-4 mr-2" />Edit</Button>
                            <Button variant="outline" size="icon" onClick={() => downloadResponses(cohort.value)} title="Download Responses CSV"><Download className="h-4 w-4" /></Button>
                            <Dialog>
                              <DialogTrigger asChild><Button variant="outline" size="icon"><Copy className="h-4 w-4" /></Button></DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Duplicate Form To</DialogTitle></DialogHeader>
                                <div className="space-y-2">
                                  {COHORT_TYPES.filter((c) => c.value !== cohort.value).map((c) => (
                                    <Button key={c.value} variant="outline" className="w-full" onClick={() => duplicateForm(existingForm, c.value)}>{c.label}</Button>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </>
                      ) : (
                        <Button onClick={() => createNewForm(cohort.value)} className="w-full"><Plus className="h-4 w-4 mr-2" />Create Form</Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setSelectedForm(null)}>← Back to Forms</Button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch checked={selectedForm.is_active} onCheckedChange={(checked) => setSelectedForm({ ...selectedForm, is_active: checked })} />
                    <Label>Active</Label>
                  </div>
                  <Button onClick={saveForm} disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Form'}</Button>
                </div>
              </div>

              <Card>
                <CardHeader><CardTitle>Form Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Form Name</Label><Input value={selectedForm.name} onChange={(e) => setSelectedForm({ ...selectedForm, name: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Cohort Type</Label><Input value={COHORT_TYPES.find((c) => c.value === selectedForm.cohort_type)?.label} disabled /></div>
                  </div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={selectedForm.description} onChange={(e) => setSelectedForm({ ...selectedForm, description: e.target.value })} /></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Form Steps</CardTitle>
                  <Button onClick={addStep} size="sm"><Plus className="h-4 w-4 mr-2" />Add Step</Button>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {selectedForm.steps.map((step, stepIndex) => (
                      <AccordionItem key={stepIndex} value={`step-${stepIndex}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{step.title}</span>
                            <Badge variant="outline">{step.fields.length} fields</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2"><Label>Step Title</Label><Input value={step.title} onChange={(e) => updateStep(stepIndex, { title: e.target.value })} /></div>
                            <div className="space-y-2">
                              <Label>Icon</Label>
                              <Select value={step.icon} onValueChange={(v) => updateStep(stepIndex, { icon: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{ICONS.map((icon) => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2"><Label>Description</Label><Input value={step.description} onChange={(e) => updateStep(stepIndex, { description: e.target.value })} /></div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base">Fields</Label>
                              <Button onClick={() => addField(stepIndex)} size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" />Add Field</Button>
                            </div>
                            {step.fields.map((field, fieldIndex) => (
                              <Card key={fieldIndex} className="p-4">
                                <div className="space-y-4">
                                  <div className="flex items-start justify-between">
                                    <div className="grid gap-4 md:grid-cols-4 flex-1">
                                      <div className="space-y-2"><Label>Field Key</Label><Input value={field.field_key} onChange={(e) => updateField(stepIndex, fieldIndex, { field_key: e.target.value })} /></div>
                                      <div className="space-y-2"><Label>Label</Label><Input value={field.label} onChange={(e) => updateField(stepIndex, fieldIndex, { label: e.target.value })} /></div>
                                      <div className="space-y-2">
                                        <Label>Field Type</Label>
                                        <Select value={field.field_type} onValueChange={(v) => updateField(stepIndex, fieldIndex, { field_type: v })}>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>{FIELD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex items-end gap-2">
                                        <div className="flex items-center gap-2">
                                          <Switch checked={field.is_required} onCheckedChange={(checked) => updateField(stepIndex, fieldIndex, { is_required: checked })} />
                                          <Label>Required</Label>
                                        </div>
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeField(stepIndex, fieldIndex)}><Trash2 className="h-4 w-4" /></Button>
                                  </div>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2"><Label>Placeholder</Label><Input value={field.placeholder} onChange={(e) => updateField(stepIndex, fieldIndex, { placeholder: e.target.value })} /></div>
                                    <div className="space-y-2"><Label>Helper Text</Label><Input value={field.helper_text} onChange={(e) => updateField(stepIndex, fieldIndex, { helper_text: e.target.value })} /></div>
                                  </div>
                                  {['select', 'radio', 'multi_select', 'proficiency'].includes(field.field_type) && (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Label>Options</Label>
                                        <Button onClick={() => addOption(stepIndex, fieldIndex)} size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" />Add Option</Button>
                                      </div>
                                      <div className="space-y-2">
                                        {field.options.map((option, optionIndex) => (
                                          <div key={optionIndex} className="flex items-center gap-2">
                                            <Input value={option.label} onChange={(e) => updateOption(stepIndex, fieldIndex, optionIndex, e.target.value)} placeholder="Option label" />
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeOption(stepIndex, fieldIndex, optionIndex)}><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => removeStep(stepIndex)} className="mt-4"><Trash2 className="h-4 w-4 mr-2" />Delete Step</Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminKYForms;

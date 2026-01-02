import React, { useState, useEffect } from 'react';
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
import { Plus, Trash2, GripVertical, Save, Copy, Settings } from 'lucide-react';

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
  { value: 'FORGE', label: 'Forge Filmmaking' },
  { value: 'FORGE_CREATORS', label: 'Forge Creators' },
  { value: 'FORGE_WRITING', label: 'Forge Writing' },
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

const AdminKYForms: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    
    const { data: formsData, error: formsError } = await supabase
      .from('ky_forms')
      .select('*')
      .order('cohort_type');

    if (formsError) {
      console.error('Error fetching forms:', formsError);
      setLoading(false);
      return;
    }

    const formsWithSteps: Form[] = await Promise.all(
      (formsData || []).map(async (form) => {
        const { data: steps } = await supabase
          .from('ky_form_steps')
          .select('*')
          .eq('form_id', form.id)
          .order('order_index');

        const stepsWithFields: FormStep[] = await Promise.all(
          (steps || []).map(async (step) => {
            const { data: fields } = await supabase
              .from('ky_form_fields')
              .select('*')
              .eq('step_id', step.id)
              .order('order_index');

            return {
              id: step.id,
              title: step.title,
              description: step.description || '',
              icon: step.icon,
              order_index: step.order_index,
              fields: (fields || []).map(f => ({
                id: f.id,
                field_key: f.field_key,
                label: f.label,
                field_type: f.field_type,
                placeholder: f.placeholder || '',
                helper_text: f.helper_text || '',
                is_required: f.is_required,
                options: Array.isArray(f.options) ? (f.options as { value: string; label: string }[]) : [],
                order_index: f.order_index,
                grid_cols: f.grid_cols || 1,
              })),
            };
          })
        );

        return {
          id: form.id,
          cohort_type: form.cohort_type,
          name: form.name,
          description: form.description || '',
          is_active: form.is_active,
          steps: stepsWithFields,
        };
      })
    );

    setForms(formsWithSteps);
    setLoading(false);
  };

  const createNewForm = (cohortType: string) => {
    const newForm: Form = {
      cohort_type: cohortType,
      name: `Know Your ${cohortType === 'FORGE' ? 'Filmmaker' : cohortType === 'FORGE_CREATORS' ? 'Creator' : 'Writer'}`,
      description: '',
      is_active: true,
      steps: [
        {
          title: 'General Details',
          description: 'Let\'s start with the basics',
          icon: 'User',
          order_index: 0,
          fields: [
            { field_key: 'certificate_name', label: 'Full name (as you want it on your certificate)', field_type: 'text', placeholder: '', helper_text: '', is_required: true, options: [], order_index: 0, grid_cols: 1 },
          ],
        },
        {
          title: 'Terms & Conditions',
          description: '',
          icon: 'FileCheck',
          order_index: 1,
          fields: [
            { field_key: 'terms_accepted', label: 'I agree to the terms and conditions of the Forge program', field_type: 'checkbox', placeholder: '', helper_text: '', is_required: true, options: [], order_index: 0, grid_cols: 1 },
          ],
        },
      ],
    };
    setSelectedForm(newForm);
  };

  const addStep = () => {
    if (!selectedForm) return;
    const newStep: FormStep = {
      title: 'New Step',
      description: '',
      icon: 'Sparkles',
      order_index: selectedForm.steps.length,
      fields: [],
    };
    setSelectedForm({ ...selectedForm, steps: [...selectedForm.steps, newStep] });
  };

  const updateStep = (index: number, updates: Partial<FormStep>) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const removeStep = (index: number) => {
    if (!selectedForm) return;
    const newSteps = selectedForm.steps.filter((_, i) => i !== index);
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const addField = (stepIndex: number) => {
    if (!selectedForm) return;
    const newField: FormField = {
      field_key: `field_${Date.now()}`,
      label: 'New Field',
      field_type: 'text',
      placeholder: '',
      helper_text: '',
      is_required: false,
      options: [],
      order_index: selectedForm.steps[stepIndex].fields.length,
      grid_cols: 1,
    };
    const newSteps = [...selectedForm.steps];
    newSteps[stepIndex].fields.push(newField);
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
    const field = newSteps[stepIndex].fields[fieldIndex];
    field.options = [...field.options, { value: `option_${Date.now()}`, label: 'New Option' }];
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const updateOption = (stepIndex: number, fieldIndex: number, optionIndex: number, label: string) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    const field = newSteps[stepIndex].fields[fieldIndex];
    field.options[optionIndex] = { ...field.options[optionIndex], label, value: label.toLowerCase().replace(/\s+/g, '_') };
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const removeOption = (stepIndex: number, fieldIndex: number, optionIndex: number) => {
    if (!selectedForm) return;
    const newSteps = [...selectedForm.steps];
    const field = newSteps[stepIndex].fields[fieldIndex];
    field.options = field.options.filter((_, i) => i !== optionIndex);
    setSelectedForm({ ...selectedForm, steps: newSteps });
  };

  const saveForm = async () => {
    if (!selectedForm) return;
    setSaving(true);

    try {
      let formId = selectedForm.id;

      // Create or update form
      if (formId) {
        await supabase
          .from('ky_forms')
          .update({
            name: selectedForm.name,
            description: selectedForm.description,
            is_active: selectedForm.is_active,
          })
          .eq('id', formId);
      } else {
        const { data: newForm, error } = await supabase
          .from('ky_forms')
          .insert({
            cohort_type: selectedForm.cohort_type as 'FORGE' | 'FORGE_CREATORS' | 'FORGE_WRITING',
            name: selectedForm.name,
            description: selectedForm.description,
            is_active: selectedForm.is_active,
          })
          .select()
          .single();

        if (error) throw error;
        formId = newForm.id;
      }

      // Delete existing steps and fields
      if (selectedForm.id) {
        const { data: existingSteps } = await supabase
          .from('ky_form_steps')
          .select('id')
          .eq('form_id', formId);

        if (existingSteps) {
          for (const step of existingSteps) {
            await supabase.from('ky_form_fields').delete().eq('step_id', step.id);
          }
          await supabase.from('ky_form_steps').delete().eq('form_id', formId);
        }
      }

      // Create new steps and fields
      for (let i = 0; i < selectedForm.steps.length; i++) {
        const step = selectedForm.steps[i];
        const { data: newStep, error: stepError } = await supabase
          .from('ky_form_steps')
          .insert({
            form_id: formId,
            title: step.title,
            description: step.description,
            icon: step.icon,
            order_index: i,
          })
          .select()
          .single();

        if (stepError) throw stepError;

        for (let j = 0; j < step.fields.length; j++) {
          const field = step.fields[j];
          const { error: fieldError } = await supabase
            .from('ky_form_fields')
            .insert({
              step_id: newStep.id,
              field_key: field.field_key,
              label: field.label,
              field_type: field.field_type as 'text' | 'email' | 'number' | 'date' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'multi_select' | 'proficiency' | 'photo_upload',
              placeholder: field.placeholder,
              helper_text: field.helper_text,
              is_required: field.is_required,
              options: field.options,
              order_index: j,
              grid_cols: field.grid_cols,
            });

          if (fieldError) throw fieldError;
        }
      }

      toast({ title: 'Form saved successfully!' });
      await fetchForms();
      setSelectedForm(null);
    } catch (error: any) {
      toast({ title: 'Error saving form', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const duplicateForm = (form: Form, newCohortType: string) => {
    const duplicated: Form = {
      ...form,
      id: undefined,
      cohort_type: newCohortType,
      name: `Know Your ${newCohortType === 'FORGE' ? 'Filmmaker' : newCohortType === 'FORGE_CREATORS' ? 'Creator' : 'Writer'}`,
      steps: form.steps.map(s => ({
        ...s,
        id: undefined,
        fields: s.fields.map(f => ({ ...f, id: undefined })),
      })),
    };
    setSelectedForm(duplicated);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">KY Form Builder</h1>
          <p className="text-muted-foreground">Configure dynamic forms for each cohort type</p>
        </div>
      </div>

      {!selectedForm ? (
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
                      <p className="text-sm text-muted-foreground">
                        {existingForm.steps.length} steps, {existingForm.steps.reduce((acc, s) => acc + s.fields.length, 0)} fields
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={() => setSelectedForm(existingForm)} className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Duplicate Form To</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                              {COHORT_TYPES.filter((c) => c.value !== cohort.value).map((c) => (
                                <Button
                                  key={c.value}
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => duplicateForm(existingForm, c.value)}
                                >
                                  {c.label}
                                </Button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </>
                  ) : (
                    <Button onClick={() => createNewForm(cohort.value)} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Form
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedForm(null)}>
              ← Back to Forms
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={selectedForm.is_active}
                  onCheckedChange={(checked) => setSelectedForm({ ...selectedForm, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <Button onClick={saveForm} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Form'}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Form Name</Label>
                  <Input
                    value={selectedForm.name}
                    onChange={(e) => setSelectedForm({ ...selectedForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cohort Type</Label>
                  <Input value={COHORT_TYPES.find((c) => c.value === selectedForm.cohort_type)?.label} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={selectedForm.description}
                  onChange={(e) => setSelectedForm({ ...selectedForm, description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Form Steps</CardTitle>
              <Button onClick={addStep} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
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
                        <div className="space-y-2">
                          <Label>Step Title</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => updateStep(stepIndex, { title: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <Select
                            value={step.icon}
                            onValueChange={(v) => updateStep(stepIndex, { icon: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ICONS.map((icon) => (
                                <SelectItem key={icon} value={icon}>
                                  {icon}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={step.description}
                            onChange={(e) => updateStep(stepIndex, { description: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-base">Fields</Label>
                          <Button onClick={() => addField(stepIndex)} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                        </div>

                        {step.fields.map((field, fieldIndex) => (
                          <Card key={fieldIndex} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="grid gap-4 md:grid-cols-4 flex-1">
                                  <div className="space-y-2">
                                    <Label>Field Key</Label>
                                    <Input
                                      value={field.field_key}
                                      onChange={(e) => updateField(stepIndex, fieldIndex, { field_key: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Label</Label>
                                    <Input
                                      value={field.label}
                                      onChange={(e) => updateField(stepIndex, fieldIndex, { label: e.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Field Type</Label>
                                    <Select
                                      value={field.field_type}
                                      onValueChange={(v) => updateField(stepIndex, fieldIndex, { field_type: v })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {FIELD_TYPES.map((t) => (
                                          <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-end gap-2">
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={field.is_required}
                                        onCheckedChange={(checked) => updateField(stepIndex, fieldIndex, { is_required: checked })}
                                      />
                                      <Label>Required</Label>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => removeField(stepIndex, fieldIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Placeholder</Label>
                                  <Input
                                    value={field.placeholder}
                                    onChange={(e) => updateField(stepIndex, fieldIndex, { placeholder: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Helper Text</Label>
                                  <Input
                                    value={field.helper_text}
                                    onChange={(e) => updateField(stepIndex, fieldIndex, { helper_text: e.target.value })}
                                  />
                                </div>
                              </div>

                              {['select', 'radio', 'multi_select', 'proficiency'].includes(field.field_type) && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label>Options</Label>
                                    <Button onClick={() => addOption(stepIndex, fieldIndex)} size="sm" variant="outline">
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Option
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    {field.options.map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex items-center gap-2">
                                        <Input
                                          value={option.label}
                                          onChange={(e) => updateOption(stepIndex, fieldIndex, optionIndex, e.target.value)}
                                          placeholder="Option label"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-destructive"
                                          onClick={() => removeOption(stepIndex, fieldIndex, optionIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeStep(stepIndex)}
                        className="mt-4"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Step
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminKYForms;

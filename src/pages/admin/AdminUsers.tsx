import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, Edit, Loader2, Trash2, AlertTriangle, Upload, Users, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Edition = Database['public']['Tables']['editions']['Row'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

// Edition 14 Filmmaking Goa Students
const EDITION_14_STUDENTS = [
  { full_name: "Ashish Maske", email: "ashish.maske89@gmail.com", phone: "9561317768" },
  { full_name: "Mukul Das", email: "mukuldas77@gmail.com", phone: "8553849837" },
  { full_name: "Karthik Rengasamy", email: "karthik.rengasamy.work@gmail.com", phone: "919944647016" },
  { full_name: "Sandeep Kumar H", email: "sandukumarh@gmail.com", phone: "918860476865" },
  { full_name: "Balgopal Hota", email: "balgopalh@gmail.com", phone: "917749041226" },
  { full_name: "Krishna Dev Sharma", email: "kd6279@gmail.com", phone: "919810244550" },
  { full_name: "Rajeshkumar Bachu", email: "rajk.bachu@gmail.com", phone: "7989256200" },
  { full_name: "Srikanth Dangetti", email: "srikanthdangeti@gmail.com", phone: "919573800042" },
  { full_name: "Kabishek", email: "ka.ek2121@gmail.com", phone: "6383197396" },
  { full_name: "Sushant Sinha", email: "writetosushantsinha@gmail.com", phone: "9665142117" },
  { full_name: "Praveen Choudari", email: "praveenbchoudari@gmail.com", phone: "7019809364" },
  { full_name: "Milee Patel", email: "patelmilee903@gmail.com", phone: "8849998216" },
  { full_name: "Anunay Gupta", email: "anunayg2001@gmail.com", phone: "8318674416" },
  { full_name: "Sourav Saha", email: "souravsaha.here@gmail.com", phone: "6297876090" },
  { full_name: "Sandeep Pradhan", email: "drsandyscbaiims@gmail.com", phone: "7978134375" },
  { full_name: "Kalyan Chakravarthy", email: "chakravarthy.ca@gmail.com", phone: "9962579968" },
  { full_name: "Anshul Karasi", email: "anshulkarasi009@gmail.com", phone: "7406654816" },
  { full_name: "Omkar Devane", email: "omkardevane@gmail.com", phone: "9167957262" },
  { full_name: "Kishore", email: "kishor.ramakrishna@gmail.com", phone: "31628051304" },
  { full_name: "Ranjeeth", email: "branjeeth97@gmail.com", phone: "8867523877" },
  { full_name: "Vineeth Reddy", email: "vineethreddy.vakiti@gmail.com", phone: "9550046000" },
  { full_name: "Raj Vudali", email: "raj.vudali@gmail.com", phone: "9731000795" },
  { full_name: "Aniket Dolas", email: "aniketdolas424@gmail.com", phone: "7620971766" },
  { full_name: "Nandipati Adi Siva Sai Kartheek", email: "kartheek.0774@gmail.com", phone: "8247702956" },
];

const EDITION_14_ID = "1b9e4712-1965-47ef-9fb5-dfb1beaf7e54";

// Edition 15 Filmmaking Goa Students
const EDITION_15_STUDENTS = [
  { full_name: "Nilesh Dattatray Shinde", email: "nileshshinde2301106@gmail.com", phone: "7385290178" },
  { full_name: "Jay Arora", email: "jayaroranyc@gmail.com", phone: "9870499422" },
  { full_name: "Swati Jain", email: "swatzain@yahoo.com", phone: "9845116683" },
  { full_name: "Jay", email: "jaisimha078@gmail.com", phone: "8639529860" },
  { full_name: "Vaibhav Kammar", email: "vaibhav.but.filmmaking@gmail.com", phone: "8147646756" },
  { full_name: "Rajnikant Revabhai Parmar", email: "rjparmar09@gmail.com", phone: "14164736585" },
  { full_name: "Jayanth Moharier", email: "moherier.jayanth@gmail.com", phone: "12674371621" },
  { full_name: "Imran Khan", email: "aceik346@gmail.com", phone: "9845920258" },
  { full_name: "Asishey Uranw", email: "at7050791@gmail.com", phone: "6299706776" },
  { full_name: "Krunal Pandya", email: "mr.krunalpandya@gmail.com", phone: "8980701011" },
  { full_name: "Manoj Kinger", email: "manoj.kinger@outlook.com", phone: "9971369702" },
  { full_name: "Ravi Singh", email: "mithepurfarms@gmail.com", phone: "9873832002" },
  { full_name: "Anil Kumar Bhaskar", email: "anil.bhaskar9899@gmail.com", phone: "9871920726" },
  { full_name: "V Sai Rithik Reddy", email: "rithikreddy247@gmail.com", phone: "9989097237" },
  { full_name: "Pramod Kumar", email: "pramod0511kumar@gmail.com", phone: "9980614869" },
  { full_name: "Sockalingam", email: "socklin91096@gmail.com", phone: "7397779870" },
  { full_name: "Ruthvik Veera", email: "ww.ruthvik@gmail.com", phone: "9502624969" },
  { full_name: "Asit Aanand", email: "asitaanand10887@gmail.com", phone: "8175903388" },
  { full_name: "Ajinkya Sambhare", email: "ajinkyasambhare2411@gmail.com", phone: "9175356723" },
  { full_name: "Adarsh Ranjan Jha", email: "adarshrjha@gmail.com", phone: "918851733625" },
  { full_name: "Ashik Salim", email: "ashik6@gmail.com", phone: "919746575743" },
  { full_name: "Kanan Bahl", email: "kananbahl@gmail.com", phone: "9205742633" },
  { full_name: "Anirudh G S", email: "gsanirudh123@gmail.com", phone: "9019145543" },
  { full_name: "Ravi Kiran", email: "bychancebychoice@gmail.com", phone: "9866094144" },
];

const EDITION_15_ID = "ec048e00-421e-4ceb-bcc0-df675173b296";

// Creators Edition 1 Bali Students
const CREATORS_E1_STUDENTS = [
  { full_name: "Vanmathi", email: "vanmathi@uvagro.com", phone: "919442921029" },
  { full_name: "Varsha", email: "varsha.babani@gmail.com", phone: "919892873704" },
  { full_name: "Arush Thapar", email: "arush@brandingpioneers.com", phone: "919789565515" },
  { full_name: "Siddharth", email: "sid.balhara1694@gmail.com", phone: "917290051900" },
  { full_name: "Naveen Nagdaune", email: "nnnaveenhot7@gmail.com", phone: "919522222521" },
  { full_name: "Pankaj Kumar", email: "forpankaj.prasar@gmail.com", phone: "9074451965" },
  { full_name: "Mohammad Kashif", email: "kashif170017@gmail.com", phone: "918273336161" },
  { full_name: "Manoj", email: "manoj.pothani@gmail.com", phone: "919700987224" },
  { full_name: "Shoaib", email: "shoaibmustaque10@gmail.com", phone: "7980978482" },
  { full_name: "Sajitha", email: "sajidashaje@gmail.com", phone: "8921587407" }
];

const CREATORS_E1_ID = "da818745-0904-41b6-8182-3a338265dd68";

// Creators Edition 2 Goa Students
const CREATORS_E2_GOA_STUDENTS = [
  { full_name: "Suryanarayanan", email: "surya.ckv@gmail.com", phone: "9884461009" },
  { full_name: "Reema Abbas", email: "reema.abbas0786@gmail.com", phone: "7042745425" },
  { full_name: "Prashan Saraf", email: "saraf.prashant72@gmail.com", phone: "9820065475" },
  { full_name: "Rohit Alluri", email: "rohit@leamss.com", phone: "7718882427" },
  { full_name: "Shivain Sacheti", email: "sachetishivain97@gmail.com", phone: "9079120024" },
  { full_name: "Vinita Tanwani", email: "vinitaatanwani@gmail.com", phone: "9901307135" },
  { full_name: "Parmeet Singh Chadha", email: "parmeet.wscc@gmail.com", phone: "7699000007" },
  { full_name: "Dr.Karthik Balaji", email: "ubkdental@gmail.com", phone: "919444418307" },
  { full_name: "Mohit Vyas", email: "mohitvyas009@gmail.com", phone: "919660570463" },
  { full_name: "Vinod", email: "vinod.morya@bytesigma.com", phone: "919971034666" },
  { full_name: "Ramesh", email: "ramesh@safestorage.in", phone: "9686566697" },
  { full_name: "Raghul Ravi", email: "raghulravidx@gmail.com", phone: "9150175026" },
  { full_name: "Sathimaa", email: "we.are.sacredbody@gmail.com", phone: "918792689234" },
  { full_name: "Nishit Badaya", email: "nishitbadaya18@gmail.com", phone: "916378311154" },
  { full_name: "Jagruti Shinde", email: "jagruti.c.shinde@gmail.com", phone: "7038524008" },
  { full_name: "Madhav Bairathi", email: "madhav.bairathi@gmail.com", phone: "919079269035" }
];

const CREATORS_E2_GOA_ID = "995324e9-5a14-4d36-8c99-fec40fd35d70";

// Cohort Card Component
function CohortCard({ 
  edition, 
  userCount, 
  onSelect,
  isSelected 
}: { 
  edition: Edition | null; 
  userCount: number; 
  onSelect: () => void;
  isSelected: boolean;
}) {
  const cohortTypeColors: Record<string, string> = {
    'FORGE': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'FORGE_WRITING': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'FORGE_CREATORS': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:border-forge-gold/50 hover:shadow-lg ${
        isSelected ? 'border-forge-gold ring-2 ring-forge-gold/30' : 'border-border/50'
      } ${edition?.is_archived ? 'opacity-60' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {edition ? (
            <Badge variant="outline" className={cohortTypeColors[edition.cohort_type] || ''}>
              {edition.cohort_type.replace('FORGE_', '').replace('FORGE', 'FILMMAKING')}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted/50">NO EDITION</Badge>
          )}
          {edition?.is_archived && (
            <Badge variant="secondary" className="text-xs">Archived</Badge>
          )}
        </div>
        <CardTitle className="text-base line-clamp-2">
          {edition?.name || 'Unassigned Users'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">{userCount}</span>
          <span className="text-muted-foreground text-sm">users</span>
        </div>
      </CardContent>
    </Card>
  );
}


export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(searchParams.get('action') === 'create');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cohort'>('list');
  const [selectedEditionFilter, setSelectedEditionFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Fetch ALL editions for cohort view (including archived)
  const { data: allEditions } = useQuery({
    queryKey: ['editions-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .order('forge_start_date', { ascending: false });
      if (error) throw error;
      return data as Edition[];
    }
  });

  // Fetch active editions for dropdown (exclude archived)
  const { data: editions } = useQuery({
    queryKey: ['editions-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .eq('is_archived', false)
        .order('forge_start_date', { ascending: true });
      if (error) throw error;
      return data as Edition[];
    }
  });

  // Calculate user counts per edition
  const editionUserCounts = useMemo(() => {
    if (!users || !allEditions) return new Map<string | null, number>();
    
    const counts = new Map<string | null, number>();
    counts.set(null, 0); // For unassigned users
    
    allEditions.forEach(edition => counts.set(edition.id, 0));
    
    users.forEach(user => {
      const currentCount = counts.get(user.edition_id) || 0;
      counts.set(user.edition_id, currentCount + 1);
    });
    
    return counts;
  }, [users, allEditions]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      full_name: string;
      phone?: string;
      city?: string;
      edition_id?: string;
      specialty?: string;
      payment_status: PaymentStatus;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('create-user', {
        body: userData
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsCreateOpen(false);
      setSearchParams({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      // Update unlock_level based on payment_status
      const unlock_level = updates.payment_status === 'BALANCE_PAID' ? 'FULL' as const : 'PREVIEW' as const;
      const updateData = {
        ...updates,
        unlock_level
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId }
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('bulk-delete-users', {
        body: { user_ids: userIds }
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data as { deleted: number; failed: number; errors: { email: string; error: string }[] };
    },
    onSuccess: (data) => {
      toast.success(`Deleted ${data.deleted} users${data.failed > 0 ? `, ${data.failed} failed` : ''}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowBulkDeleteConfirm(false);
      setSelectedUserIds(new Set());
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Bulk import Edition 14 students
  const importEdition14Mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < EDITION_14_STUDENTS.length; i++) {
        const student = EDITION_14_STUDENTS[i];
        setImportProgress({ current: i + 1, total: EDITION_14_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Goa",
              edition_id: EDITION_14_ID,
              payment_status: "CONFIRMED_15K"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.error?.message || response.data?.error || 'Unknown error' 
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Edition 14 students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk import Edition 15 students
  const importEdition15Mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < EDITION_15_STUDENTS.length; i++) {
        const student = EDITION_15_STUDENTS[i];
        setImportProgress({ current: i + 1, total: EDITION_15_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Goa",
              edition_id: EDITION_15_ID,
              payment_status: "CONFIRMED_15K"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.error?.message || response.data?.error || 'Unknown error' 
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Edition 15 students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk import Creators Edition 1 Bali students
  const importCreatorsE1Mutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < CREATORS_E1_STUDENTS.length; i++) {
        const student = CREATORS_E1_STUDENTS[i];
        setImportProgress({ current: i + 1, total: CREATORS_E1_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Bali",
              edition_id: CREATORS_E1_ID,
              payment_status: "BALANCE_PAID"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.error?.message || response.data?.error || 'Unknown error' 
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Creators E1 students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Bulk import Creators Edition 2 Goa students (16 students)
  const importCreatorsE2GoaMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const results = { success: 0, failed: 0, errors: [] as { name: string; error: string }[] };
      
      for (let i = 0; i < CREATORS_E2_GOA_STUDENTS.length; i++) {
        const student = CREATORS_E2_GOA_STUDENTS[i];
        setImportProgress({ current: i + 1, total: CREATORS_E2_GOA_STUDENTS.length });
        
        try {
          const response = await supabase.functions.invoke('create-user', {
            body: {
              email: student.email,
              password: "Forge2026!",
              full_name: student.full_name,
              phone: student.phone,
              city: "Goa",
              edition_id: CREATORS_E2_GOA_ID,
              payment_status: "BALANCE_PAID"
            }
          });

          if (response.error || response.data?.error) {
            results.failed++;
            results.errors.push({ 
              name: student.full_name, 
              error: response.error?.message || response.data?.error || 'Unknown error' 
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ 
            name: student.full_name, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    },
    onSuccess: (data) => {
      setImportProgress(null);
      if (data.failed > 0) {
        toast.error(`Imported ${data.success} students, ${data.failed} failed`, {
          description: data.errors.slice(0, 3).map(e => `${e.name}: ${e.error}`).join('\n')
        });
      } else {
        toast.success(`Successfully imported all ${data.success} Creators E2 Goa students!`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setImportProgress(null);
      toast.error(error.message);
    }
  });

  // Filter users by search and edition
  const filteredUsers = useMemo(() => {
    return users?.filter(user => {
      const matchesSearch = 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEdition = 
        selectedEditionFilter === 'all' ||
        (selectedEditionFilter === 'none' && !user.edition_id) ||
        user.edition_id === selectedEditionFilter;
        
      return matchesSearch && matchesEdition;
    });
  }, [users, searchQuery, selectedEditionFilter]);

  const getEditionName = (editionId: string | null) => {
    if (!editionId || !allEditions) return '-';
    const edition = allEditions.find(e => e.id === editionId);
    return edition?.name || '-';
  };

  // Get editions with users for cohort view (sorted by user count)
  const editionsWithUsers = useMemo(() => {
    if (!allEditions) return [];
    
    return allEditions
      .map(edition => ({
        edition,
        userCount: editionUserCounts.get(edition.id) || 0
      }))
      .filter(item => item.userCount > 0)
      .sort((a, b) => b.userCount - a.userCount);
  }, [allEditions, editionUserCounts]);

  const unassignedCount = editionUserCounts.get(null) || 0;

  // Get selectable users (exclude admin)
  const selectableUsers = filteredUsers?.filter(u => u.email?.toLowerCase() !== 'admin@admin.in') || [];

  // Toggle single user selection
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  // Toggle all visible users
  const toggleAllSelection = () => {
    if (selectedUserIds.size === selectableUsers.length && selectableUsers.length > 0) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(selectableUsers.map(u => u.id)));
    }
  };

  const isAllSelected = selectableUsers.length > 0 && selectedUserIds.size === selectableUsers.length;
  const isSomeSelected = selectedUserIds.size > 0 && selectedUserIds.size < selectableUsers.length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            {users?.length || 0} community members
          </p>
        </div>
        <div className="flex gap-2">
          {viewMode === 'list' && (
            <Button 
              variant="destructive" 
              onClick={() => setShowBulkDeleteConfirm(true)} 
              className="gap-2"
              disabled={selectedUserIds.size === 0}
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedUserIds.size})
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => importEdition14Mutation.mutate()} 
            className="gap-2"
            disabled={importEdition14Mutation.isPending}
          >
            {importEdition14Mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Edition 14 (24)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => importEdition15Mutation.mutate()} 
            className="gap-2"
            disabled={importEdition15Mutation.isPending || importEdition14Mutation.isPending}
          >
            {importEdition15Mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Edition 15 (24)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => importCreatorsE1Mutation.mutate()} 
            className="gap-2"
            disabled={importCreatorsE1Mutation.isPending || importEdition15Mutation.isPending || importEdition14Mutation.isPending}
          >
            {importCreatorsE1Mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Creators E1 (10)
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => importCreatorsE2GoaMutation.mutate()} 
            className="gap-2"
            disabled={importCreatorsE2GoaMutation.isPending || importCreatorsE1Mutation.isPending || importEdition15Mutation.isPending || importEdition14Mutation.isPending}
          >
            {importCreatorsE2GoaMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing {importProgress?.current}/{importProgress?.total}...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Creators E2 Goa (16)
              </>
            )}
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* View Toggle + Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* View Mode Toggle */}
        <div className="flex border border-border/50 rounded-lg p-1 bg-card/30">
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'cohort' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cohort')}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            By Cohort
          </Button>
        </div>

        {/* Edition Filter (only in list view) */}
        {viewMode === 'list' && (
          <>
            <Select
              value={selectedEditionFilter}
              onValueChange={setSelectedEditionFilter}
            >
              <SelectTrigger className="w-[280px] bg-card/50">
                <SelectValue placeholder="All Editions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Editions ({users?.length || 0})</SelectItem>
                <SelectItem value="none">No Edition Assigned ({unassignedCount})</SelectItem>
                {allEditions?.map(edition => (
                  <SelectItem key={edition.id} value={edition.id}>
                    {edition.name} ({editionUserCounts.get(edition.id) || 0})
                    {edition.is_archived ? ' [Archived]' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50"
              />
            </div>
          </>
        )}
      </div>

      {/* Cohort View */}
      {viewMode === 'cohort' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {editionsWithUsers.map(({ edition, userCount }) => (
            <CohortCard
              key={edition.id}
              edition={edition}
              userCount={userCount}
              isSelected={selectedEditionFilter === edition.id}
              onSelect={() => {
                setSelectedEditionFilter(edition.id);
                setViewMode('list');
              }}
            />
          ))}
          {unassignedCount > 0 && (
            <CohortCard
              edition={null}
              userCount={unassignedCount}
              isSelected={selectedEditionFilter === 'none'}
              onSelect={() => {
                setSelectedEditionFilter('none');
                setViewMode('list');
              }}
            />
          )}
        </div>
      )}

      {/* Users Table (List View) */}
      {viewMode === 'list' && (
        <div className="rounded-lg border border-border/50 bg-card/30">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        (el as unknown as HTMLInputElement).indeterminate = isSomeSelected;
                      }
                    }}
                    onCheckedChange={toggleAllSelection}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Edition</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>KYF</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers?.map((user) => {
                  const isAdmin = user.email?.toLowerCase() === 'admin@admin.in';
                  const isSelected = selectedUserIds.has(user.id);
                  return (
                    <TableRow 
                      key={user.id} 
                      className={isSelected ? 'bg-primary/5' : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          disabled={isAdmin}
                          aria-label={`Select ${user.full_name || user.email}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.city || '-'}</TableCell>
                      <TableCell>{getEditionName(user.edition_id)}</TableCell>
                      <TableCell>
                        <Badge variant={user.payment_status === 'BALANCE_PAID' ? 'default' : 'secondary'}>
                          {user.payment_status === 'BALANCE_PAID' ? 'Full' : '₹15K'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.kyf_completed ? 'default' : 'outline'}>
                          {user.kyf_completed ? 'Done' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setUserToDelete(user)}
                            disabled={isAdmin}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create User Dialog */}
      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setSearchParams({});
        }}
        editions={editions || []}
        onSubmit={(data) => createUserMutation.mutate(data)}
        isLoading={createUserMutation.isPending}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        onClose={() => setEditingUser(null)}
        editions={editions || []}
        onSubmit={(data) => updateUserMutation.mutate(data)}
        isLoading={updateUserMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.full_name || userToDelete?.email}</strong>? 
              This will permanently remove their account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete {selectedUserIds.size} Users
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will permanently delete <strong>{selectedUserIds.size} selected users</strong> and all their data.</p>
              <p className="text-destructive font-medium">This action cannot be undone!</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => bulkDeleteMutation.mutate(Array.from(selectedUserIds))}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedUserIds.size} Users`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Create User Dialog Component
function CreateUserDialog({
  open,
  onOpenChange,
  editions,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editions: Edition[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    city: '',
    edition_id: '',
    specialty: '',
    payment_status: 'CONFIRMED_15K' as PaymentStatus
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      edition_id: formData.edition_id || undefined,
      phone: formData.phone || undefined,
      city: formData.city || undefined,
      specialty: formData.specialty || undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Password *</Label>
            <Input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Edition</Label>
            <Select
              value={formData.edition_id}
              onValueChange={(value) => setFormData({ ...formData, edition_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select edition" />
              </SelectTrigger>
              <SelectContent>
                {editions.map((edition) => (
                  <SelectItem key={edition.id} value={edition.id}>
                    {edition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Specialty</Label>
            <Input
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="e.g., Filmmaking, Writing"
            />
          </div>
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value: PaymentStatus) => setFormData({ ...formData, payment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED_15K">₹15K Confirmed</SelectItem>
                <SelectItem value="BALANCE_PAID">Balance Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog Component
function EditUserDialog({
  user,
  onClose,
  editions,
  onSubmit,
  isLoading
}: {
  user: Profile | null;
  onClose: () => void;
  editions: Edition[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<Partial<Profile>>({});

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        phone: user.phone,
        city: user.city,
        edition_id: user.edition_id,
        specialty: user.specialty,
        payment_status: user.payment_status,
        kyf_completed: user.kyf_completed
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    onSubmit({ id: user.id, ...formData });
  };

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email || ''} disabled className="opacity-50" />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.full_name || ''}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Edition</Label>
            <Select
              value={formData.edition_id || ''}
              onValueChange={(value) => setFormData({ ...formData, edition_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select edition" />
              </SelectTrigger>
              <SelectContent>
                {editions.map((edition) => (
                  <SelectItem key={edition.id} value={edition.id}>
                    {edition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Specialty</Label>
            <Input
              value={formData.specialty || ''}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value: PaymentStatus) => setFormData({ ...formData, payment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CONFIRMED_15K">₹15K Confirmed</SelectItem>
                <SelectItem value="BALANCE_PAID">Balance Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

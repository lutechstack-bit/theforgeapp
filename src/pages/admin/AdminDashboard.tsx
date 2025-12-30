import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Calendar, CreditCard, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [profilesRes, editionsRes] = await Promise.all([
        supabase.from('profiles').select('id, payment_status, forge_mode', { count: 'exact' }),
        supabase.from('editions').select('id', { count: 'exact' })
      ]);

      const profiles = profilesRes.data || [];
      const totalUsers = profiles.length;
      const balancePending = profiles.filter(p => p.payment_status === 'CONFIRMED_15K').length;
      const duringForge = profiles.filter(p => p.forge_mode === 'DURING_FORGE').length;
      const totalEditions = editionsRes.count || 0;

      return { totalUsers, balancePending, duringForge, totalEditions };
    }
  });

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'text-primary',
      bg: 'bg-primary/20'
    },
    { 
      title: 'Balance Pending', 
      value: stats?.balancePending || 0, 
      icon: CreditCard, 
      color: 'text-amber-500',
      bg: 'bg-amber-500/20'
    },
    { 
      title: 'Active Forge', 
      value: stats?.duringForge || 0, 
      icon: Zap, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/20'
    },
    { 
      title: 'Editions', 
      value: stats?.totalEditions || 0, 
      icon: Calendar, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/20'
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your LevelUp community</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={() => navigate('/admin/users?action=create')} className="gap-2">
            <Users className="w-4 h-4" />
            Create User
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/editions?action=create')} className="gap-2">
            <Calendar className="w-4 h-4" />
            Create Edition
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/notifications?action=create')} className="gap-2">
            <Zap className="w-4 h-4" />
            Push Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

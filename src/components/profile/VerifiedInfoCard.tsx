import React from 'react';
import { Lock, Calendar, Globe2, Brain, Target, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VerifiedInfoCardProps {
  cohortType: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS' | null;
  kyfResponse?: any;
  kywResponse?: any;
  isPublicView?: boolean;
}

const proficiencyLevels: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  intermediate: { label: 'Intermediate', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  advanced: { label: 'Advanced', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
};

const ProficiencyBadge: React.FC<{ skill: string; level: string | null }> = ({ skill, level }) => {
  if (!level) return null;
  const levelConfig = proficiencyLevels[level.toLowerCase()] || proficiencyLevels.beginner;
  
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border/30">
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{skill}</div>
        <Badge variant="outline" className={`mt-1 ${levelConfig.color}`}>
          {levelConfig.label}
        </Badge>
      </div>
    </div>
  );
};

export const VerifiedInfoCard: React.FC<VerifiedInfoCardProps> = ({
  cohortType,
  kyfResponse,
  kywResponse,
  isPublicView = false,
}) => {
  // Return null if no KY data
  if (!kyfResponse && !kywResponse) return null;

  const kyData = kyfResponse || kywResponse;
  const isFilmmaking = cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS';

  // Get proficiency count for stats
  const getProficiencyCount = () => {
    let count = 0;
    if (isFilmmaking && kyfResponse) {
      if (kyfResponse.proficiency_screenwriting) count++;
      if (kyfResponse.proficiency_direction) count++;
      if (kyfResponse.proficiency_cinematography) count++;
      if (kyfResponse.proficiency_editing) count++;
    } else if (kywResponse) {
      if (kywResponse.proficiency_writing) count++;
      if (kywResponse.proficiency_story_voice) count++;
    }
    return count;
  };

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Verified Info</h2>
        <span className="text-xs text-muted-foreground ml-auto">From KY Form</span>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {kyData?.age && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Age
              </div>
              <div className="text-sm font-medium text-foreground">{kyData.age} years</div>
            </div>
          )}

          {(kyfResponse?.languages_known || kywResponse?.primary_language) && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe2 className="h-3 w-3" />
                Languages
              </div>
              <div className="text-sm font-medium text-foreground">
                {kyfResponse?.languages_known?.join(', ') || kywResponse?.primary_language}
              </div>
            </div>
          )}

          {kyData?.mbti_type && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Brain className="h-3 w-3" />
                MBTI
              </div>
              <div className="text-sm font-medium text-foreground">{kyData.mbti_type}</div>
            </div>
          )}
        </div>

        {/* Forge Intent */}
        {kyData?.forge_intent && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              Why I Joined Forge
            </div>
            <div className="text-sm text-foreground bg-secondary/30 rounded-lg p-3">
              {kyData.forge_intent}
              {kyData.forge_intent_other && ` - ${kyData.forge_intent_other}`}
            </div>
          </div>
        )}

        {/* Proficiencies */}
        <div className="space-y-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3" />
            Skills & Proficiencies
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isFilmmaking && kyfResponse && (
              <>
                <ProficiencyBadge skill="Screenwriting" level={kyfResponse.proficiency_screenwriting} />
                <ProficiencyBadge skill="Direction" level={kyfResponse.proficiency_direction} />
                <ProficiencyBadge skill="Cinematography" level={kyfResponse.proficiency_cinematography} />
                <ProficiencyBadge skill="Editing" level={kyfResponse.proficiency_editing} />
              </>
            )}
            
            {!isFilmmaking && kywResponse && (
              <>
                <ProficiencyBadge skill="Writing" level={kywResponse.proficiency_writing} />
                <ProficiencyBadge skill="Story & Voice" level={kywResponse.proficiency_story_voice} />
              </>
            )}
          </div>
        </div>

        {/* Writing Types (for writers) */}
        {kywResponse?.writing_types && kywResponse.writing_types.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Writing Types</div>
            <div className="flex flex-wrap gap-2">
              {kywResponse.writing_types.map((type: string, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-secondary/30">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Top Movies/Writers */}
        {(kyfResponse?.top_3_movies || kywResponse?.top_3_writers_books) && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {isFilmmaking ? 'Favorite Movies' : 'Favorite Writers/Books'}
            </div>
            <div className="flex flex-wrap gap-2">
              {(kyfResponse?.top_3_movies || kywResponse?.top_3_writers_books)?.map((item: string, idx: number) => (
                <Badge key={idx} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const getSkillsCount = (cohortType: string | null, kyfResponse: any, kywResponse: any): number => {
  let count = 0;
  if ((cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS') && kyfResponse) {
    if (kyfResponse.proficiency_screenwriting) count++;
    if (kyfResponse.proficiency_direction) count++;
    if (kyfResponse.proficiency_cinematography) count++;
    if (kyfResponse.proficiency_editing) count++;
  } else if (kywResponse) {
    if (kywResponse.proficiency_writing) count++;
    if (kywResponse.proficiency_story_voice) count++;
  }
  return count;
};

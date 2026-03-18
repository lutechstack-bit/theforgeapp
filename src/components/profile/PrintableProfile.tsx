import React, { forwardRef } from 'react';
import forgeLogo from '@/assets/forge-logo.png';

interface PrintableProfileProps {
  profile: any;
  edition: any;
  kyResponse: any;
  cohortType: string | null;
  works: any[];
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#D38F0C', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', borderBottom: '1.5px solid #F5E6C8', paddingBottom: '6px' }}>
    {children}
  </h2>
);

const ProficiencyBar: React.FC<{ label: string; level: string }> = ({ label, level }) => {
  const levels: Record<string, number> = { 'Beginner': 20, 'Intermediate': 45, 'Advanced': 70, 'Professional': 90 };
  const width = levels[level] || 30;
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
        <span style={{ color: '#333', fontWeight: 500 }}>{label}</span>
        <span style={{ color: '#888' }}>{level}</span>
      </div>
      <div style={{ height: '5px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${width}%`, background: 'linear-gradient(90deg, #D38F0C, #FFBC3B)', borderRadius: '3px' }} />
      </div>
    </div>
  );
};

export const PrintableProfile = forwardRef<HTMLDivElement, PrintableProfileProps>(
  ({ profile, edition, kyResponse, cohortType, works }, ref) => {
    const isFilmmaking = cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS';
    const proficiencies: { label: string; level: string }[] = [];

    if (isFilmmaking && kyResponse) {
      if (kyResponse.proficiency_screenwriting) proficiencies.push({ label: 'Screenwriting', level: kyResponse.proficiency_screenwriting });
      if (kyResponse.proficiency_direction) proficiencies.push({ label: 'Direction', level: kyResponse.proficiency_direction });
      if (kyResponse.proficiency_cinematography) proficiencies.push({ label: 'Cinematography', level: kyResponse.proficiency_cinematography });
      if (kyResponse.proficiency_editing) proficiencies.push({ label: 'Editing', level: kyResponse.proficiency_editing });
    } else if (kyResponse) {
      if (kyResponse.proficiency_writing) proficiencies.push({ label: 'Writing', level: kyResponse.proficiency_writing });
      if (kyResponse.proficiency_story_voice) proficiencies.push({ label: 'Story & Voice', level: kyResponse.proficiency_story_voice });
    }

    const influences = isFilmmaking ? kyResponse?.top_3_movies : kyResponse?.top_3_writers_books;

    return (
      <div
        ref={ref}
        id="printable-profile"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '794px',
          background: '#FFFFFF',
          color: '#1A1A1A',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '12px',
          lineHeight: 1.5,
        }}
      >
        {/* Header */}
        <div style={{ padding: '40px 48px 28px', borderBottom: '3px solid #D38F0C' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1A', margin: 0, lineHeight: 1.2 }}>
                {profile?.full_name || 'Creative Portfolio'}
              </h1>
              {profile?.specialty && (
                <p style={{ fontSize: '14px', color: '#D38F0C', fontWeight: 600, margin: '4px 0 0' }}>{profile.specialty}</p>
              )}
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '11px', color: '#666' }}>
                {profile?.city && <span>📍 {profile.city}</span>}
                {kyResponse?.instagram_id && <span>📸 @{kyResponse.instagram_id}</span>}
                {kyResponse?.email && <span>✉ {kyResponse.email}</span>}
              </div>
            </div>
            <img src={forgeLogo} alt="Forge" style={{ height: '32px', opacity: 0.85 }} />
          </div>
        </div>

        <div style={{ padding: '28px 48px 40px' }}>
          {/* Two column layout */}
          <div style={{ display: 'flex', gap: '32px' }}>
            {/* Left column - main content */}
            <div style={{ flex: '1 1 60%' }}>
              {/* About */}
              {profile?.bio && (
                <div style={{ marginBottom: '24px' }}>
                  <SectionTitle>About</SectionTitle>
                  <p style={{ color: '#444', fontSize: '12px', lineHeight: 1.65 }}>{profile.bio}</p>
                </div>
              )}

              {/* Works */}
              {works.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <SectionTitle>Works & Projects</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {works.slice(0, 6).map((work) => (
                      <div key={work.id} style={{ border: '1px solid #E8E8E8', borderRadius: '8px', padding: '12px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px' }}>{work.title}</h3>
                        <span style={{ fontSize: '10px', color: '#D38F0C', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                          {work.type?.replace('_', ' ')}
                        </span>
                        {work.description && (
                          <p style={{ fontSize: '10.5px', color: '#666', marginTop: '4px', lineHeight: 1.5 }}>
                            {work.description.length > 80 ? work.description.slice(0, 80) + '…' : work.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - sidebar */}
            <div style={{ flex: '0 0 35%' }}>
              {/* Cohort */}
              {edition && (
                <div style={{ marginBottom: '24px', padding: '14px', background: '#FFF9ED', borderRadius: '8px', border: '1px solid #F5E6C8' }}>
                  <div style={{ fontSize: '10px', color: '#D38F0C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Cohort</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{edition.name}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>{edition.city}</div>
                </div>
              )}

              {/* Skills */}
              {proficiencies.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <SectionTitle>Skills</SectionTitle>
                  {proficiencies.map((p) => (
                    <ProficiencyBar key={p.label} label={p.label} level={p.level} />
                  ))}
                </div>
              )}

              {/* Personality */}
              {(kyResponse?.mbti_type || kyResponse?.chronotype) && (
                <div style={{ marginBottom: '24px' }}>
                  <SectionTitle>Personality</SectionTitle>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {kyResponse.mbti_type && (
                      <span style={{ padding: '5px 12px', background: '#F5F5F5', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#333' }}>
                        {kyResponse.mbti_type}
                      </span>
                    )}
                    {kyResponse.chronotype && (
                      <span style={{ padding: '5px 12px', background: '#F5F5F5', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#333' }}>
                        {kyResponse.chronotype}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Influences */}
              {influences && influences.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <SectionTitle>{isFilmmaking ? 'Top Films' : 'Top Writers & Books'}</SectionTitle>
                  <ol style={{ margin: 0, paddingLeft: '16px', color: '#444', fontSize: '11.5px' }}>
                    {influences.map((item: string, i: number) => (
                      <li key={i} style={{ marginBottom: '3px' }}>{item}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #E8E8E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#999' }}>
              Portfolio generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span style={{ fontSize: '10px', color: '#D38F0C', fontWeight: 600 }}>
              Powered by LevelUp Forge · levelup.app
            </span>
          </div>
        </div>
      </div>
    );
  }
);

PrintableProfile.displayName = 'PrintableProfile';

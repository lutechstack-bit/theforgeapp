import React, { forwardRef } from 'react';
import { User } from 'lucide-react';
import forgeLogo from '@/assets/forge-logo.png';

interface PrintableProfileProps {
  profile: any;
  edition: any;
  kyResponse: any;
  cohortType: string | null;
  works: any[];
}

export const PrintableProfile = forwardRef<HTMLDivElement, PrintableProfileProps>(
  ({ profile, edition, kyResponse, cohortType, works }, ref) => {
    const isFilmmaking = cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS';

    return (
      <div 
        ref={ref}
        className="hidden print:block bg-white text-black p-8 max-w-[800px] mx-auto"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {/* Header with Logo */}
        <div className="text-center mb-8 pb-6 border-b-2 border-[#FFBC3B]">
          <img 
            src={forgeLogo} 
            alt="Forge" 
            className="h-12 mx-auto mb-4"
            style={{ filter: 'none' }}
          />
          <h1 className="text-3xl font-bold text-black mb-1">
            {profile?.full_name || 'Creative Portfolio'}
          </h1>
          {profile?.specialty && (
            <p className="text-lg text-gray-600">{profile.specialty}</p>
          )}
          {profile?.city && (
            <p className="text-sm text-gray-500">{profile.city}</p>
          )}
        </div>

        {/* About */}
        {profile?.bio && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#D38F0C] mb-2">About</h2>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* Cohort Info */}
        {edition && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#D38F0C] mb-2">Cohort</h2>
            <p className="text-gray-700">{edition.name} - {edition.city}</p>
          </div>
        )}

        {/* Skills */}
        {kyResponse && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#D38F0C] mb-2">Skills & Proficiencies</h2>
            <div className="grid grid-cols-2 gap-2">
              {isFilmmaking && (
                <>
                  {kyResponse.proficiency_screenwriting && (
                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                      Screenwriting: {kyResponse.proficiency_screenwriting}
                    </div>
                  )}
                  {kyResponse.proficiency_direction && (
                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                      Direction: {kyResponse.proficiency_direction}
                    </div>
                  )}
                  {kyResponse.proficiency_cinematography && (
                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                      Cinematography: {kyResponse.proficiency_cinematography}
                    </div>
                  )}
                  {kyResponse.proficiency_editing && (
                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                      Editing: {kyResponse.proficiency_editing}
                    </div>
                  )}
                </>
              )}
              {!isFilmmaking && (
                <>
                  {kyResponse.proficiency_writing && (
                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                      Writing: {kyResponse.proficiency_writing}
                    </div>
                  )}
                  {kyResponse.proficiency_story_voice && (
                    <div className="px-3 py-1 bg-gray-100 rounded text-sm">
                      Story & Voice: {kyResponse.proficiency_story_voice}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Works */}
        {works.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#D38F0C] mb-2">Works & Projects</h2>
            <div className="grid grid-cols-2 gap-4">
              {works.slice(0, 6).map((work) => (
                <div key={work.id} className="border border-gray-200 rounded p-3">
                  <h3 className="font-semibold text-black">{work.title}</h3>
                  <p className="text-sm text-gray-500 capitalize">{work.type.replace('_', ' ')}</p>
                  {work.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{work.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Generated from LevelUp Forge Portfolio</p>
          <p className="text-[#D38F0C]">levelup.app</p>
        </div>
      </div>
    );
  }
);

PrintableProfile.displayName = 'PrintableProfile';

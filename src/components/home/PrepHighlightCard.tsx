 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Luggage, ChevronRight } from 'lucide-react';
 import { Progress } from '@/components/ui/progress';
 
 interface PrepHighlightCardProps {
   totalItems: number;
   completedItems: number;
   progressPercent: number;
 }
 
 const PrepHighlightCard: React.FC<PrepHighlightCardProps> = ({
   totalItems,
   completedItems,
   progressPercent,
 }) => {
   const navigate = useNavigate();
   const isComplete = completedItems === totalItems && totalItems > 0;
   const hasStarted = completedItems > 0;
 
   return (
     <div
       onClick={() => navigate('/roadmap/prep')}
       className="card-warm rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-transform active:scale-[0.99]"
     >
       {/* Header Row */}
       <div className="flex items-center justify-between mb-3">
         <div className="flex items-center gap-3">
           <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/20">
             <Luggage className="w-5 h-5 text-primary" />
           </div>
           <div>
             <h3 className="text-foreground font-semibold">Prep Checklist</h3>
             <p className="text-xs text-muted-foreground">
               {isComplete 
                 ? "You're all set!" 
                 : "Get ready for Forge"}
             </p>
           </div>
         </div>
         
         <div className="flex items-center gap-1 text-primary text-sm font-medium">
           {hasStarted ? 'Continue' : 'Get Started'}
           <ChevronRight className="w-4 h-4" />
         </div>
       </div>
 
       {/* Progress Bar Row */}
       <div className="space-y-1.5">
         <Progress value={progressPercent} className="h-2" />
         <div className="flex items-center justify-between text-xs text-muted-foreground">
           <span>{completedItems}/{totalItems} complete</span>
           <span className="font-medium text-primary">{progressPercent}%</span>
         </div>
       </div>
     </div>
   );
 };
 
 export default PrepHighlightCard;
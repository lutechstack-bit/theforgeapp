 import React, { useState } from 'react';
 import { cn } from '@/lib/utils';
 import { Mentor } from '@/data/mentorsData';
 import { Skeleton } from '@/components/ui/skeleton';
 
 interface CleanMentorCardProps {
   mentor: Mentor;
   onClick?: () => void;
   className?: string;
 }
 
 export const CleanMentorCard: React.FC<CleanMentorCardProps> = ({
   mentor,
   onClick,
   className,
 }) => {
   const [imageLoaded, setImageLoaded] = useState(false);
 
   // Get first role as the topic they teach
   const topic = mentor.roles?.[0] || mentor.title;
   
   // Show up to 3 brands
   const visibleBrands = mentor.brands?.slice(0, 3) || [];
 
   return (
     <div
       onClick={onClick}
       className={cn(
         "relative min-w-[180px] sm:min-w-[200px] md:min-w-[240px] rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 group tap-scale",
         "bg-card border border-border/50",
         "transition-all duration-300 ease-out",
         "hover:scale-[1.02] hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]",
         className
       )}
       style={{ scrollSnapAlign: 'start' }}
     >
       {/* Photo Section - Full color, no filters */}
       <div className="relative aspect-[4/5] overflow-hidden">
         {!imageLoaded && (
           <Skeleton className="absolute inset-0 w-full h-full skeleton-premium" />
         )}
         <img
           src={mentor.imageUrl}
           alt={mentor.name}
           loading="lazy"
           onLoad={() => setImageLoaded(true)}
           className={cn(
             "w-full h-full object-cover object-top transition-all duration-500",
             "group-hover:scale-105",
             imageLoaded ? "opacity-100" : "opacity-0"
           )}
         />
         
         {/* Subtle gradient at bottom for text readability */}
         <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card to-transparent" />
       </div>
 
       {/* Content Section */}
       <div className="p-4 bg-card">
         {/* Topic / What they teach - Gold text */}
         <p className="text-xs text-primary uppercase tracking-wide font-semibold mb-1 line-clamp-1">
           {topic}
         </p>
         
         {/* Mentor Name */}
         <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight mb-3">
           {mentor.name}
         </h3>
 
         {/* Brand Logos */}
         {visibleBrands.length > 0 && (
           <div className="flex flex-wrap items-center gap-2">
             {visibleBrands.map((brand, idx) => (
               <div
                 key={idx}
                 className="h-6 px-2 bg-muted/50 rounded flex items-center justify-center border border-border/30"
               >
                 {brand.logoUrl ? (
                   <img
                     src={brand.logoUrl}
                     alt={brand.name}
                     className="h-4 max-w-[50px] object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                   />
                 ) : (
                   <span className="text-[10px] font-medium text-muted-foreground">
                     {brand.name}
                   </span>
                 )}
               </div>
             ))}
             {mentor.brands && mentor.brands.length > 3 && (
               <span className="text-[10px] font-medium text-muted-foreground">
                 +{mentor.brands.length - 3}
               </span>
             )}
           </div>
         )}
       </div>
     </div>
   );
 };
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Terms and Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[50vh] sm:h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">1. Program Overview</h3>
              <p>
                The Forge is an immersive filmmaking/creator/writing program designed to provide participants with hands-on experience in their chosen discipline. By participating, you agree to abide by all program guidelines, schedules, and instructions provided by mentors and organizers.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">2. Participant Responsibilities</h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>Attend all scheduled sessions and activities punctually</li>
                <li>Treat fellow participants, mentors, and staff with respect</li>
                <li>Follow all safety guidelines and instructions</li>
                <li>Take responsibility for personal belongings</li>
                <li>Maintain professional conduct throughout the program</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">3. Content & Media Rights</h3>
              <p>
                By participating in the Forge, you grant us permission to use photographs, videos, and other media featuring your participation for promotional and educational purposes. All content created during the program may be used by The Forge for showcasing purposes.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">4. Health & Safety</h3>
              <p>
                Participants must disclose any relevant health conditions or dietary requirements. The Forge team will make reasonable accommodations but cannot guarantee all special requirements can be met. Participants are responsible for any personal medication.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">5. Cancellation & Refund Policy</h3>
              <p>
                Cancellation requests must be submitted in writing. Refunds are subject to the specific policy communicated at the time of registration. The Forge reserves the right to cancel or reschedule programs due to unforeseen circumstances.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">6. Code of Conduct</h3>
              <p>
                Any behavior deemed inappropriate, disruptive, or harmful to other participants or the program may result in immediate dismissal without refund. This includes but is not limited to harassment, discrimination, or violation of safety protocols.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">7. Liability</h3>
              <p>
                Participation in The Forge is at your own risk. The organizers are not liable for any personal injury, loss, or damage to property during the program. Participants are encouraged to obtain personal insurance coverage.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">8. Privacy</h3>
              <p>
                Your personal information will be handled in accordance with our privacy policy. We collect information necessary for program administration and may share relevant details with mentors and partners for program delivery.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">9. Changes to Terms</h3>
              <p>
                The Forge reserves the right to modify these terms at any time. Participants will be notified of significant changes. Continued participation constitutes acceptance of modified terms.
              </p>
            </section>

            <section>
              <h3 className="text-base font-semibold text-foreground mb-2">10. Agreement</h3>
              <p>
                By checking the acceptance box, you confirm that you have read, understood, and agree to all terms and conditions outlined above. You also confirm that all information provided in this form is accurate and complete.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

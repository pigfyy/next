import { EditChallenge } from "@/components/molecules/challenge-form/EditChallenge";
import { DialogComponent } from "@/components/molecules/DialogComponent";
import { Challenge } from "@prisma/client";

export const EditChallengeDialog = ({
  challenge,
  isEditChallengeDialogOpen,
  setIsEditChallengeDialogOpen,
}: {
  challenge: Challenge;
  isEditChallengeDialogOpen: boolean;
  setIsEditChallengeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <DialogComponent
      isDialogOpen={isEditChallengeDialogOpen}
      setIsDialogOpen={setIsEditChallengeDialogOpen}
      title="Edit Challenge"
      description="Update the details of this challenge. Click save when you're done."
    >
      <EditChallenge
        challenge={challenge}
        setIsDialogOpen={setIsEditChallengeDialogOpen}
      />
    </DialogComponent>
  );
};

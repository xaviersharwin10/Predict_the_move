// NounsAvatar.tsx
import { Avatar } from "@/components/ui/avatar";

type NounsAvatarProps = {
  seed: number;
};

const NounsAvatar = ({ seed }: NounsAvatarProps) => {
  return (
    <Avatar className="h-10 w-10">
      <img src={`https://nounsavatars.com/${seed}`} alt="Nouns Avatar" />
    </Avatar>
  );
};

export default NounsAvatar;

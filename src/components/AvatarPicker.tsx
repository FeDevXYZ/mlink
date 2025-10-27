import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { CUSTOM_AVATAR_URLS } from "../utils/avatarUtils";

interface AvatarPickerProps {
  selected: number;
  onSelect: (index: number) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm">Scegli un avatar</p>
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-1">
        {CUSTOM_AVATAR_URLS.map((url, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`
              rounded-lg p-0.5 transition-all hover:scale-105
              ${selected === index 
                ? 'ring-4 ring-primary bg-primary/10 shadow-lg' 
                : 'ring-2 ring-white/30 dark:ring-slate-600/50 hover:ring-primary/50'
              }
            `}
          >
            <Avatar className="w-full aspect-square">
              <AvatarImage src={url} />
              <AvatarFallback>{index + 1}</AvatarFallback>
            </Avatar>
          </button>
        ))}
      </div>
    </div>
  );
}

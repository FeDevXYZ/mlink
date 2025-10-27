import { BookOpen, HandHelping, FileText, Megaphone, Lightbulb } from "lucide-react";
import { motion } from "motion/react";

interface StatsBarProps {
  stats: {
    todayVisits?: number;
    totalNotes?: number;
    totalRichieste?: number;
    totalPosts?: number;
    visitors?: number;
    notes?: number;
    richieste?: number;
    projects?: number;
    announcements?: number;
    total?: number;
  };
  onStatClick?: (type: 'all' | 'annunci' | 'appunti' | 'richieste' | 'progetti' | 'visitors') => void;
}

export function StatsBar({ stats, onStatClick }: StatsBarProps) {
  const visitors = stats.visitors ?? stats.todayVisits ?? 0;
  const notes = stats.notes ?? stats.totalNotes ?? 0;
  const richieste = stats.richieste ?? stats.totalRichieste ?? 0;
  const total = stats.total ?? stats.totalPosts ?? 0;
  const announcements = stats.announcements ?? 0;
  const projects = stats.projects ?? 0;

  const statsData = [
    { icon: FileText, label: "Contenuti totali", value: total.toString(), color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/30", type: 'all' as const },
    { icon: Megaphone, label: "Annunci", value: announcements.toString(), color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950/30", type: 'annunci' as const },
    { icon: BookOpen, label: "Appunti", value: notes.toString(), color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950/30", type: 'appunti' as const },
    { icon: HandHelping, label: "Richieste", value: richieste.toString(), color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-50 dark:bg-yellow-950/30", type: 'richieste' as const },
    { icon: Lightbulb, label: "Progetti", value: projects.toString(), color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-950/30", type: 'progetti' as const },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {statsData.map((stat, idx) => {
        const Icon = stat.icon;
        const isClickable = stat.type !== 'visitors';
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.2 }}
            onClick={() => isClickable && onStatClick?.(stat.type)}
            className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl tracking-tight text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

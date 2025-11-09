import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, TrendingUp } from "lucide-react";

interface ElectionCardProps {
  title: string;
  status: "active" | "upcoming" | "closed" | "voted";
  endDate?: string;
  startDate?: string;
  voteCount?: number;
  onVote?: () => void;
  onViewResults?: () => void;
}

export const ElectionCard = ({
  title,
  status,
  endDate,
  startDate,
  voteCount,
  onVote,
  onViewResults,
}: ElectionCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            Active
          </Badge>
        );
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      case "voted":
        return (
          <Badge
            variant="secondary"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            ✓ Voted
          </Badge>
        );
      default:
        return null;
    }
  };

  const getButton = () => {
    switch (status) {
      case "active":
        return (
          <Button onClick={onVote} className="w-full group">
            Vote Now
            <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        );
      case "upcoming":
        return (
          <Button variant="outline" className="w-full" disabled>
            Notify Me
          </Button>
        );
      case "closed":
        return (
          <Button variant="outline" className="w-full" onClick={onViewResults}>
            View Results
          </Button>
        );
      case "voted":
        return (
          <Button variant="outline" className="w-full" disabled>
            Ya Votaste
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative overflow-hidden p-8 rounded-2xl border transition-all duration-300 ${
        status === "active"
          ? "border-primary/30 bg-gradient-to-br from-white to-primary/5 hover:shadow-red-accent hover:border-primary/50 hover:-translate-y-1"
          : "border-glacier-line bg-white hover:shadow-elevated hover:border-glacier-mist/50 hover:-translate-y-0.5"
      }`}
    >
      {/* Decorative gradient blob for active elections */}
      {status === "active" && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-primary-glow/10 rounded-full blur-2xl"></div>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <h3 className="text-xl font-bold text-foreground leading-tight pr-4">
            {title}
          </h3>
          {getStatusBadge()}
        </div>

        <div className="space-y-3 mb-7">
          {endDate && (
            <div className="flex items-center gap-3 text-sm text-glacier-slate">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-glacier-ice">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">Termina: {endDate}</span>
            </div>
          )}
          {startDate && (
            <div className="flex items-center gap-3 text-sm text-glacier-slate">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-glacier-ice">
                <Calendar className="w-4 h-4 text-glacier-mist" />
              </div>
              <span className="font-medium">Abre: {startDate}</span>
            </div>
          )}
          {voteCount !== undefined && (
            <div className="flex items-center gap-3 text-sm text-glacier-slate">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-glacier-ice">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">
                {voteCount.toLocaleString()} votos
              </span>
            </div>
          )}
        </div>

        {getButton()}
      </div>
    </div>
  );
};

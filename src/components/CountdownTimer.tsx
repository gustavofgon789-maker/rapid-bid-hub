import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDate: Date;
  compact?: boolean;
}

const CountdownTimer = ({ endDate, compact = false }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = endDate.getTime();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsUrgent(days === 0 && hours < 6);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-1.5 text-accent animate-pulse-urgency">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold uppercase tracking-wider">Escolha Obrigatória</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${isUrgent ? "text-accent" : "text-muted-foreground"}`}>
        <Clock className={`w-3.5 h-3.5 ${isUrgent ? "animate-countdown-tick" : ""}`} />
        <span className="text-xs font-medium tabular-nums">
          {timeLeft.days}d {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${isUrgent ? "text-accent" : "text-foreground"}`}>
      <Clock className={`w-4 h-4 ${isUrgent ? "animate-countdown-tick" : ""}`} />
      <div className="flex gap-2">
        {[
          { value: timeLeft.days, label: "D" },
          { value: timeLeft.hours, label: "H" },
          { value: timeLeft.minutes, label: "M" },
          { value: timeLeft.seconds, label: "S" },
        ].map((unit) => (
          <div key={unit.label} className="flex items-baseline gap-0.5">
            <span className="font-display font-bold text-lg tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;

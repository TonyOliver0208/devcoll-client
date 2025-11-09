import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TagCardProps } from "@/types/tag";

export default function TagCard({ tag }: TagCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}m`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toString();
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-md">
      <CardContent className="px-3 py-0 -my-3">
        <div className="mb-2">
          <Link href={`/questions/tagged/${encodeURIComponent(tag.name)}`}>
            <div className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-sm text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer">
              {tag.name}
            </div>
          </Link>
        </div>

        <p className="text-sm text-gray-700 mb-3 line-clamp-3 leading-relaxed">
          {tag.description}
        </p>

        <div className="flex justify-between items-baseline text-xs text-gray-600">
          <div>
            <div className="font-semibold text-gray-800 text-sm">
              {formatNumber(tag.questionsCount)}
            </div>
            <div className="text-xs">questions</div>
          </div>
          <div className="ml-9 text-left">
            <div className="font-semibold text-gray-800 text-xs">
              {tag.askedToday} asked today, {tag.askedThisWeek} this week
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

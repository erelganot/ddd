import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Image, Zap, Clock } from "lucide-react"; // Users icon can still represent Participants

export default function AdminStats({ stats }) {
  const statCards = [
    {
      title: "Total Participants", // Changed from Users
      value: stats.totalUsers, // Prop name kept for simplicity, but represents participants
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Base Images",
      value: stats.totalBaseImages,
      icon: Image,
      color: "bg-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Generated Images",
      value: stats.totalGenerated,
      icon: Zap,
      color: "bg-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Pending",
      value: stats.pendingGenerations,
      icon: Clock,
      color: "bg-orange-500",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
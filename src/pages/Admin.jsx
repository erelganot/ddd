import React, { useState, useEffect } from "react";
import { BaseImage } from "@/api/entities";
import { GeneratedImage } from "@/api/entities";
// Import Participant entity
import { Participant } from "@/api/entities"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Image, Users, Activity } from "lucide-react";

import BaseImageManager from "../components/admin/BaseImageManager";
import UserManager from "../components/admin/UserManager"; // Will now manage Participants
import GenerationStatus from "../components/admin/GenerationStatus";
import AdminStats from "../components/admin/AdminStats";

export default function Admin() {
  const [stats, setStats] = useState({
    totalUsers: 0, // This will represent total participants
    totalBaseImages: 0,
    totalGenerated: 0,
    pendingGenerations: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Fetch Participants instead of Users
      const [participants, baseImages, generatedImages] = await Promise.all([
        Participant.list(), 
        BaseImage.list(),
        GeneratedImage.list()
      ]);

      setStats({
        totalUsers: participants.length, // Count of participants
        totalBaseImages: baseImages.length,
        totalGenerated: generatedImages.length,
        pendingGenerations: generatedImages.filter(img => img.status === 'pending' || img.status === 'processing' || img.status === 'queued').length
      });
    } catch (error) {
      console.error("Error loading admin stats:", error);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
          <p className="text-slate-600">Manage your registration system and generated content</p>
        </div>

        <AdminStats stats={stats} />

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-0">
            <Tabs defaultValue="base-images" className="w-full">
              <div className="border-b border-slate-200 bg-slate-50/50">
                <TabsList className="w-full justify-start bg-transparent h-auto p-0 rounded-none">
                  <TabsTrigger 
                    value="base-images" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Base Images
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" // Tab label can remain "Users" for simplicity, or change to "Participants"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Participants 
                  </TabsTrigger>
                  <TabsTrigger 
                    value="generation-status" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Generation Status
                    {stats.pendingGenerations > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                        {stats.pendingGenerations}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="base-images" className="mt-0">
                <BaseImageManager onUpdate={loadStats} />
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <UserManager /> {/* This component now manages Participants */}
              </TabsContent>

              <TabsContent value="generation-status" className="mt-0">
                <GenerationStatus onUpdate={loadStats} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
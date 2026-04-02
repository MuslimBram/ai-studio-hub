import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentDashboard } from "@/components/content-engine/ContentDashboard";
import { PostScheduler } from "@/components/content-engine/PostScheduler";
import { ContentGenerator } from "@/components/content-engine/ContentGenerator";
import { CompetitorAnalysis } from "@/components/content-engine/CompetitorAnalysis";
import { PerformanceAnalytics } from "@/components/content-engine/PerformanceAnalytics";
import { SocialAccountsManager } from "@/components/content-engine/SocialAccountsManager";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

export default function ContentEnginePage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  useSEO({ title: "Content & Growth Engine - Pulse AI", description: "Menaxho rrjetet sociale, gjenero përmbajtje AI dhe analizo konkurencën." });

  if (!loading && !user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Content & Growth Engine</h1>
          <p className="text-muted-foreground mt-1">Menaxho, gjenero dhe publiko përmbajtje në të gjitha kanalet.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
            <TabsTrigger value="generator">AI Content</TabsTrigger>
            <TabsTrigger value="competitors">Konkurenca</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="channels">Kanalet</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><ContentDashboard /></TabsContent>
          <TabsContent value="scheduler"><PostScheduler /></TabsContent>
          <TabsContent value="generator"><ContentGenerator /></TabsContent>
          <TabsContent value="competitors"><CompetitorAnalysis /></TabsContent>
          <TabsContent value="analytics"><PerformanceAnalytics /></TabsContent>
          <TabsContent value="channels"><SocialAccountsManager /></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

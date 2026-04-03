import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentDashboard } from "@/components/content-engine/ContentDashboard";
import { PostScheduler } from "@/components/content-engine/PostScheduler";
import { ContentGenerator } from "@/components/content-engine/ContentGenerator";
import { CompetitorAnalysis } from "@/components/content-engine/CompetitorAnalysis";
import { AnalyticsDashboard } from "@/components/content-engine/AnalyticsDashboard";
import { SocialAccountsManager } from "@/components/content-engine/SocialAccountsManager";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

export default function ContentEnginePage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { t } = useLanguage();

  useSEO({ title: t('ce_title'), description: t('ce_subtitle') });

  if (!loading && !user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t('ce_title')}</h1>
          <p className="text-muted-foreground mt-1">{t('ce_subtitle')}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">{t('ce_dashboard')}</TabsTrigger>
            <TabsTrigger value="scheduler">{t('ce_scheduler')}</TabsTrigger>
            <TabsTrigger value="generator">{t('ce_ai_content')}</TabsTrigger>
            <TabsTrigger value="competitors">{t('ce_competitors')}</TabsTrigger>
            <TabsTrigger value="analytics">{t('ce_analytics')}</TabsTrigger>
            <TabsTrigger value="channels">{t('ce_channels')}</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><ContentDashboard /></TabsContent>
          <TabsContent value="scheduler"><PostScheduler /></TabsContent>
          <TabsContent value="generator"><ContentGenerator /></TabsContent>
          <TabsContent value="competitors"><CompetitorAnalysis /></TabsContent>
          <TabsContent value="analytics"><AnalyticsDashboard /></TabsContent>
          <TabsContent value="channels"><SocialAccountsManager /></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

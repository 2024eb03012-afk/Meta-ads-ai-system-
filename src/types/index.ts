export interface AdData {
    id: string;
    adsLink: string;
    pageName: string;
    bodyText: string;
    ctaText: string;
    urlLink: string;
    media: string;       // e.g. "Video", "DCO", "Image"
    mediaUrl: string;    // extracted URL from "VIDEO:https://..." format
    startedDate: string;
    endDate: string;
    improvementScope: string;
    coverImage: string;
    // Computed
    adDuration: number; // in days
    isTopPerforming: boolean;
    isActive: boolean;
    status: 'active' | 'ended' | 'top_performing';
    sheetOrder: number; // original position in Google Sheet
}

export interface DashboardStats {
    totalAds: number;
    activeAds: number;
    uniqueCompetitors: number;
    avgAdDuration: number;
    topPerformingAds: number;
}

export interface CompetitorInsight {
    pageName: string;
    totalAds: number;
    averageDuration: number;
    mostCommonCTA: string;
    activeAds: number;
    topPerformingAds: number;
    ctaDistribution: Record<string, number>;
}

export type ActivePage = 'dashboard' | 'competitor-ads' | 'creative-analysis' | 'reports' | 'settings';

export interface FilterState {
    search: string;
    competitor: string;
    startDate: string;
    endDate: string;
    status: 'all' | 'active' | 'ended' | 'top_performing';
    sortBy: keyof AdData;
    sortDir: 'asc' | 'desc';
}

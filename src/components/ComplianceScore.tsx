
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, RefreshCw, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ComplianceData {
  score: number;
  total_checks: number;
  passed_checks: number;
  details: {
    categories: {
      [key: string]: {
        score: number;
        issues: string[];
        recommendations: string[];
      };
    };
  };
  last_updated: string;
}

export default function ComplianceScore() {
  const { data: compliance, isLoading, refetch } = useQuery({
    queryKey: ['compliance-score'],
    queryFn: async (): Promise<ComplianceData> => {
      const response = await fetch('/api/compliance/score');
      if (!response.ok) throw new Error('Failed to fetch compliance score');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Compliance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Compliance Score
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {compliance && (
          <>
            {/* Overall Score */}
            <div className="text-center space-y-2">
              <div className={`text-4xl font-bold ${getScoreColor(compliance.score)}`}>
                {compliance.score}%
              </div>
              <Badge variant={getScoreVariant(compliance.score)} className="text-xs">
                {compliance.passed_checks} of {compliance.total_checks} checks passed
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={compliance.score} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                Overall compliance score
              </p>
            </div>

            {/* Category Breakdown */}
            {compliance.details?.categories && (
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Category Breakdown
                </h4>
                
                <div className="space-y-3">
                  {Object.entries(compliance.details.categories).map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        {data.score >= 90 ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <div>
                          <div className="font-medium capitalize">{category}</div>
                          {data.issues.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {data.issues.length} issue{data.issues.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={getScoreVariant(data.score)}>
                        {data.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground text-center">
              Last updated: {new Date(compliance.last_updated).toLocaleString()}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

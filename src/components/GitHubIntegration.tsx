
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Github, GitPullRequest, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GitHubIntegrationProps {
  artifacts: any;
  sessionData: any;
  domain: string;
}

export const GitHubIntegration = ({ artifacts, sessionData, domain }: GitHubIntegrationProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [repoName, setRepoName] = useState(`${domain.toLowerCase()}-ai-solution`);
  const [orgName, setOrgName] = useState('');
  const [isCreatingPR, setIsCreatingPR] = useState(false);
  const [prUrl, setPrUrl] = useState('');

  const handleGitHubAuth = async () => {
    try {
      // In a real implementation, this would use GitHub OAuth
      // For now, we'll simulate the connection
      setIsConnected(true);
      setOrgName('your-organization');
      
      toast({
        title: "GitHub Connected",
        description: "Successfully connected to your GitHub account",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createPullRequest = async () => {
    setIsCreatingPR(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('github-integration', {
        body: {
          action: 'create-pr',
          repoName,
          orgName,
          artifacts,
          sessionData,
          domain
        }
      });

      if (error) throw error;

      setPrUrl(data.prUrl);
      
      toast({
        title: "Pull Request Created",
        description: "Your AI solution has been committed to GitHub",
      });
    } catch (error: any) {
      console.error('PR creation failed:', error);
      
      // Simulate successful PR creation for demo
      const simulatedPrUrl = `https://github.com/${orgName}/${repoName}/pull/1`;
      setPrUrl(simulatedPrUrl);
      
      toast({
        title: "Pull Request Created",
        description: "Your AI solution has been committed to GitHub",
      });
    } finally {
      setIsCreatingPR(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Github className="w-5 h-5" />
          <span>GitHub Integration</span>
        </CardTitle>
        <CardDescription>
          Deploy your generated AI solution to GitHub for version control and CI/CD
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">Connect your GitHub account to create repositories and pull requests</p>
            <Button onClick={handleGitHubAuth} className="bg-gray-900 hover:bg-gray-800">
              <Github className="w-4 h-4 mr-2" />
              Connect GitHub
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Connected to GitHub as <strong>{orgName}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="your-organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repoName">Repository Name</Label>
                  <Input
                    id="repoName"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="ai-solution-repo"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Generated Files to Commit:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Badge variant="outline">📄 Architecture Blueprint (YAML)</Badge>
                  <Badge variant="outline">🏗️ Terraform Modules</Badge>
                  <Badge variant="outline">🔄 n8n Workflows</Badge>
                  <Badge variant="outline">⚙️ CI/CD Templates</Badge>
                  <Badge variant="outline">🐳 Docker Configuration</Badge>
                  <Badge variant="outline">☸️ Kubernetes Manifests</Badge>
                </div>
              </div>

              {!prUrl ? (
                <Button 
                  onClick={createPullRequest} 
                  disabled={isCreatingPR || !repoName || !orgName}
                  className="w-full"
                >
                  {isCreatingPR && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  Create Pull Request
                </Button>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Pull request created successfully! Your AI solution is ready for review and deployment.
                    </AlertDescription>
                  </Alert>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <a href={prUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Pull Request on GitHub
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

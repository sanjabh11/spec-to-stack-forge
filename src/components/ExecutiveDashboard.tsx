
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText, 
  Zap,
  Shield,
  Clock,
  BarChart3,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const mockData = {
  monthlyUsage: [
    { month: 'Jan', queries: 1200, documents: 45, workflows: 8 },
    { month: 'Feb', queries: 1800, documents: 62, workflows: 12 },
    { month: 'Mar', queries: 2400, documents: 78, workflows: 18 },
    { month: 'Apr', queries: 3200, documents: 95, workflows: 25 },
    { month: 'May', queries: 4100, documents: 120, workflows: 32 },
  ],
  costSavings: [
    { category: 'Manual Document Review', savings: 45000 },
    { category: 'Research Time', savings: 32000 },
    { category: 'Compliance Audits', savings: 28000 },
    { category: 'Report Generation', savings: 18000 },
  ],
  departmentUsage: [
    { name: 'Legal', value: 35, color: '#8884d8' },
    { name: 'HR', value: 25, color: '#82ca9d' },
    { name: 'Finance', value: 20, color: '#ffc658' },
    { name: 'Operations', value: 20, color: '#ff7300' },
  ]
};

export const ExecutiveDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Executive Dashboard</h2>
        <p className="text-muted-foreground">
          Strategic overview of AI platform performance and business impact
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$123,000</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              +18% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
              +24% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
              -8% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Usage Trends</CardTitle>
                <CardDescription>
                  Monthly growth in queries, documents, and workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockData.monthlyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="queries" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="documents" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="workflows" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Usage Distribution</CardTitle>
                <CardDescription>
                  AI platform adoption across departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockData.departmentUsage}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {mockData.departmentUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Initiatives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Strategic Initiatives Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Legal Document Automation</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">HR Policy Q&A Deployment</span>
                  <span className="text-sm text-muted-foreground">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Finance Report Automation</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Savings Analysis</CardTitle>
              <CardDescription>
                Quantified business impact by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={mockData.costSavings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="savings" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>Total ROI</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">342%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Return on investment over 12 months
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Time Saved</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">1,247</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Hours saved per month across teams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>Productivity Gain</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">45%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average productivity increase
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Use Cases</CardTitle>
                <CardDescription>Most frequently used AI capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Document Summarization</span>
                  <Badge>1,247 uses</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Policy Q&A</span>
                  <Badge>892 uses</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contract Analysis</span>
                  <Badge>634 uses</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Report Generation</span>
                  <Badge>421 uses</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System health and reliability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>System Uptime</span>
                  <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Accuracy</span>
                  <Badge className="bg-blue-100 text-blue-800">94.2%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Satisfaction</span>
                  <Badge className="bg-purple-100 text-purple-800">4.7/5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security Score</span>
                  <Badge className="bg-orange-100 text-orange-800">A+</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>Immediate Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold">Expand to Finance Department</h4>
                  <p className="text-sm text-muted-foreground">
                    High demand for automated report generation. ROI projected at 280%.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold">Add LLaMA 3 70B Model</h4>
                  <p className="text-sm text-muted-foreground">
                    Reduce costs by 60% while maintaining performance for most use cases.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Strategic Initiatives</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold">Implement Advanced Security</h4>
                  <p className="text-sm text-muted-foreground">
                    Add multi-factor authentication and audit logging for compliance.
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-semibold">Scale Infrastructure</h4>
                  <p className="text-sm text-muted-foreground">
                    Prepare for 3x user growth with auto-scaling GPU resources.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Next Quarter Roadmap</CardTitle>
              <CardDescription>
                Recommended priorities for continued success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold">Q1: Multi-Model Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Add Mistral and Claude models for specialized use cases
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold">Q2: Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Implement predictive analytics and automated insights
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold">Q3: Enterprise Features</h4>
                    <p className="text-sm text-muted-foreground">
                      Add SAML SSO, advanced permissions, and audit trails
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

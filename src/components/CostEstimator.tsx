
import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { estimateCostClientSide, type CostEstimateInput, type CostEstimateOutput } from '@/lib/costEstimator'
import { toast } from 'sonner'

interface CostEstimatorProps {
  initialData?: Partial<CostEstimateInput>
  onCostCalculated?: (estimate: CostEstimateOutput) => void
  showTitle?: boolean
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({ 
  initialData, 
  onCostCalculated,
  showTitle = true 
}) => {
  const [formData, setFormData] = useState<CostEstimateInput>({
    data_volume_gb: 50,
    throughput_qps: 100,
    concurrent_users: 20,
    model: 'gemini-2.5',
    vector_store: 'chromadb',
    gpu_type: 'a100',
    gpu_count: 1,
    gpu_hours_per_day: 4,
    storage_class: 'standard',
    bandwidth_gb: 10,
    vm_size: 'medium',
    n8n_tier: 'basic',
    compliance_requirements: [],
    domain: 'general',
    ...initialData,
  })

  const [serverEstimate, setServerEstimate] = useState<CostEstimateOutput | null>(null)
  const [loading, setLoading] = useState(false)

  // Real-time client-side estimation
  const clientEstimate = useMemo(() => {
    return estimateCostClientSide(formData)
  }, [formData])

  // Get authoritative estimate from server
  const getServerEstimate = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('cost-estimator', {
        body: formData
      })

      if (error) throw error

      setServerEstimate(data)
      onCostCalculated?.(data)
      toast.success('Cost estimate calculated successfully')
    } catch (error) {
      console.error('Cost estimation error:', error)
      toast.error('Failed to calculate accurate cost estimate')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CostEstimateInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const estimate = serverEstimate || clientEstimate

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">AI Platform Cost Estimator</h2>
          <p className="text-muted-foreground">
            Get accurate cost estimates for your AI platform deployment
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Adjust your requirements to see real-time cost estimates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="infrastructure" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                  <TabsTrigger value="ai-models">AI Models</TabsTrigger>
                  <TabsTrigger value="storage">Storage</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="infrastructure" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>VM Size</Label>
                      <Select value={formData.vm_size} onValueChange={(value) => handleInputChange('vm_size', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (2 vCPU, 4GB) - $15/mo</SelectItem>
                          <SelectItem value="medium">Medium (4 vCPU, 8GB) - $45/mo</SelectItem>
                          <SelectItem value="large">Large (8 vCPU, 16GB) - $120/mo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>n8n Automation Tier</Label>
                      <Select value={formData.n8n_tier} onValueChange={(value) => handleInputChange('n8n_tier', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic - $10/mo</SelectItem>
                          <SelectItem value="pro">Pro - $25/mo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Throughput (QPS)</Label>
                      <Input
                        type="number"
                        value={formData.throughput_qps}
                        onChange={(e) => handleInputChange('throughput_qps', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Concurrent Users</Label>
                      <Input
                        type="number"
                        value={formData.concurrent_users}
                        onChange={(e) => handleInputChange('concurrent_users', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Bandwidth (GB/month)</Label>
                      <Input
                        type="number"
                        value={formData.bandwidth_gb}
                        onChange={(e) => handleInputChange('bandwidth_gb', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ai-models" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>AI Model</Label>
                      <Select value={formData.model} onValueChange={(value) => handleInputChange('model', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini-2.5">Gemini 2.5 Pro</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude-3">Claude 3</SelectItem>
                          <SelectItem value="llama3-70b">LLaMA 3 70B (Self-hosted)</SelectItem>
                          <SelectItem value="local-model">Local Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Vector Store</Label>
                      <Select value={formData.vector_store} onValueChange={(value) => handleInputChange('vector_store', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chromadb">ChromaDB</SelectItem>
                          <SelectItem value="weaviate">Weaviate</SelectItem>
                          <SelectItem value="pinecone">Pinecone</SelectItem>
                          <SelectItem value="qdrant">Qdrant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>GPU Type</Label>
                      <Select value={formData.gpu_type} onValueChange={(value) => handleInputChange('gpu_type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="t4">NVIDIA T4 - $0.35/hr</SelectItem>
                          <SelectItem value="a100">NVIDIA A100 - $2.50/hr</SelectItem>
                          <SelectItem value="h100">NVIDIA H100 - $4.20/hr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>GPU Count</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.gpu_count}
                        onChange={(e) => handleInputChange('gpu_count', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>GPU Hours per Day: {formData.gpu_hours_per_day}</Label>
                      <Slider
                        value={[formData.gpu_hours_per_day]}
                        onValueChange={([value]) => handleInputChange('gpu_hours_per_day', value)}
                        max={24}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="storage" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data Volume (GB)</Label>
                      <Input
                        type="number"
                        value={formData.data_volume_gb}
                        onChange={(e) => handleInputChange('data_volume_gb', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div>
                      <Label>Storage Class</Label>
                      <Select value={formData.storage_class} onValueChange={(value) => handleInputChange('storage_class', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard ($0.023/GB)</SelectItem>
                          <SelectItem value="archive">Archive ($0.002/GB)</SelectItem>
                          <SelectItem value="premium">Premium ($0.045/GB)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                  <div>
                    <Label>Domain</Label>
                    <Select value={formData.domain} onValueChange={(value) => handleInputChange('domain', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <Button onClick={getServerEstimate} disabled={loading} className="w-full">
                {loading ? 'Calculating...' : 'Get Detailed Estimate'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Cost Estimate</span>
                {!serverEstimate && (
                  <Badge variant="outline">Real-time</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(estimate.total_monthly_cost)}
                </div>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="font-semibold">Breakdown</h4>
                {Object.entries(estimate.breakdown_by_category).map(([category, amount]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span>{category}</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="font-semibold">Line Items</h4>
                <Table>
                  <TableBody>
                    {Object.entries(estimate.line_items).map(([item, cost]) => (
                      <TableRow key={item}>
                        <TableCell className="py-1 text-sm">{item}</TableCell>
                        <TableCell className="py-1 text-sm text-right">{formatCurrency(cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {estimate.recommendations.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Recommendations</span>
                    </h4>
                    <ul className="text-sm space-y-1">
                      {estimate.recommendations.map((rec, index) => (
                        <li key={index} className="text-muted-foreground">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

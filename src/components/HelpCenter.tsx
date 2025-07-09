
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Search, Book, MessageCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const faqs = [
  {
    question: "How do I connect my Slack workspace?",
    answer: "Go to Settings > Integrations and click 'Connect Slack'. You'll need admin permissions in your Slack workspace.",
    category: "Integration"
  },
  {
    question: "What file formats are supported?",
    answer: "We support PDF, DOC, DOCX, TXT, MD, and HTML files. Maximum file size is 10MB per document.",
    category: "Documents"
  },
  {
    question: "How accurate are the AI responses?",
    answer: "Our AI typically achieves 85-95% accuracy depending on document quality and question complexity. Confidence scores are shown with each response.",
    category: "AI"
  },
  {
    question: "Can I restrict access to certain documents?",
    answer: "Yes, use document tags and role-based permissions to control who can access specific content.",
    category: "Security"
  }
];

export default function HelpCenter() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState(faqs);

  const handleSearch = (query: string) => {
    setQuestion(query);
    if (query.trim()) {
      const filtered = faqs.filter(faq => 
        faq.question.toLowerCase().includes(query.toLowerCase()) ||
        faq.answer.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      
      // Simulate AI FAQ search
      if (filtered.length > 0) {
        setAnswer(filtered[0].answer);
      } else {
        setAnswer("I couldn't find a specific answer to your question. Please check our documentation or contact support.");
      }
    } else {
      setSearchResults(faqs);
      setAnswer(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="fixed bottom-4 right-4 z-50 shadow-lg"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Help & Support
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ask a question or search FAQs..."
                value={question}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* AI Answer */}
            {answer && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-2">AI Assistant</h4>
                      <p className="text-sm">{answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQ Results */}
            <div>
              <h3 className="font-medium mb-3">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {searchResults.map((faq, index) => (
                  <Card key={index} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{faq.question}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Book className="h-4 w-4 mr-2" />
                Documentation
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/getting-started" target="_blank" className="justify-start">
                    Getting Started
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/integrations" target="_blank" className="justify-start">
                    Integrations
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/api" target="_blank" className="justify-start">
                    API Reference
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/docs/troubleshooting" target="_blank" className="justify-start">
                    Troubleshooting
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Need more help? Contact us at{" "}
              <a href="mailto:support@example.com" className="text-primary hover:underline">
                support@example.com
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

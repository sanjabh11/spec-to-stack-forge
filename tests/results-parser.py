
#!/usr/bin/env python3
"""
Test Results Parser and Formatter
Generates tabular reports from test execution
"""

import json
import sys
from datetime import datetime
import subprocess
import os

class TestResultsFormatter:
    def __init__(self):
        self.features_status = {}
        
    def parse_test_results(self, results_file="test-results.json"):
        """Parse test results and generate summary"""
        try:
            with open(results_file, 'r') as f:
                data = json.load(f)
            
            # Organize by feature
            features = {}
            for result in data['results']:
                feature = result['feature']
                if feature not in features:
                    features[feature] = {
                        'tests': [],
                        'passed': 0,
                        'failed': 0,
                        'skipped': 0,
                        'total': 0
                    }
                
                features[feature]['tests'].append(result)
                features[feature]['total'] += 1
                
                if result['status'] == 'PASS':
                    features[feature]['passed'] += 1
                elif result['status'] == 'FAIL':
                    features[feature]['failed'] += 1
                else:
                    features[feature]['skipped'] += 1
            
            return data['summary'], features
            
        except FileNotFoundError:
            print("❌ Test results file not found. Run tests first.")
            return None, None
        except json.JSONDecodeError:
            print("❌ Invalid JSON in test results file.")
            return None, None

    def generate_tabular_report(self, summary, features):
        """Generate tabular report for analysis"""
        
        print("\n" + "="*80)
        print(" 🧪 AI ADVISOR PLATFORM - COMPREHENSIVE TEST RESULTS")
        print("="*80)
        
        print(f"\n📊 OVERALL SUMMARY:")
        print(f"{'Metric':<20} {'Value':<15} {'Status':<15}")
        print("-" * 50)
        print(f"{'Total Tests':<20} {summary['total']:<15} {'✅' if summary['total'] > 0 else '❌'}")
        print(f"{'Passed':<20} {summary['passed']:<15} {'✅' if summary['passed'] > 0 else '❌'}")
        print(f"{'Failed':<20} {summary['failed']:<15} {'❌' if summary['failed'] > 0 else '✅'}")
        print(f"{'Skipped':<20} {summary['skipped']:<15} {'⏭️'}")
        print(f"{'Success Rate':<20} {summary['success_rate']:.1f}%<15} {'✅' if summary['success_rate'] >= 80 else '⚠️' if summary['success_rate'] >= 60 else '❌'}")
        
        print(f"\n📋 FEATURE-BY-FEATURE ANALYSIS:")
        print(f"{'Feature':<30} {'Tests':<8} {'Pass':<6} {'Fail':<6} {'Skip':<6} {'Rate':<8} {'Status':<10}")
        print("-" * 80)
        
        feature_priorities = {
            'Authentication & RBAC': 'HIGH',
            'LLM Inference Service': 'HIGH', 
            'RAG System': 'HIGH',
            'Requirement Wizard': 'HIGH',
            'UI Components': 'HIGH',
            'Artifact Generation': 'MEDIUM',
            'Deployment Infrastructure': 'MEDIUM',
            'Observability': 'MEDIUM',
            'Streamlit UI': 'LOW',
            'GitHub Integration': 'LOW'
        }
        
        critical_issues = []
        
        for feature_name, feature_data in features.items():
            total = feature_data['total']
            passed = feature_data['passed']
            failed = feature_data['failed']
            skipped = feature_data['skipped']
            
            # Calculate success rate (excluding skipped)
            effective_total = total - skipped
            success_rate = (passed / effective_total * 100) if effective_total > 0 else 0
            
            # Determine status
            priority = feature_priorities.get(feature_name, 'MEDIUM')
            if failed == 0:
                status = "✅ GOOD"
            elif failed <= 2 and priority != 'HIGH':
                status = "⚠️ MINOR"
            elif failed <= 1 and priority == 'HIGH':
                status = "⚠️ REVIEW"
            else:
                status = "❌ CRITICAL"
                if priority == 'HIGH':
                    critical_issues.append(feature_name)
            
            print(f"{feature_name[:29]:<30} {total:<8} {passed:<6} {failed:<6} {skipped:<6} {success_rate:.1f}%<8} {status:<10}")
        
        # Beta readiness assessment
        print(f"\n🚀 BETA DEPLOYMENT READINESS:")
        print("-" * 40)
        
        overall_ready = summary['success_rate'] >= 75
        critical_issues_count = len(critical_issues)
        
        if overall_ready and critical_issues_count == 0:
            deployment_status = "✅ READY FOR BETA"
            deployment_details = "All systems operational, proceed with confidence"
        elif overall_ready and critical_issues_count <= 1:
            deployment_status = "⚠️ READY WITH MONITORING" 
            deployment_details = "Deploy but monitor closely for issues"
        elif summary['success_rate'] >= 60:
            deployment_status = "⚠️ CONDITIONAL DEPLOYMENT"
            deployment_details = "Fix critical issues first, then deploy with caution"
        else:
            deployment_status = "❌ NOT READY"
            deployment_details = "Too many failures, significant fixes needed"
        
        print(f"Status: {deployment_status}")
        print(f"Recommendation: {deployment_details}")
        print(f"Critical Issues: {critical_issues_count}")
        
        if critical_issues:
            print(f"Critical Features to Fix:")
            for issue in critical_issues:
                print(f"  • {issue}")
        
        # Specific recommendations
        print(f"\n💡 SPECIFIC RECOMMENDATIONS:")
        print("-" * 40)
        
        recommendations = []
        
        if summary['success_rate'] < 80:
            recommendations.append("Focus on fixing failing tests before deployment")
        
        for feature_name, feature_data in features.items():
            if feature_data['failed'] > 0:
                priority = feature_priorities.get(feature_name, 'MEDIUM')
                if priority == 'HIGH':
                    recommendations.append(f"Fix {feature_name} issues immediately (HIGH priority)")
                elif feature_data['failed'] > 2:
                    recommendations.append(f"Address multiple failures in {feature_name}")
        
        if not recommendations:
            recommendations.append("All systems looking good! Proceed with deployment.")
        
        for i, rec in enumerate(recommendations[:5], 1):
            print(f"{i}. {rec}")
        
        # Next steps
        print(f"\n🔄 NEXT STEPS:")
        print("-" * 20)
        if deployment_status.startswith("✅"):
            print("1. Run beta-deployment-check.sh")
            print("2. Deploy with deploy-enhanced-platform.sh") 
            print("3. Start beta testing with limited users")
            print("4. Monitor with observability dashboard")
        else:
            print("1. Fix critical failing tests")
            print("2. Re-run test suite")
            print("3. Verify all HIGH priority features pass")
            print("4. Then proceed with deployment")
        
        return deployment_status.startswith("✅")

def main():
    """Run test results analysis"""
    formatter = TestResultsFormatter()
    
    # Check if results exist, if not run tests
    if not os.path.exists("test-results.json"):
        print("🏃 No test results found. Running tests first...")
        try:
            subprocess.run(["python3", "tests/comprehensive-test-suite.py"], check=True)
        except subprocess.CalledProcessError:
            print("❌ Tests failed to execute")
            sys.exit(1)
    
    # Parse and format results
    summary, features = formatter.parse_test_results()
    
    if summary and features:
        ready_for_beta = formatter.generate_tabular_report(summary, features)
        
        # Export summary for CI/CD
        with open("deployment-readiness.json", "w") as f:
            json.dump({
                "ready_for_beta": ready_for_beta,
                "success_rate": summary['success_rate'],
                "total_tests": summary['total'],
                "failed_tests": summary['failed'],
                "timestamp": datetime.now().isoformat()
            }, f, indent=2)
        
        sys.exit(0 if ready_for_beta else 1)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()


import streamlit as st
import requests
import json
import pandas as pd
from typing import Dict, Any

# Configure page
st.set_page_config(
    page_title="AI Advisor - No-Code Platform",
    page_icon="🤖",
    layout="wide"
)

# Initialize session state
if "step" not in st.session_state:
    st.session_state.step = 1
if "spec" not in st.session_state:
    st.session_state.spec = {
        "domain": None,
        "subdomain": None,
        "dataSources": [],
        "throughput": 50,
        "concurrency": 10,
        "sla": "99.9%",
        "complianceFlags": [],
        "llmProvider": None,
        "tokenBudget": 10000,
        "vectorStore": "chromadb"
    }

# API Configuration
API_BASE_URL = st.secrets.get("API_BASE_URL", "http://localhost:8000")
API_KEY = st.secrets.get("API_KEY", "demo-key")

def save_uploaded_file(uploaded_file, filename: str):
    """Save uploaded file to temp directory"""
    with open(f"temp/{filename}", "wb") as f:
        f.write(uploaded_file.getbuffer())
    return f"temp/{filename}"

def call_api(endpoint: str, data: Dict[Any, Any]) -> Dict[Any, Any]:
    """Make API call to backend"""
    try:
        response = requests.post(
            f"{API_BASE_URL}{endpoint}",
            json=data,
            headers={"Authorization": f"Bearer {API_KEY}"}
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        st.error(f"API Error: {str(e)}")
        return {}

# Main app layout
st.title("🤖 AI Advisor - No-Code Platform Builder")
st.markdown("Build enterprise AI solutions without coding")

# Progress bar
progress = (st.session_state.step - 1) / 5
st.progress(progress)

# Step 1: Domain Selection
if st.session_state.step == 1:
    st.header("Step 1: Choose Your Domain")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Select Industry Domain")
        domain = st.selectbox(
            "Which industry are you in?",
            ["Legal", "Healthcare", "HR", "Finance", "Manufacturing", "Retail"]
        )
        
        # Domain-specific info
        domain_info = {
            "Legal": "Build AI for contract analysis, legal research, and compliance",
            "Healthcare": "Create AI for medical records, patient care, and diagnostics",
            "HR": "Develop AI for recruitment, employee support, and policy management",
            "Finance": "Implement AI for risk analysis, fraud detection, and reporting",
            "Manufacturing": "Deploy AI for quality control, maintenance, and optimization",
            "Retail": "Use AI for customer service, inventory, and personalization"
        }
        
        st.info(domain_info[domain])
    
    with col2:
        st.subheader("Example Use Cases")
        use_cases = {
            "Legal": ["Contract Review", "Legal Research", "Compliance Monitoring"],
            "Healthcare": ["Medical Q&A", "Patient Records", "Treatment Suggestions"],
            "HR": ["Policy Questions", "Onboarding", "Employee Support"],
            "Finance": ["Risk Assessment", "Report Generation", "Fraud Detection"],
            "Manufacturing": ["Quality Control", "Maintenance Alerts", "Process Optimization"],
            "Retail": ["Customer Support", "Product Recommendations", "Inventory Management"]
        }
        
        for use_case in use_cases[domain]:
            st.markdown(f"• {use_case}")
    
    if st.button("Next: Define Subdomain →", type="primary"):
        st.session_state.spec["domain"] = domain.lower()
        st.session_state.step = 2
        st.rerun()

# Step 2: Subdomain & Data Sources
elif st.session_state.step == 2:
    st.header("Step 2: Define Subdomain & Upload Data")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Specify Subdomain")
        subdomain = st.text_input(
            "Subdomain (e.g., 'clinical_notes', 'employment_law')",
            placeholder="Enter a specific area within your domain"
        )
        
        st.subheader("Vector Store Selection")
        vector_store = st.selectbox(
            "Choose vector database",
            ["chromadb", "weaviate", "llamaindex-chroma"],
            help="ChromaDB for simple setup, Weaviate for advanced features, LlamaIndex for enhanced RAG"
        )
        
        st.session_state.spec["vectorStore"] = vector_store
    
    with col2:
        st.subheader("Upload Documents")
        uploaded_files = st.file_uploader(
            "Upload your knowledge base documents",
            accept_multiple_files=True,
            type=['pdf', 'txt', 'docx', 'md']
        )
        
        if uploaded_files:
            st.success(f"Uploaded {len(uploaded_files)} files")
            for file in uploaded_files:
                st.write(f"📄 {file.name} ({file.size} bytes)")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("← Back"):
            st.session_state.step = 1
            st.rerun()
    
    with col2:
        if st.button("Next: Configure Scale →", type="primary"):
            if subdomain and uploaded_files:
                st.session_state.spec["subdomain"] = subdomain
                # Save files (in production, upload to storage)
                doc_paths = []
                for file in uploaded_files:
                    path = save_uploaded_file(file, file.name)
                    doc_paths.append(path)
                st.session_state.spec["dataSources"] = doc_paths
                st.session_state.step = 3
                st.rerun()
            else:
                st.error("Please provide subdomain and upload at least one document")

# Step 3: Scale & Compliance
elif st.session_state.step == 3:
    st.header("Step 3: Configure Scale & Compliance")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Performance Requirements")
        throughput = st.slider(
            "Expected throughput (messages/second)",
            min_value=1, max_value=500, value=50
        )
        
        concurrency = st.slider(
            "Concurrent users",
            min_value=1, max_value=1000, value=10
        )
        
        sla = st.radio(
            "SLA Target",
            ["95%", "99%", "99.9%", "99.99%"],
            help="Higher SLA requires more robust infrastructure"
        )
    
    with col2:
        st.subheader("Compliance & Security")
        compliance_flags = st.multiselect(
            "Compliance Requirements",
            ["HIPAA", "GDPR", "SOC2", "PCI-DSS", "ISO27001"],
            help="Select applicable compliance standards"
        )
        
        st.subheader("Estimated Monthly Cost")
        # Simple cost calculation
        base_cost = throughput * 0.1 + concurrency * 2
        compliance_cost = len(compliance_flags) * 50
        total_cost = base_cost + compliance_cost
        
        st.metric("Base Infrastructure", f"${base_cost:.2f}")
        st.metric("Compliance Overhead", f"${compliance_cost:.2f}")
        st.metric("Total Monthly Cost", f"${total_cost:.2f}")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("← Back"):
            st.session_state.step = 2
            st.rerun()
    
    with col2:
        if st.button("Next: Select Models →", type="primary"):
            st.session_state.spec.update({
                "throughput": throughput,
                "concurrency": concurrency,
                "sla": sla,
                "complianceFlags": compliance_flags
            })
            st.session_state.step = 4
            st.rerun()

# Step 4: Model & Budget Selection
elif st.session_state.step == 4:
    st.header("Step 4: Select AI Models & Budget")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Primary LLM")
        llm_provider = st.selectbox(
            "Select Large Language Model",
            ["LLaMA 3 70B (Self-hosted)", "Gemini 2.5 Pro (API)", "Mistral 7B (Self-hosted)"],
            help="Self-hosted models offer better privacy and cost control"
        )
        
        # Model comparison table
        model_data = {
            "Model": ["LLaMA 3 70B", "Gemini 2.5 Pro", "Mistral 7B"],
            "Type": ["Self-hosted", "API", "Self-hosted"],
            "Cost/1K tokens": ["$0.00", "$0.03", "$0.00"],
            "Privacy": ["High", "Medium", "High"],
            "Performance": ["Excellent", "Excellent", "Good"]
        }
        
        st.dataframe(pd.DataFrame(model_data), use_container_width=True)
    
    with col2:
        st.subheader("Budget & Limits")
        token_budget = st.number_input(
            "Monthly token budget",
            min_value=1000,
            max_value=1000000,
            value=50000,
            step=1000
        )
        
        st.subheader("Additional Services")
        enable_embeddings = st.checkbox("Enable document embeddings", value=True)
        enable_summarization = st.checkbox("Enable auto-summarization", value=True)
        enable_monitoring = st.checkbox("Enable advanced monitoring", value=True)
        
        # Budget breakdown
        st.subheader("Budget Breakdown")
        llm_cost = 0 if "Self-hosted" in llm_provider else token_budget * 0.03 / 1000
        embedding_cost = 20 if enable_embeddings else 0
        monitoring_cost = 30 if enable_monitoring else 0
        
        st.write(f"LLM Cost: ${llm_cost:.2f}")
        st.write(f"Embeddings: ${embedding_cost:.2f}")
        st.write(f"Monitoring: ${monitoring_cost:.2f}")
        st.write(f"**Total: ${llm_cost + embedding_cost + monitoring_cost:.2f}**")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("← Back"):
            st.session_state.step = 3
            st.rerun()
    
    with col2:
        if st.button("Next: Review & Deploy →", type="primary"):
            st.session_state.spec.update({
                "llmProvider": llm_provider,
                "tokenBudget": token_budget
            })
            st.session_state.step = 5
            st.rerun()

# Step 5: Review & Generate
elif st.session_state.step == 5:
    st.header("Step 5: Review & Generate Platform")
    
    # Display final specification
    st.subheader("Platform Specification")
    spec_display = st.session_state.spec.copy()
    spec_display["dataSources"] = f"{len(spec_display['dataSources'])} documents uploaded"
    
    st.json(spec_display)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("What happens next?")
        st.write("1. Generate infrastructure code")
        st.write("2. Set up vector database")
        st.write("3. Deploy AI models")
        st.write("4. Configure workflows")
        st.write("5. Create monitoring dashboard")
    
    with col2:
        st.subheader("Estimated Deployment Time")
        st.metric("Setup Time", "15-30 minutes")
        st.metric("Go-Live", "Within 1 hour")
    
    # Action buttons
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("← Back to Models"):
            st.session_state.step = 4
            st.rerun()
    
    with col2:
        if st.button("💾 Save Specification"):
            # Save spec to file
            with open("platform_spec.json", "w") as f:
                json.dump(st.session_state.spec, f, indent=2)
            st.success("Specification saved!")
    
    with col3:
        if st.button("🚀 Generate Platform", type="primary"):
            with st.spinner("Generating your AI platform..."):
                # Call the generation API
                result = call_api("/api/generate-platform", {
                    "spec": st.session_state.spec,
                    "tenantId": "streamlit-user",
                    "userId": "streamlit"
                })
                
                if result:
                    st.success("🎉 Platform generated successfully!")
                    st.balloons()
                    
                    # Show results
                    st.subheader("Generated Assets")
                    if "artifacts" in result:
                        for artifact in result["artifacts"]:
                            st.write(f"✅ {artifact}")
                    
                    # Show next steps
                    st.subheader("Next Steps")
                    st.write("1. Access your admin dashboard")
                    st.write("2. Upload documents to knowledge base")
                    st.write("3. Test the AI assistant")
                    st.write("4. Invite team members")
                    
                    if st.button("Open Admin Dashboard"):
                        st.link_button("Go to Dashboard", "http://localhost:8080/admin")

# Sidebar with help
with st.sidebar:
    st.header("Help & Support")
    
    st.subheader("Current Step")
    steps = [
        "Domain Selection",
        "Data & Subdomain",
        "Scale & Compliance",
        "Models & Budget",
        "Review & Deploy"
    ]
    
    for i, step in enumerate(steps, 1):
        if i == st.session_state.step:
            st.write(f"➤ **{i}. {step}**")
        elif i < st.session_state.step:
            st.write(f"✅ {i}. {step}")
        else:
            st.write(f"⭕ {i}. {step}")
    
    st.divider()
    
    st.subheader("Quick Start")
    if st.button("Reset to Start"):
        st.session_state.step = 1
        st.session_state.spec = {
            "domain": None,
            "subdomain": None,
            "dataSources": [],
            "throughput": 50,
            "concurrency": 10,
            "sla": "99.9%",
            "complianceFlags": [],
            "llmProvider": None,
            "tokenBudget": 10000,
            "vectorStore": "chromadb"
        }
        st.rerun()
    
    st.subheader("Documentation")
    st.write("📚 [User Guide](https://docs.aiplatform.com)")
    st.write("🔧 [API Reference](https://api.aiplatform.com)")
    st.write("💬 [Support Chat](https://support.aiplatform.com)")

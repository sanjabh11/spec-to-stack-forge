# Enterprise LLM App Comprehensive Test Suite
# Can be converted into codeLLM tasks or CI scripts

---

unit_tests:
  prompt_builders:
    - name: test_system_prompt_contains_instructions
      code: |
        def test_system_prompt_contains_instructions():
            prompt = build_prompt("healthcare")
            assert "Ask one question at a time" in prompt

    - name: test_next_question_prompt_flow
      code: |
        def test_next_question_prompt_flow():
            history = ["domain: healthcare"]
            next_prompt = build_next_prompt(history)
            assert "What kind of data" in next_prompt

  spec_validation:
    - name: test_valid_spec
      code: |
        def test_valid_spec():
            spec = {"throughput": 100, "token_budget": 5000, "compliance": ["HIPAA"]}
            assert validate_spec(spec)

    - name: test_missing_field
      code: |
        def test_missing_field():
            spec = {"token_budget": 5000}
            with pytest.raises(SpecValidationError):
                validate_spec(spec)

integration_tests:
  api_flows:
    - name: test_start_spec_api
      code: |
        def test_start_spec_api(client):
            response = client.post("/api/requirements/start", headers=auth_header(), json={"tenant_id": "t1", "user_id": "u1"})
            assert response.status_code == 200
            data = response.json()
            assert "question" in data

    - name: test_artifact_generation_pipeline
      code: |
        def test_generate_artifacts(client):
            response = client.post("/api/generate", headers=auth_header(), json={"spec_id": "spec123"})
            assert response.status_code == 200
            assert "terraform" in response.json()

end_to_end_tests:
  playwright:
    - name: full_user_journey
      code: |
        import { test, expect } from '@playwright/test';

        test('full healthcare journey', async ({ page }) => {
          await page.goto('http://localhost:3000');
          await page.getByText('Start New Spec').click();
          await page.fill('#domain', 'healthcare');
          await page.click('text=Submit');

          for (let i = 0; i < 5; i++) {
            await page.click('text=Answer');
            await page.waitForTimeout(300);
          }

          await page.click('text=Generate Artifacts');
          await expect(page.locator('text=Terraform')).toBeVisible();
        });

performance_tests:
  k6:
    - name: k6_basic_load
      code: |
        import http from 'k6/http';
        import { check, sleep } from 'k6';

        export let options = {
          vus: 20,
          duration: '1m',
        };

        export default function () {
          let res = http.post('http://localhost:8000/api/chat', JSON.stringify({
              input: "What is RAG?"
          }), {
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${__ENV.JWT}` },
          });

          check(res, {
              'status is 200': (r) => r.status === 200,
              'response time < 2000ms': (r) => r.timings.duration < 2000
          });
          sleep(1);
        }

security_tests:
  python_rls:
    - name: test_rls_isolation
      code: |
        def test_rls_isolation():
            response = client.get("/api/requirements/spec_from_other_tenant", headers={"Authorization": "Bearer tenantA_JWT"})
            assert response.status_code == 403

compliance_tests:
  terraform_validation:
    - name: validate_hipaa_flags
      code: |
        def test_hipaa_flag_in_terraform():
            tf = parse_terraform("infra/main.tf")
            assert tf["aws_ebs_volume"]["encrypted"] is True
            assert "log_retention_days" in tf["aws_cloudwatch_log_group"]

smoke_tests:
  bash:
    - name: smoke_test_health
      code: |
        #!/bin/bash
        set -e
        echo "Running health check"
        curl -sf http://localhost:8000/health || exit 1

    - name: smoke_test_start_spec
      code: |
        #!/bin/bash
        set -e
        resp=$(curl -sf -X POST http://localhost:8000/api/requirements/start \
          -H "Authorization: Bearer $JWT" \
          -d '{"tenant_id":"t1","user_id":"u1"}')
        echo "$resp"
        echo "Smoke test passed."

# Additional tests for core system features

core_system_tests:
  auth_multitenancy:
    - name: test_user_signup_and_login
      code: |
        def test_user_signup_and_login(client, supabase):
            # Sign up a new user and tenant
            user = supabase.auth.sign_up({"email":"test@example.com","password":"pass"})
            assert user.id is not None
            # Exchange token
            res = client.post("/api/auth/login", json={"email":"test@example.com","password":"pass"})
            assert res.status_code == 200
            assert "access_token" in res.json()

    - name: test_rbac_roles_and_permissions
      code: |
        def test_rbac_roles_and_permissions(client, auth_header):
            # Admin can create spec
            res1 = client.post("/api/requirements/start", headers=auth_header(role="admin"), json={"tenant_id":"t1","user_id":"admin1"})
            assert res1.status_code == 200
            # Analyst cannot delete tenant
            res2 = client.delete("/api/tenants/t1", headers=auth_header(role="analyst"))
            assert res2.status_code == 403

  data_storage_layer:
    - name: test_supabase_postgres_metadata_storage
      code: |
        def test_metadata_persistence(supabase):
            spec = {"throughput":10, "token_budget":1000, "compliance":[]}
            spec_id = supabase.from_('specs').insert({"tenant_id":"t1","payload":spec}).execute()
            row = supabase.from_('specs').select('*').eq('id', spec_id).single().execute()
            assert row['payload'] == spec

    - name: test_chromadb_vector_storage
      code: |
        def test_chromadb_embedding_store(chromadb_client):
            text = "Test vector"
            vec = chromadb_client.embed(text)
            chromadb_client.upsert([("doc1", vec)])
            results = chromadb_client.query(vec)
            assert any(r['id'] == 'doc1' for r in results)

  live_n8n_execution:
    - name: test_n8n_workflow_run
      code: |
        def test_n8n_workflow_run(n8n_client):
            workflow = load_json('workflow/test.json')
            res = n8n_client.execute_workflow(workflow)
            assert res.status_code == 200
            assert 'nodes' in res.json()

  chat_interface_tests:
    - name: test_rag_chat_ui_display
      code: |
        import { test, expect } from '@playwright/test';

        test('RAG chat displays responses', async ({ page }) => {
          await page.goto('http://localhost:3000/chat');
          await page.fill('textarea', 'What is the HIPAA rule?');
          await page.click('button:has-text("Send")');
          await expect(page.locator('.chat-response')).toContainText('HIPAA');
        });

  deployment_infrastructure_tests:
    - name: test_docker_compose_up
      code: |
        #!/bin/bash
        set -e
        docker-compose -f docker-compose.yml up -d
        # Wait for services
        sleep 10
        curl -sf http://localhost:8000/health || { echo "Health check failed"; exit 1; }
        docker-compose down

    - name: test_kubernetes_deployment
      code: |
        #!/bin/bash
        set -e
        kubectl apply -f k8s/deployment.yml
        kubectl rollout status deployment/ai-advisor
        kubectl delete -f k8s/deployment.yml

  bash:
    - name: smoke_test_health
      code: |
        #!/bin/bash
        set -e
        echo "Running smoke test"
        curl -sf http://localhost:8000/health || exit 1

    - name: smoke_test_start_spec
      code: |
        #!/bin/bash
        set -e
        resp=$(curl -sf -X POST http://localhost:8000/api/requirements/start \
          -H "Authorization: Bearer $JWT" \
          -d '{"tenant_id":"t1","user_id":"u1"}')
        echo "$resp"
        echo "Smoke test passed."
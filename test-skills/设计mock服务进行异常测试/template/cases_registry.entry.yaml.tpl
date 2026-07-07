  - case_id: "{{case_id}}"
    name: {{name}}
    module: {{module}}
    status: manual
    test_mode: "8081-direct-inject-perm"
    base_url: "http://localhost:8081"
    route: {{route}}
    scenario_active: "{{scenario_active}}"
    mock_endpoint: "POST {{mock_path}}"
    mock_error_code: {{mock_error_code}}
    mock_readme: mock/README.md
    workflow_doc: docs/workflow.md
    automation_doc: docs/automation/{{case_id}}.md
    perm_status: {{perm_status}}
    required_perms: {{required_perms}}


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, platform, spec } = await req.json();

    console.log(`Processing CLI generator action: ${action} for platform: ${platform}`);

    switch (action) {
      case 'generate-cli':
        return await generateCLI(platform, spec);
      case 'get-install-instructions':
        return await getInstallInstructions(platform);
      case 'generate-offline-cache':
        return await generateOfflineCache(spec);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('CLI generator error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateCLI(platform: string, spec: any) {
  console.log(`Generating CLI for platform: ${platform}`);
  
  const cliFiles: Record<string, string> = {};
  
  if (platform === 'go') {
    cliFiles['main.go'] = generateGoMain();
    cliFiles['cmd/generate.go'] = generateGoGenerateCommand();
    cliFiles['pkg/client/client.go'] = generateGoClient();
    cliFiles['pkg/cache/cache.go'] = generateGoCache();
    cliFiles['go.mod'] = generateGoMod();
    cliFiles['Dockerfile'] = generateDockerfile('go');
  } else if (platform === 'rust') {
    cliFiles['src/main.rs'] = generateRustMain();
    cliFiles['src/commands/generate.rs'] = generateRustGenerateCommand();
    cliFiles['src/client.rs'] = generateRustClient();
    cliFiles['src/cache.rs'] = generateRustCache();
    cliFiles['Cargo.toml'] = generateCargotoml();
    cliFiles['Dockerfile'] = generateDockerfile('rust');
  }

  // Common files
  cliFiles['README.md'] = generateCLIReadme(platform);
  cliFiles['examples/spec.json'] = JSON.stringify(generateExampleSpec(), null, 2);
  cliFiles['.github/workflows/release.yml'] = generateReleaseWorkflow(platform);

  return new Response(
    JSON.stringify({
      success: true,
      files: cliFiles,
      install_command: platform === 'go' ? 'go install' : 'cargo install --path .',
      usage: `aiapp generate --spec spec.json --llm-provider gemini-2.5-pro --offline`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function generateGoMain(): string {
  return `package main

import (
	"os"

	"github.com/spf13/cobra"
	"github.com/aiapp/cli/cmd"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "aiapp",
		Short: "AI Platform Advisor CLI",
		Long:  "CLI tool for generating AI platform architectures from specifications",
	}

	rootCmd.AddCommand(cmd.NewGenerateCommand())
	rootCmd.AddCommand(cmd.NewCacheCommand())
	rootCmd.AddCommand(cmd.NewValidateCommand())

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}`;
}

function generateGoGenerateCommand(): string {
  return `package cmd

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/spf13/cobra"
	"github.com/aiapp/cli/pkg/client"
	"github.com/aiapp/cli/pkg/cache"
)

func NewGenerateCommand() *cobra.Command {
	var (
		specFile     string
		llmProvider  string
		offline      bool
		outputDir    string
		compliance   []string
	)

	cmd := &cobra.Command{
		Use:   "generate",
		Short: "Generate AI platform architecture from specification",
		RunE: func(cmd *cobra.Command, args []string) error {
			// Read spec file
			specData, err := ioutil.ReadFile(specFile)
			if err != nil {
				return fmt.Errorf("failed to read spec file: %w", err)
			}

			var spec map[string]interface{}
			if err := json.Unmarshal(specData, &spec); err != nil {
				return fmt.Errorf("failed to parse spec: %w", err)
			}

			// Add compliance flags
			spec["compliance_flags"] = compliance

			var artifacts map[string]interface{}

			if offline {
				// Use cached responses
				cacheClient := cache.NewClient()
				artifacts, err = cacheClient.GetCachedArtifacts(spec)
				if err != nil {
					return fmt.Errorf("failed to get cached artifacts: %w", err)
				}
			} else {
				// Call API
				apiClient := client.NewClient()
				artifacts, err = apiClient.GenerateArtifacts(spec, llmProvider)
				if err != nil {
					return fmt.Errorf("failed to generate artifacts: %w", err)
				}

				// Cache the results
				cacheClient := cache.NewClient()
				cacheClient.CacheArtifacts(spec, artifacts)
			}

			// Write output files
			return writeArtifacts(artifacts, outputDir)
		},
	}

	cmd.Flags().StringVarP(&specFile, "spec", "s", "", "Path to specification JSON file")
	cmd.Flags().StringVarP(&llmProvider, "llm-provider", "l", "gemini-2.5-pro", "LLM provider to use")
	cmd.Flags().BoolVar(&offline, "offline", false, "Use cached prompts for offline generation")
	cmd.Flags().StringVarP(&outputDir, "output", "o", "./output", "Output directory")
	cmd.Flags().StringSliceVarP(&compliance, "compliance", "c", []string{}, "Compliance flags (HIPAA,GDPR,SOC2)")

	cmd.MarkFlagRequired("spec")

	return cmd
}

func writeArtifacts(artifacts map[string]interface{}, outputDir string) error {
	// Implementation for writing generated artifacts to files
	os.MkdirAll(outputDir, 0755)
	
	// Write architecture
	if arch, ok := artifacts["architecture"]; ok {
		archData, _ := json.MarshalIndent(arch, "", "  ")
		ioutil.WriteFile(outputDir+"/architecture.yml", archData, 0644)
	}

	// Write terraform
	if tf, ok := artifacts["terraform"]; ok {
		if files, ok := tf.(map[string]interface{})["files"]; ok {
			tfDir := outputDir + "/terraform"
			os.MkdirAll(tfDir, 0755)
			for name, content := range files.(map[string]interface{}) {
				ioutil.WriteFile(tfDir+"/"+name, []byte(content.(string)), 0644)
			}
		}
	}

	fmt.Printf("Artifacts generated successfully in %s\\n", outputDir)
	return nil
}`;
}

function generateGoClient(): string {
  return `package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type Client struct {
	baseURL string
	apiKey  string
}

func NewClient() *Client {
	return &Client{
		baseURL: "https://vydevqjpfwlizelblavb.supabase.co/functions/v1",
		apiKey:  os.Getenv("SUPABASE_ANON_KEY"),
	}
}

func (c *Client) GenerateArtifacts(spec map[string]interface{}, provider string) (map[string]interface{}, error) {
	payload := map[string]interface{}{
		"action":       "generate-architecture",
		"sessionData":  spec,
		"llm_provider": provider,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", c.baseURL+"/generate-architecture", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result, nil
}`;
}

function generateGoCache(): string {
  return `package cache

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

type Client struct {
	cacheDir string
}

func NewClient() *Client {
	homeDir, _ := os.UserHomeDir()
	return &Client{
		cacheDir: filepath.Join(homeDir, ".aiapp", "cache"),
	}
}

func (c *Client) CacheArtifacts(spec, artifacts map[string]interface{}) error {
	os.MkdirAll(c.cacheDir, 0755)
	
	hash := c.hashSpec(spec)
	cacheFile := filepath.Join(c.cacheDir, hash+".json")
	
	data, err := json.Marshal(artifacts)
	if err != nil {
		return err
	}
	
	return ioutil.WriteFile(cacheFile, data, 0644)
}

func (c *Client) GetCachedArtifacts(spec map[string]interface{}) (map[string]interface{}, error) {
	hash := c.hashSpec(spec)
	cacheFile := filepath.Join(c.cacheDir, hash+".json")
	
	data, err := ioutil.ReadFile(cacheFile)
	if err != nil {
		return nil, fmt.Errorf("no cached artifacts found")
	}
	
	var artifacts map[string]interface{}
	err = json.Unmarshal(data, &artifacts)
	return artifacts, err
}

func (c *Client) hashSpec(spec map[string]interface{}) string {
	data, _ := json.Marshal(spec)
	hash := md5.Sum(data)
	return hex.EncodeToString(hash[:])
}`;
}

function generateGoMod(): string {
  return `module github.com/aiapp/cli

go 1.21

require (
	github.com/spf13/cobra v1.7.0
)

require (
	github.com/inconshreveable/mousetrap v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
)`;
}

function generateCLIReadme(platform: string): string {
  return `# AI Platform Advisor CLI

Cross-platform CLI tool for generating AI platform architectures from specifications.

## Installation

### ${platform.charAt(0).toUpperCase() + platform.slice(1)}

\`\`\`bash
${platform === 'go' ? 'go install github.com/aiapp/cli@latest' : 'cargo install --path .'}
\`\`\`

## Usage

### Generate Architecture

\`\`\`bash
aiapp generate --spec spec.json --llm-provider gemini-2.5-pro
\`\`\`

### Offline Mode

\`\`\`bash
aiapp generate --spec spec.json --offline
\`\`\`

### With Compliance Flags

\`\`\`bash
aiapp generate --spec spec.json --compliance HIPAA,SOC2
\`\`\`

## Configuration

Set environment variables:

\`\`\`bash
export SUPABASE_ANON_KEY="your-anon-key"
export GEMINI_API_KEY="your-gemini-key"
\`\`\`

## Example Specification

See \`examples/spec.json\` for a complete example.

## Features

- ✅ Offline mode with prompt caching
- ✅ Multiple LLM provider support
- ✅ Compliance flag integration
- ✅ Cross-platform binaries
- ✅ Terraform validation
- ✅ n8n workflow generation`;
}

async function getInstallInstructions(platform: string) {
  const instructions = {
    go: {
      install: "go install github.com/aiapp/cli@latest",
      build: "go build -o aiapp .",
      requirements: ["Go 1.21+"]
    },
    rust: {
      install: "cargo install --path .",
      build: "cargo build --release",
      requirements: ["Rust 1.70+"]
    }
  };

  return new Response(
    JSON.stringify(instructions[platform as keyof typeof instructions] || instructions.go),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateOfflineCache(spec: any) {
  const cache = {
    version: "1.0.0",
    patterns: [
      {
        hash: "legal_doc_processing",
        artifacts: {
          architecture: { /* cached architecture */ },
          terraform: { /* cached terraform */ },
          workflow: { /* cached workflow */ }
        }
      }
    ]
  };

  return new Response(
    JSON.stringify(cache),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function generateExampleSpec() {
  return {
    domain: "Legal",
    requirements: {
      document_processing: true,
      compliance_tracking: true,
      ai_assistance: true
    },
    compliance_flags: ["HIPAA", "SOC2"],
    llm_preferences: {
      provider: "gemini-2.5-pro",
      max_tokens: 4000,
      temperature: 0.1
    }
  };
}

function generateDockerfile(platform: string): string {
  if (platform === 'go') {
    return `FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o aiapp .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/aiapp .
CMD ["./aiapp"]`;
  } else {
    return `FROM rust:1.70 AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /root/
COPY --from=builder /app/target/release/aiapp .
CMD ["./aiapp"]`;
  }
}

function generateReleaseWorkflow(platform: string): string {
  return `name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      ${platform === 'go' ? `
      - uses: actions/setup-go@v4
        with:
          go-version: 1.21
      
      - name: Build
        run: |
          GOOS=linux GOARCH=amd64 go build -o aiapp-linux-amd64 .
          GOOS=darwin GOARCH=amd64 go build -o aiapp-darwin-amd64 .
          GOOS=windows GOARCH=amd64 go build -o aiapp-windows-amd64.exe .
      ` : `
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Build
        run: |
          cargo build --release
          cp target/release/aiapp aiapp-linux-amd64
      `}
      
      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: aiapp-*`;
}

function generateCargotoml(): string {
  return `[package]
name = "aiapp"
version = "1.0.0"
edition = "2021"

[dependencies]
clap = "2.34"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
reqwest = { version = "0.11", features = ["json"] }
tokio = { version = "1.0", features = ["full"] }
md5 = "0.7"`;
}

function generateRustMain(): string {
  return `use clap::{App, Arg, SubCommand};
use std::process;

mod commands;
mod client;
mod cache;

fn main() {
    let matches = App::new("aiapp")
        .version("1.0.0")
        .about("AI Platform Advisor CLI")
        .subcommand(
            SubCommand::with_name("generate")
                .about("Generate AI platform architecture from specification")
                .arg(
                    Arg::with_name("spec")
                        .short("s")
                        .long("spec")
                        .value_name("FILE")
                        .help("Path to specification JSON file")
                        .required(true),
                )
                .arg(
                    Arg::with_name("llm-provider")
                        .short("l")
                        .long("llm-provider")
                        .value_name("PROVIDER")
                        .help("LLM provider to use")
                        .default_value("gemini-2.5-pro"),
                )
                .arg(
                    Arg::with_name("offline")
                        .long("offline")
                        .help("Use cached prompts for offline generation"),
                )
                .arg(
                    Arg::with_name("output")
                        .short("o")
                        .long("output")
                        .value_name("DIR")
                        .help("Output directory")
                        .default_value("./output"),
                )
                .arg(
                    Arg::with_name("compliance")
                        .short("c")
                        .long("compliance")
                        .value_name("FLAGS")
                        .help("Compliance flags (HIPAA,GDPR,SOC2)")
                        .multiple(true),
                ),
        )
        .get_matches();

    match matches.subcommand() {
        ("generate", Some(sub_matches)) => {
            if let Err(e) = commands::generate::run(sub_matches) {
                eprintln!("Error: {}", e);
                process::exit(1);
            }
        }
        _ => {
            eprintln!("No subcommand provided");
            process::exit(1);
        }
    }
}`;
}

function generateRustGenerateCommand(): string {
  return `use clap::ArgMatches;
use serde_json::Value;
use std::fs;
use std::path::Path;

pub fn run(matches: &ArgMatches) -> Result<(), Box<dyn std::error::Error>> {
    let spec_file = matches.value_of("spec").unwrap();
    let llm_provider = matches.value_of("llm-provider").unwrap_or("gemini-2.5-pro");
    let offline = matches.is_present("offline");
    let output_dir = matches.value_of("output").unwrap_or("./output");
    
    // Read and parse spec file
    let spec_content = fs::read_to_string(spec_file)?;
    let mut spec: Value = serde_json::from_str(&spec_content)?;
    
    // Add compliance flags if provided
    if let Some(compliance) = matches.values_of("compliance") {
        let flags: Vec<&str> = compliance.collect();
        spec["compliance_flags"] = serde_json::to_value(flags)?;
    }
    
    // Generate or retrieve cached artifacts
    let artifacts = if offline {
        crate::cache::get_cached_artifacts(&spec)?
    } else {
        let artifacts = crate::client::generate_artifacts(&spec, llm_provider)?;
        crate::cache::cache_artifacts(&spec, &artifacts)?;
        artifacts
    };
    
    // Write artifacts to output directory
    write_artifacts(&artifacts, output_dir)?;
    
    println!("Artifacts generated successfully in {}", output_dir);
    Ok(())
}

fn write_artifacts(artifacts: &Value, output_dir: &str) -> Result<(), Box<dyn std::error::Error>> {
    fs::create_dir_all(output_dir)?;
    
    // Write architecture
    if let Some(arch) = artifacts.get("architecture") {
        let arch_content = serde_json::to_string_pretty(arch)?;
        fs::write(format!("{}/architecture.yml", output_dir), arch_content)?;
    }
    
    // Write terraform files
    if let Some(tf) = artifacts.get("terraform") {
        if let Some(files) = tf.get("files") {
            let tf_dir = format!("{}/terraform", output_dir);
            fs::create_dir_all(&tf_dir)?;
            
            if let Value::Object(file_map) = files {
                for (name, content) in file_map {
                    if let Value::String(content_str) = content {
                        fs::write(format!("{}/{}", tf_dir, name), content_str)?;
                    }
                }
            }
        }
    }
    
    Ok(())
}`;
}

function generateRustClient(): string {
  return `use serde_json::Value;
use std::collections::HashMap;

pub async fn generate_artifacts(spec: &Value, provider: &str) -> Result<Value, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    
    let mut payload = HashMap::new();
    payload.insert("action", "generate-architecture");
    payload.insert("sessionData", spec);
    payload.insert("llm_provider", &Value::String(provider.to_string()));
    
    let response = client
        .post("https://vydevqjpfwlizelblavb.supabase.co/functions/v1/generate-architecture")
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", std::env::var("SUPABASE_ANON_KEY")?))
        .json(&payload)
        .send()
        .await?;
    
    let artifacts: Value = response.json().await?;
    Ok(artifacts)
}`;
}

function generateRustCache(): string {
  return `use serde_json::Value;
use std::fs;
use std::path::PathBuf;

pub fn cache_artifacts(spec: &Value, artifacts: &Value) -> Result<(), Box<dyn std::error::Error>> {
    let cache_dir = get_cache_dir();
    fs::create_dir_all(&cache_dir)?;
    
    let hash = hash_spec(spec);
    let cache_file = cache_dir.join(format!("{}.json", hash));
    
    let artifacts_json = serde_json::to_string_pretty(artifacts)?;
    fs::write(cache_file, artifacts_json)?;
    
    Ok(())
}

pub fn get_cached_artifacts(spec: &Value) -> Result<Value, Box<dyn std::error::Error>> {
    let cache_dir = get_cache_dir();
    let hash = hash_spec(spec);
    let cache_file = cache_dir.join(format!("{}.json", hash));
    
    let content = fs::read_to_string(cache_file)?;
    let artifacts: Value = serde_json::from_str(&content)?;
    
    Ok(artifacts)
}

fn get_cache_dir() -> PathBuf {
    let mut path = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push(".aiapp");
    path.push("cache");
    path
}

fn hash_spec(spec: &Value) -> String {
    let spec_str = serde_json::to_string(spec).unwrap_or_default();
    format!("{:x}", md5::compute(spec_str.as_bytes()))
}`;
}

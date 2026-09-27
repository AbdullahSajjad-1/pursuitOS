/**
 * Our Company Profile & Technical Capability Baseline
 * 
 * This defines who WE are, our core engineering specialties, technical stack,
 * delivery capacity, and sweet spot parameters. Council agents (CTO, Commercial, CEO)
 * verify all RFP requirements directly against this profile.
 */

export interface CompanyProfile {
  name: string;
  tagline: string;
  coreDomains: string[];
  techStack: {
    cloudAndInfrastructure: string[];
    erpAndEnterpriseIntegration: string[];
    iotAndEdgeTelemetry: string[];
    aiAndDataEngineering: string[];
    securityAndCompliance: string[];
  };
  deliveryCapabilities: {
    benchSize: string;
    contractSweetSpot: string;
    certifications: string[];
    deliveryModel: string;
  };
  outOfScopeDomains: string[];
  valueProposition: string;
}

export const OUR_COMPANY: CompanyProfile = {
  name: "PursuitOS Solutions (Apex Enterprise Systems)",
  tagline: "Global Cloud Transformation, Industrial IoT, and Enterprise Applied AI",
  coreDomains: [
    "Enterprise Multi-Cloud Infrastructure & Distributed Systems",
    "Industrial IoT Telemetry & Factory Edge Processing",
    "Enterprise ERP Modernization & Bidirectional Integration",
    "Applied Machine Learning & Predictive Optimization Engines",
    "Zero-Trust Architecture & Mission-Critical Cyber Defense"
  ],
  techStack: {
    cloudAndInfrastructure: [
      "Kubernetes (EKS, GKE, AKS, OpenShift)",
      "Multi-Region High Availability (99.995% uptime architectures)",
      "Terraform, OpenTofu, Infrastructure as Code",
      "Event-Driven Microservices (gRPC, Envoy, Istio Service Mesh)",
      "Autonomous Rollback & Automated Canary Deployments"
    ],
    erpAndEnterpriseIntegration: [
      "SAP S/4HANA Cloud & On-Premise Bidirectional Connectors",
      "Legacy AS/400 & Mainframe Data Extraction Adapters",
      "Apache Kafka, RabbitMQ, and Distributed Event Streaming",
      "Enterprise Data Pipelines & Master Data Management (MDM)",
      "REST, SOAP, EDIFACT, and Custom Protocol Gateways"
    ],
    iotAndEdgeTelemetry: [
      "MQTT, OPC-UA, and Modbus Industrial Protocol Ingestion",
      "Edge Node Telemetry Stream Processing (Sub-second Latency)",
      "Store-and-Forward Edge Buffering (72-hour WAN Disconnection Tolerance)",
      "Distributed Sensor Fleet Telemetry (40,000+ Concurrent Nodes)",
      "Automated Guided Vehicle (AGV) & Robotics Software Dispatch Engines"
    ],
    aiAndDataEngineering: [
      "Time-Series Forecasting & Inventory Replenishment AI",
      "Vector Search & Retrieval-Augmented Generation (Qdrant, pgvector)",
      "Route Optimization & Algorithmic Fleet Dispatch",
      "Distributed Big Data (PostgreSQL, Snowflake, ClickHouse, Redis)",
      "Autonomous Decision Intelligence & Agentic Workflow Systems"
    ],
    securityAndCompliance: [
      "SOC 2 Type II Certified Delivery Operations",
      "ISO 27001 & ISO 9001 Audited Security and Quality Protocols",
      "Zero-Trust Network Access (ZTNA) & Strict IAM Policies",
      "SIEM Tool Integration (Splunk, Elastic, Sentinel)",
      "Data Sovereignty & Cross-Border Regulatory Guardrails"
    ]
  },
  deliveryCapabilities: {
    benchSize: "85+ Senior Cloud Architects, IoT Engineers, and Security Specialists",
    contractSweetSpot: "$2,500,000 to $10,000,000 USD",
    certifications: [
      "ISO 27001",
      "SOC 2 Type II",
      "AWS Premier Tier Partner",
      "Google Cloud Managed Services Partner",
      "SAP Certified Integration Specialist"
    ],
    deliveryModel: "Phased Milestone Transformation (Phase 1: Architecture & PoC; Phase 2: Core Platform; Phase 3-4: Scale)"
  },
  outOfScopeDomains: [
    "Physical hardware casting, robotics chassis manufacturing (we develop software/firmware/telemetry only)",
    "Deep space orbital propulsion hardware (we provide ground data systems only)",
    "Consumer retail logistics trucking fleet ownership"
  ],
  valueProposition: "We bridge legacy enterprise infrastructure (SAP, AS/400, on-prem databases) with modern cloud, edge IoT, and AI-driven automation without operational disruption."
};

/**
 * Formatted company profile string for LLM council prompts
 */
export function getFormattedCompanyProfile(): string {
  return `
ORGANIZATION: ${OUR_COMPANY.name}
VALUE PROPOSITION: ${OUR_COMPANY.valueProposition}
SWEET SPOT: ${OUR_COMPANY.deliveryCapabilities.contractSweetSpot} (${OUR_COMPANY.deliveryCapabilities.benchSize})
CERTIFICATIONS: ${OUR_COMPANY.deliveryCapabilities.certifications.join(', ')}

CORE TECHNICAL CAPABILITIES:
• Cloud & Infrastructure: ${OUR_COMPANY.techStack.cloudAndInfrastructure.join(', ')}
• ERP & Integration: ${OUR_COMPANY.techStack.erpAndEnterpriseIntegration.join(', ')}
• IoT & Edge Systems: ${OUR_COMPANY.techStack.iotAndEdgeTelemetry.join(', ')}
• Applied AI & Algorithms: ${OUR_COMPANY.techStack.aiAndDataEngineering.join(', ')}
• Security & Compliance: ${OUR_COMPANY.techStack.securityAndCompliance.join(', ')}

OUT-OF-SCOPE BOUNDARIES (Requires Partner/Subcontractor or No-Bid):
• ${OUR_COMPANY.outOfScopeDomains.join('\n• ')}
`.trim();
}

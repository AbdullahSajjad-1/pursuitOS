import os
import shutil
from fpdf import FPDF

class ProfessionalRFP(FPDF):
    def __init__(self, title, company_name, domain, color_rgb=(20, 60, 110)):
        super().__init__()
        self.rfp_title = title
        self.company_name = company_name
        self.domain = domain
        self.primary_color = color_rgb

    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "B", 9)
            self.set_text_color(100, 100, 100)
            self.cell(0, 8, f"{self.company_name} ({self.domain}) | {self.rfp_title}", 0, 1, "R")
            self.set_draw_color(220, 220, 220)
            self.line(10, 18, 200, 18)
            self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(130, 130, 130)
        self.set_draw_color(220, 220, 220)
        self.line(10, 282, 200, 282)
        self.cell(0, 10, f"Confidential & Proprietary - {self.company_name}  |  Page {self.page_no()}", 0, 0, "C")

    def cover_page(self, subtitle, contact_name, contact_role, contact_email, date_str, budget_str):
        self.add_page()
        self.ln(25)
        
        # Decorative top bar
        r, g, b = self.primary_color
        self.set_fill_color(r, g, b)
        self.rect(10, 30, 190, 4, "F")
        self.ln(15)

        # Title
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(r, g, b)
        self.cell(0, 12, "REQUEST FOR PROPOSAL (RFP)", 0, 1, "L")

        self.set_font("Helvetica", "B", 16)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 9, self.rfp_title)
        self.ln(4)

        self.set_font("Helvetica", "", 12)
        self.set_text_color(90, 90, 90)
        self.multi_cell(0, 6, subtitle)
        self.ln(20)

        # Meta Box
        self.set_fill_color(248, 249, 250)
        self.set_draw_color(220, 225, 230)
        self.rect(10, 105, 190, 80, "DF")
        
        self.set_xy(16, 112)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(r, g, b)
        self.cell(0, 6, "ISSUING ORGANIZATION & KEY DETAILS", 0, 1, "L")
        self.ln(2)

        fields = [
            ("Issuing Entity:", f"{self.company_name} ({self.domain})"),
            ("Primary Contact:", f"{contact_name}, {contact_role}"),
            ("Direct Inquiries:", contact_email),
            ("Publication Date:", date_str),
            ("Estimated Contract Value:", budget_str),
            ("Procurement Protocol:", "Competitive Sealed Proposal (Phase-Gate Evaluation)")
        ]

        for label, val in fields:
            self.set_x(16)
            self.set_font("Helvetica", "B", 9)
            self.set_text_color(60, 60, 60)
            self.cell(50, 6, label, 0, 0, "L")
            self.set_font("Helvetica", "", 9)
            self.set_text_color(40, 40, 40)
            self.cell(0, 6, val, 0, 1, "L")

        self.ln(25)
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(110, 110, 110)
        self.multi_cell(0, 5, 
            "NOTICE: The information contained in this Request for Proposal is confidential and proprietary to "
            f"{self.company_name}. By accepting this document, prospective vendors agree to hold all technical "
            "architectures, commercial terms, and proprietary data in strict confidence under non-disclosure provisions."
        )

    def add_section(self, number_title, paragraphs):
        r, g, b = self.primary_color
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(r, g, b)
        self.cell(0, 9, number_title, 0, 1, "L")
        self.ln(1)

        self.set_font("Helvetica", "", 10)
        self.set_text_color(45, 45, 45)
        for p in paragraphs:
            self.multi_cell(0, 5.5, p)
            self.ln(3)
        self.ln(4)


RFPS_CONFIG = [
    {
        "filename": "vertex_cloud_rfp.pdf",
        "company": "Vertex Cloud Solutions",
        "domain": "vertex.com",
        "title": "Global Cloud Migration & Infrastructure Modernization",
        "subtitle": "Enterprise multi-cloud architecture transition across AWS and Azure",
        "contact_name": "Sarah Chen",
        "contact_role": "Chief Technology Officer",
        "contact_email": "sarah.chen@vertex.com",
        "date": "October 2026",
        "budget": "$4,500,000 USD",
        "color": (16, 75, 140),
        "sections": [
            ("1. Executive Summary & Objective", [
                "Vertex Cloud Solutions operates high-traffic software platforms serving over 12 million active users globally. Over the past five years, rapid scaling resulted in fragmented on-premises data centers across North America and Europe.",
                "The objective of this RFP is to select a premier systems integrator to orchestrate the migration of 80% of legacy core workloads into a secure, multi-cloud environment (AWS & Microsoft Azure) within an 18-month phased schedule."
            ]),
            ("2. Core Technical & Architecture Scope", [
                "- Multi-Cloud Networking: Design an automated hub-and-spoke transit network with low-latency interconnects between AWS US-East and Azure East-US regions.",
                "- Zero-Downtime Database Migration: Migrate 500+ TB of PostgreSQL and distributed Cassandra clusters with strict downtime limitations under 15 minutes per shard.",
                "- Containerization: Standardize over 120 internal microservices onto managed Kubernetes (EKS and AKS) with GitOps automation via ArgoCD.",
                "- Disaster Recovery: Active-active cross-region failover achieving RPO < 10 seconds and RTO < 5 minutes."
            ]),
            ("3. Security, Governance & Compliance Mandates", [
                "- Mandatory SOC 2 Type II and ISO 27001 continuous compliance monitoring.",
                "- Implementation of zero-trust network access (ZTNA) with mTLS between all service communication channels.",
                "- Encryption at rest using customer-managed KMS keys with FIPS 140-2 Level 3 HSM backing."
            ]),
            ("4. Vendor Eligibility & Evaluation Criteria", [
                "- Minimum 5 years of certified tier-1 cloud consulting with demonstrable migrations over 10,000 workloads.",
                "- Mandatory AWS Premier Tier Services Partner and Microsoft Solutions Partner designations.",
                "- Proposals must provide dedicated senior cloud architects on-site during cutover weekends."
            ]),
            ("5. Commercial Structure & Submission Timeline", [
                "- Proposals due: November 15, 2026 at 17:00 EST to sarah.chen@vertex.com.",
                "- Contract Model: Hybrid Milestone-based Fixed Price with SLA performance incentives."
            ])
        ]
    },
    {
        "filename": "meridian_cyber_rfp.pdf",
        "company": "Meridian Global",
        "domain": "meridian.net",
        "title": "Enterprise Cyber Defense & Threat Intelligence Platform",
        "subtitle": "Next-generation SOC automation, XDR integration, and 24/7 managed detection",
        "contact_name": "Marcus Vance",
        "contact_role": "Chief Information Security Officer",
        "contact_email": "marcus.vance@meridian.net",
        "date": "October 2026",
        "budget": "$5,200,000 USD",
        "color": (160, 30, 30),
        "sections": [
            ("1. Executive Summary & Problem Statement", [
                "Meridian Global is an international financial communications clearinghouse. In response to heightened nation-state threat actor activity targeting financial institutions, Meridian is issuing this RFP to procure a comprehensive Cyber Defense & Threat Intelligence Platform.",
                "We previously completed a $350k SIEM review and now require complete platform execution to overhaul security operations, telemetry correlation, and incident remediation."
            ]),
            ("2. Scope of Requirements & Capabilities", [
                "- Real-Time Behavioral Threat Detection: ML-driven detection capable of processing 180,000 EPS (events per second) across endpoints, identity, and cloud logs.",
                "- SIEM & SOAR Integration: Bi-directional ingestion and playbook execution with Splunk Enterprise Security and Palo Alto Cortex XSOAR.",
                "- Autonomous Containment: Sub-30-second automated host isolation and API token revocation upon confirmed high-confidence credential compromise.",
                "- Threat Intelligence: Ingestion of commercial and proprietary STIX/TAXII threat feeds with automated IOC correlation."
            ]),
            ("3. Non-Negotiable Compliance & Disqualification Factors", [
                "- Data Sovereignty: All log storage, indexing, and processing MUST reside strictly within EU and US boundaries. Offshore analysis is an immediate contractual disqualifier.",
                "- Regulatory Frameworks: Full adherence to NYDFS Part 500, GDPR Article 32, and DORA (Digital Operational Resilience Act).",
                "- Insurance: Vendor must demonstrate a current $50M Cyber Liability and Errors & Omissions policy."
            ]),
            ("4. Submission Instructions", [
                "- Complete proposals must be submitted electronically to marcus.vance@meridian.net by December 1, 2026.",
                "- Shortlisted vendors will participate in a 48-hour live red-team/blue-team sandbox evaluation."
            ])
        ]
    },
    {
        "filename": "acme_supplychain_rfp.pdf",
        "company": "Acme Corporation",
        "domain": "acme.com",
        "title": "Next-Gen Autonomous Supply Chain & IoT Logistics Modernization",
        "subtitle": "Real-time edge telemetry, warehouse AGV dispatching, and ERP modernization",
        "contact_name": "David Miller",
        "contact_role": "VP of Global Procurement",
        "contact_email": "david.miller@acme.com",
        "date": "October 2026",
        "budget": "$6,200,000 USD",
        "color": (180, 90, 10),
        "sections": [
            ("1. Program Overview", [
                "Acme Corporation produces industrial heavy equipment across 28 manufacturing facilities worldwide. To eliminate supply bottlenecks and optimize working capital, Acme is commissioning a modern Autonomous Supply Chain Execution Platform.",
                "The system must bridge edge sensors across factories, automated guided vehicles (AGVs) in distribution centers, and our centralized enterprise systems."
            ]),
            ("2. Functional & Architecture Requirements", [
                "- ERP Integration: Native bidirectional connector with SAP S/4HANA Cloud and legacy AS/400 inventory databases.",
                "- Edge IoT Stream Processing: Ingest telemetry from 45,000 IoT sensors (MQTT/OPC-UA) with sub-second latency for conveyor diversion.",
                "- Warehouse AGV Fleet Dispatch: Algorithmic route dispatch for 300+ automated warehouse robotics units.",
                "- Demand Forecasting: AI predictive replenishment engine reducing inventory holding costs by 15%."
            ]),
            ("3. Critical Operational Constraints", [
                "- High Availability: 99.995% uptime during manufacturing operations (24/7/365).",
                "- Offline Resilience: Factory floor edge nodes must continue autonomous production buffering for up to 72 hours during WAN disconnection.",
                "- ISO 9001 and ISO 27001 certified delivery pipeline."
            ]),
            ("4. Evaluation & Submission", [
                "- Submit comprehensive responses by November 30, 2026 to david.miller@acme.com.",
                "- Requires fixed-fee pricing for Phase 1 (Core Platform) and unit-rate pricing for factory rollouts."
            ])
        ]
    },
    {
        "filename": "nexus_kubernetes_rfp.pdf",
        "company": "Nexus Technologies",
        "domain": "nexustech.io",
        "title": "Multi-Tenant Kubernetes Security & Zero-Trust Service Mesh",
        "subtitle": "Cloud-native workload runtime security, Istio service mesh, and GitOps policy enforcement",
        "contact_name": "Elena Rostova",
        "contact_role": "Head of Infrastructure & DevOps",
        "contact_email": "elena.rostova@nexustech.io",
        "date": "October 2026",
        "budget": "$2,800,000 USD",
        "color": (90, 40, 150),
        "sections": [
            ("1. Background & Scope", [
                "Nexus Technologies delivers high-concurrency developer tooling and API platforms. Our production fleet spans 60+ Kubernetes clusters hosting thousands of microservices.",
                "This RFP seeks a specialized partner to design and deploy an enterprise-wide Zero-Trust Service Mesh and Container Runtime Security framework."
            ]),
            ("2. Technical Specifications", [
                "- Istio Service Mesh: Universal mutual TLS (mTLS), fine-grained Layer 7 authorization policies, and automated certificate rotation.",
                "- Runtime Threat Detection: eBPF-powered continuous security monitoring (Falco / Cilium Tetragon) with zero overhead on pod CPU.",
                "- GitOps Policy Enforcement: Open Policy Agent (OPA) / Kyverno gatekeeper admission controllers integrated into GitHub Actions and ArgoCD.",
                "- Vulnerability Lifecycle: Automatic container image vulnerability remediation and SBOM (Software Bill of Materials) tracking."
            ]),
            ("3. Compliance & Performance KPIs", [
                "- Latency Overhead: Added service mesh latency must not exceed 1.5ms at p99.",
                "- Compliance: Full audit mapping for SOC 2 Type II, PCI-DSS Level 1, and CIS Kubernetes Benchmarks."
            ]),
            ("4. Proposal Deadlines", [
                "- Proposals due: December 10, 2026 to elena.rostova@nexustech.io.",
                "- Expected kickoff: January 15, 2027 with a 9-month delivery timetable."
            ])
        ]
    },
    {
        "filename": "omnicyber_threatintel_rfp.pdf",
        "company": "OmniCyber Defense",
        "domain": "omnicyber.com",
        "title": "AI-Powered Autonomous Threat Intelligence & PenTesting Suite",
        "subtitle": "Automated adversary emulation, continuous vulnerability discovery, and dark web intelligence",
        "contact_name": "Nathan Drake",
        "contact_role": "VP of Threat Intelligence",
        "contact_email": "nathan.drake@omnicyber.com",
        "date": "October 2026",
        "budget": "$5,000,000 USD",
        "color": (190, 20, 50),
        "sections": [
            ("1. Objective", [
                "OmniCyber Defense protects critical infrastructure and government aerospace contractors. We require an Autonomous Threat Intelligence & Continuous Automated Penetration Testing (BAS/CART) system.",
                "The solution must proactively identify external attack surfaces, emulate sophisticated adversaries (APT28, APT29, Lazarus), and validate defensive control efficacy."
            ]),
            ("2. Core Technical Capabilities", [
                "- Autonomous Red Teaming: Safe, non-destructive breach-and-attack simulation (BAS) mapped to MITRE ATT&CK Enterprise v14 matrix.",
                "- External Attack Surface Management (EASM): Continuous asset discovery for unmanaged IP ranges, forgotten subdomains, and exposed cloud buckets.",
                "- Dark Web & Credential Monitoring: Real-time discovery of leaked employee credentials, compromised session tokens, and discussion on illicit forums.",
                "- Executive Reporting: Automated risk scorecards with remediation playbooks for executive leadership and engineering teams."
            ]),
            ("3. Mandatory Certifications", [
                "- Must support CMMC Level 3 and NIST SP 800-171 compliance verification.",
                "- All testing agents must support cryptographically signed audit logs for legal defensibility."
            ]),
            ("4. Submission Instructions", [
                "- Send proposals to nathan.drake@omnicyber.com by December 15, 2026.",
                "- Proof of Concept: Shortlisted vendors must run a non-destructive scan against a designated test perimeter."
            ])
        ]
    },
    {
        "filename": "fintech_corebanking_rfp.pdf",
        "company": "FinTech Global Systems",
        "domain": "fintechsystems.com",
        "title": "Ultra-Low Latency Core Banking Engine & AI Fraud Scoring",
        "subtitle": "High-throughput transaction ledger with real-time fraud mitigation and active-active resilience",
        "contact_name": "Priya Patel",
        "contact_role": "Chief Risk Officer",
        "contact_email": "priya.patel@fintechsystems.com",
        "date": "October 2026",
        "budget": "$8,500,000 USD",
        "color": (15, 100, 60),
        "sections": [
            ("1. Executive Summary", [
                "FinTech Global Systems processes over $40 Billion in annual transactional payments across 14 sovereign jurisdictions. We are embarking on our flagship core modernization to implement an ultra-low latency core transaction ledger with sub-5 millisecond AI fraud classification."
            ]),
            ("2. System Architecture Requirements", [
                "- Throughput & Latency: Sustained 35,000 TPS (transactions per second) with p99 response times strictly below 5ms.",
                "- Streaming Pipeline: Distributed event streaming utilizing Apache Kafka and Flink with exactly-once processing guarantees.",
                "- AI Fraud Scoring: Real-time neural scoring evaluating 200+ transactional and biometric signals prior to ledger commitment.",
                "- Zero Data Loss: Synchronous multi-region replication with zero recovery point objective (RPO = 0)."
            ]),
            ("3. Regulatory & Legal Mandates", [
                "- PCI-DSS v4.0 Level 1 compliance is mandatory prior to production certification.",
                "- Federal Reserve FedLine and SWIFT ISO 20022 messaging compatibility.",
                "- Immutable cryptographic audit log verifying all ledger state mutations."
            ]),
            ("4. Procurement Timeline", [
                "- Responses due: December 5, 2026 to priya.patel@fintechsystems.com.",
                "- Contract Award: January 2027 for a multi-year phased rollout."
            ])
        ]
    },
    {
        "filename": "healthpulse_telehealth_rfp.pdf",
        "company": "HealthPulse Solutions",
        "domain": "healthpulse.org",
        "title": "Enterprise Telehealth Platform & HIPAA-Compliant EHR Interoperability",
        "subtitle": "Bi-directional Epic/Cerner FHIR sync, encrypted patient streaming, and clinician workflow",
        "contact_name": "Dr. James Wilson",
        "contact_role": "Chief Medical Information Officer",
        "contact_email": "james.wilson@healthpulse.org",
        "date": "October 2026",
        "budget": "$4,000,000 USD",
        "color": (20, 120, 130),
        "sections": [
            ("1. Program Overview", [
                "HealthPulse Solutions is a healthcare network serving 42 hospitals and over 350 outpatient clinics. To expand access to specialized care, we are issuing this RFP for an enterprise-wide Telehealth and EHR Interoperability Hub."
            ]),
            ("2. Key Capabilities", [
                "- HL7 FHIR Interoperability: Bi-directional real-time record exchange with Epic Systems, Oracle Cerner, and legacy MEDITECH EHRs.",
                "- WebRTC Patient Consultations: Low-bandwidth resilient video consults with end-to-end encryption (AES-256) and automated in-consult clinical transcription.",
                "- Patient Identity Verification: Biometric and photo ID verification with insurance eligibility checks in real-time.",
                "- Multi-Language Support: Real-time translation supporting 18 languages with medical terminology fidelity."
            ]),
            ("3. Privacy, Compliance & Security", [
                "- Full HIPAA and HITECH Act compliance with signed Business Associate Agreement (BAA).",
                "- Strict prohibition against using protected health information (PHI) for training external AI models.",
                "- SOC 2 Type II and HITRUST CSF certification required."
            ]),
            ("4. Submission Deadlines", [
                "- Submissions close: November 25, 2026 to james.wilson@healthpulse.org.",
                "- Clinical validation and vendor demonstrations scheduled for December 2026."
            ])
        ]
    },
    {
        "filename": "vanguard_predictive_dispatch_rfp.pdf",
        "company": "Vanguard Logistics",
        "domain": "vanguardlogistics.com",
        "title": "AI Predictive Fleet Routing & Telematics Optimization System",
        "subtitle": "Real-time dispatch optimization, fuel reduction algorithms, and dynamic driver workflow",
        "contact_name": "Robert Taylor",
        "contact_role": "Director of Supply Chain Technology",
        "contact_email": "robert.taylor@vanguardlogistics.com",
        "date": "October 2026",
        "budget": "$3,400,000 USD",
        "color": (50, 70, 90),
        "sections": [
            ("1. Executive Summary", [
                "Vanguard Logistics operates a North American fleet of 4,200 long-haul tractor-trailers and urban delivery vehicles. Fuel and idle times represent our primary variable operating expenditures.",
                "We are procuring a next-generation AI Dynamic Dispatch and Fleet Routing System to optimize carrier routes in real time based on weather, traffic, and dock scheduling."
            ]),
            ("2. Functional Scope", [
                "- Dynamic Route Re-Optimization: Re-calculate multi-stop routes within 10 seconds of traffic or weather anomaly detection.",
                "- Hardware Telematics Ingestion: Integration with Geotab, Samsara, and Omnitracs ELD hardware.",
                "- Driver Mobile Application: Offline-first iOS and Android navigation application with automated proof-of-delivery (e-POD) signature capture.",
                "- Fuel Reduction Target: Must demonstrate measurable 8-12% decrease in aggregate fleet fuel consumption within 6 months."
            ]),
            ("3. Operational Availability & SLA", [
                "- System availability guarantee of 99.98% during operational delivery hours.",
                "- 24/7/365 dedicated tier-3 technical support with maximum 15-minute response for critical dispatch outages."
            ]),
            ("4. Response Deadline", [
                "- Proposals due: December 8, 2026 to robert.taylor@vanguardlogistics.com."
            ])
        ]
    },
    {
        "filename": "titan_satellite_telemetry_rfp.pdf",
        "company": "Titan Aerospace",
        "domain": "titanaerospace.com",
        "title": "Secure Satellite Telemetry Processing & FedRAMP High Cloud Hub",
        "subtitle": "Mission-critical LEO satellite telemetry ingestion, ITAR compliance, and radiation-hardened edge computing",
        "contact_name": "Amanda Holloway",
        "contact_role": "VP of Government Contracts",
        "contact_email": "amanda.holloway@titanaerospace.com",
        "date": "October 2026",
        "budget": "$12,000,000 USD",
        "color": (25, 45, 80),
        "sections": [
            ("1. Mission Overview", [
                "Titan Aerospace manufactures defense-grade low-earth orbit (LEO) satellite constellations. Under prime defense contracts, Titan is establishing a resilient, sovereign Ground Segment & Telemetry Cloud Processing Hub.",
                "The selected vendor will architect the ingestion pipeline, data lakehouse, and automated anomaly detection platform for satellite downlink telemetry."
            ]),
            ("2. Rigorous Security & Sovereign Mandates", [
                "- Strict FedRAMP High Authorization and DoD Impact Level 5 (IL5) compliance.",
                "- International Traffic in Arms Regulations (ITAR) adherence: All supporting personnel MUST be verified US citizens on US soil.",
                "- Post-Quantum Cryptography: Implementation of NIST-approved quantum-resistant encryption algorithms for satellite ground station uplinks."
            ]),
            ("3. Engineering & Ingestion Performance", [
                "- Sustained 50 Gbps downlink stream processing during orbital flyovers.",
                "- Real-time orbital mechanics modeling and collision avoidance calculation with NORAD space catalog data.",
                "- Zero data drop SLA: Redundant multi-region satellite ground station ingest."
            ]),
            ("4. Submission Instructions", [
                "- Submit cleared technical proposals by December 20, 2026 to amanda.holloway@titanaerospace.com.",
                "- Facility security clearance (FCL) verification required prior to receiving annex technical appendices."
            ])
        ]
    },
    {
        "filename": "beacon_vector_ai_rfp.pdf",
        "company": "Beacon Data Intelligence",
        "domain": "beacondata.ai",
        "title": "Real-Time Enterprise Vector Search & Autonomous LLM Infrastructure",
        "subtitle": "Billion-scale embedding retrieval, private VPC fine-tuning, and multi-tenant agent execution",
        "contact_name": "Liam O'Connor",
        "contact_role": "Chief Data Officer",
        "contact_email": "liam.oconnor@beacondata.ai",
        "date": "October 2026",
        "budget": "$3,800,000 USD",
        "color": (20, 90, 110),
        "sections": [
            ("1. Project Summary", [
                "Beacon Data Intelligence powers enterprise semantic discovery and generative AI knowledge engines for Fortune 500 corporations. We are expanding our core infrastructure to support billion-scale vector indices and autonomous multi-agent reasoning pipelines."
            ]),
            ("2. Technical & Scaling Requirements", [
                "- Billion-Scale Vector Indexing: Distributed HNSW / ScaNN vector indexing supporting 2+ billion high-dimensional embeddings with <20ms p99 query latency.",
                "- Private VPC Deployment: Complete customer isolation with zero data egress to public model APIs.",
                "- Dynamic Re-ranking: Hybrid sparse/dense retrieval combining BM25 and neural cross-encoders.",
                "- Agentic Orchestration: Low-latency framework for hosting autonomous reasoning agents with memory caching and tool-use verification."
            ]),
            ("3. Governance & Performance Guarantees", [
                "- SOC 2 Type II, ISO 27001, and ISO 42001 (Artificial Intelligence Management System) compliance.",
                "- Complete role-based access control (RBAC) ensuring documents retain access permissions down to paragraph chunks."
            ]),
            ("4. Timeline & Proposal Submission", [
                "- Submit technical proposals and benchmark proof to liam.oconnor@beacondata.ai by November 28, 2026.",
                "- Benchmarking bake-off scheduled for early December 2026."
            ])
        ]
    }
]

def generate_all():
    os.makedirs("rfps", exist_ok=True)
    print(f"Generating {len(RFPS_CONFIG)} professional RFP PDFs...")

    for cfg in RFPS_CONFIG:
        pdf = ProfessionalRFP(
            title=cfg["title"],
            company_name=cfg["company"],
            domain=cfg["domain"],
            color_rgb=cfg["color"]
        )

        pdf.cover_page(
            subtitle=cfg["subtitle"],
            contact_name=cfg["contact_name"],
            contact_role=cfg["contact_role"],
            contact_email=cfg["contact_email"],
            date_str=cfg["date"],
            budget_str=cfg["budget"]
        )

        pdf.add_page()
        for num_title, paras in cfg["sections"]:
            pdf.add_section(num_title, paras)

        output_path = os.path.join("rfps", cfg["filename"])
        pdf.output(output_path)
        print(f"✓ Generated {output_path}")

        # Also copy to root directory for immediate drag-and-drop convenience
        root_path = cfg["filename"]
        shutil.copyfile(output_path, root_path)
        print(f"  → Copied to {root_path}")

    print("\n🎉 All 10 RFPs generated successfully in both ./rfps/ and workspace root!")

if __name__ == "__main__":
    generate_all()

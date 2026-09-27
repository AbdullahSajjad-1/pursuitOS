import os
from fpdf import FPDF

class RFPGenerator(FPDF):
    def header(self):
        # Arial bold 15
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(40, 40, 40)
        # Title
        if hasattr(self, 'rfp_title'):
            self.cell(0, 10, self.rfp_title, 0, 1, "R")
        self.ln(10)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(128)
        # Page number
        self.cell(0, 10, f"Page {self.page_no()}", 0, 0, "C")

    def chapter_title(self, title):
        # Arial 12
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(0, 51, 102)
        self.cell(0, 10, title, 0, 1, "L")
        self.ln(4)

    def chapter_body(self, body):
        # Times 12
        self.set_font("Helvetica", "", 11)
        self.set_text_color(50, 50, 50)
        # Output justified text
        self.multi_cell(0, 6, body)
        # Line break
        self.ln(8)

    def add_section(self, title, body):
        self.chapter_title(title)
        self.chapter_body(body)


def generate_vertex_rfp():
    pdf = RFPGenerator()
    pdf.rfp_title = "Vertex Solutions: Global Cloud Migration RFP"
    pdf.add_page()
    
    # Title Page
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(0, 51, 102)
    pdf.cell(0, 40, "Request for Proposal", 0, 1, "C")
    
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 20, "Global Cloud Migration & Enterprise Modernization", 0, 1, "C")
    
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, "Issued by: Vertex Cloud Solutions (vertex.com)", 0, 1, "C")
    pdf.cell(0, 10, "Primary Contact: Alice Johnson, CTO (alice@vertex.com)", 0, 1, "C")
    pdf.cell(0, 10, "Date: October 2026", 0, 1, "C")
    
    pdf.ln(30)
    pdf.set_font("Helvetica", "I", 11)
    pdf.multi_cell(0, 6, "CONFIDENTIAL & PROPRIETARY. This document contains trade secrets and confidential information of Vertex Solutions. Reproduction or distribution is strictly prohibited.")
    
    pdf.add_page()
    
    pdf.add_section("1. Executive Summary", 
        "Vertex Solutions is seeking proposals from qualified vendors to lead a global cloud migration initiative. "
        "As a leader in cloud-native infrastructure, Vertex aims to transition 80% of its legacy on-premise workloads "
        "to a multi-cloud environment (AWS and Azure) over the next 18 months. The selected partner will be responsible "
        "for architectural design, execution, and post-migration optimization. The total budget allocated for this initiative "
        "is $4.5M USD."
    )
    
    pdf.add_section("2. Project Scope & Requirements", 
        "1. Cloud Architecture: Design a scalable, highly available multi-cloud architecture.\n"
        "2. Security & Compliance: Must adhere to SOC 2 Type II and ISO 27001 standards. Zero-trust architecture is mandatory.\n"
        "3. Data Migration: Seamless migration of 500TB of relational and unstructured data with less than 15 minutes of downtime.\n"
        "4. Training: Vendor must provide extensive upskilling sessions for Vertex's internal DevOps team.\n"
        "5. SLAs: 99.999% uptime guarantee during the critical migration windows."
    )
    
    pdf.add_section("3. Vendor Qualifications", 
        "Vendors must possess a minimum of 5 years of experience in enterprise cloud migrations. "
        "Demonstrable success in migrating workloads exceeding 10,000 instances is required. "
        "Partnership tiers (e.g., AWS Premier Tier, Microsoft Gold Partner) will be heavily weighted in the evaluation process."
    )
    
    pdf.add_section("4. Submission Guidelines & Deadlines", 
        "All proposals must be submitted electronically to alice@vertex.com no later than November 15, 2026. "
        "Late submissions will not be reviewed. Please include pricing models (Time & Materials vs. Fixed Price) "
        "and a detailed 18-month Gantt chart."
    )

    pdf.output("vertex_cloud_rfp.pdf")


def generate_meridian_rfp():
    pdf = RFPGenerator()
    pdf.rfp_title = "Meridian Global: Cyber Defense Overhaul RFP"
    pdf.add_page()
    
    # Title Page
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(150, 30, 30)
    pdf.cell(0, 40, "Request for Proposal", 0, 1, "C")
    
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 20, "Enterprise Cyber Defense & Threat Intelligence", 0, 1, "C")
    
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 10, "Issued by: Meridian Global (meridian.net)", 0, 1, "C")
    pdf.cell(0, 10, "Primary Contact: Bob Smith, CISO (bob@meridian.net)", 0, 1, "C")
    pdf.cell(0, 10, "Date: October 2026", 0, 1, "C")
    
    pdf.ln(30)
    pdf.set_font("Helvetica", "I", 11)
    pdf.multi_cell(0, 6, "CONFIDENTIAL & PROPRIETARY. This document contains trade secrets and confidential information of Meridian Global. Reproduction or distribution is strictly prohibited.")
    
    pdf.add_page()
    
    pdf.add_section("1. Executive Summary", 
        "Meridian Global operates in the highly regulated financial sector. Due to emerging geopolitical threats and "
        "an increase in sophisticated ransomware attacks, Meridian is issuing this RFP to procure a next-generation "
        "Cyber Defense and Threat Intelligence platform. We require a holistic solution that covers endpoint detection, "
        "network traffic analysis, and automated incident response. The engagement is targeted to begin Q1 2027."
    )
    
    pdf.add_section("2. Project Scope & Requirements", 
        "1. Threat Detection: Real-time anomaly detection utilizing AI/ML models.\n"
        "2. Integration: Must integrate natively with our existing Splunk SIEM and CrowdStrike deployments.\n"
        "3. Compliance: Strict adherence to GDPR, CCPA, and NYDFS cybersecurity regulations.\n"
        "4. Data Sovereignty: All log data must remain within the EU and US jurisdictions; offshore data processing is strictly forbidden.\n"
        "5. Automated Response: SOAR capabilities to automatically isolate compromised hosts within 30 seconds."
    )
    
    pdf.add_section("3. Critical Blockers & Risks", 
        "Please note: Due to regulatory constraints, Meridian Global cannot accept solutions that route traffic "
        "through non-approved international data centers. Additionally, the vendor must provide proof of $50M in "
        "cyber liability insurance. Failure to meet these two requirements will result in immediate disqualification."
    )
    
    pdf.add_section("4. Submission Guidelines & Deadlines", 
        "Proposals must be emailed to bob@meridian.net by December 1, 2026. "
        "Shortlisted vendors will be invited for a 2-day technical proof of concept (POC) in our London headquarters."
    )

    pdf.output("meridian_cyber_rfp.pdf")


if __name__ == "__main__":
    generate_vertex_rfp()
    generate_meridian_rfp()
    print("Generated vertex_cloud_rfp.pdf and meridian_cyber_rfp.pdf")
